import { BehaviorSubject, Subject, scan, tap } from 'rxjs'
import { HttpUtil } from 'sage-common'
import fs from 'fs'
import { EchoPluginHook } from './echo-plugin-hook'
import path from 'path'
import { EchoDirService } from './echo-dir-service'
import { EchoContext } from './echo-context'
import { ECHO_CONTEXT_SERVICE } from './echo-context-service'
import StreamZip from 'node-stream-zip'
import { LoggingService } from './logging-service'

export type EchoPluginManifest = { name: string; version: string; echoCommonVersion: string }

export type EchoPlugin = {
  key: string
  manifest?: EchoPluginManifest | undefined
  path?: string | undefined
  enabled?: boolean | undefined
  hook?: EchoPluginHook | undefined
}

export class EchoPluginService {
  private readonly PUBLISHED_PLUGINS_LIST_URL = 'https://raw.githubusercontent.com/PoeStack/poestack-sage/published-plugins/public/plugins.json';
  private readonly DIST_PLUGINS_URL = 'https://raw.githubusercontent.com/PoeStack/poestack-sage/published-plugins/dist_plugins';

  private installedPluginsPath = path.resolve(this.echoDir.homeDirPath, 'plugins')
  private httpUtil = new HttpUtil()

  public plugins$ = new Subject<EchoPlugin>()
  public currentPlugins$ = new BehaviorSubject<{ [key: string]: EchoPlugin }>({})

  constructor(
    private readonly echoDir: EchoDirService,
    private readonly loggingService: LoggingService,
    private readonly buildContext: (source: string) => EchoContext
  ) {
    this.plugins$
      .pipe(
        tap((e) => console.log('plugin-event', e)),
        scan((acc, v) => {
          return { ...acc, [v.key]: { ...acc[v.key], ...v } }
        }, this.currentPlugins$.value)
      )
      .subscribe(this.currentPlugins$)

    this.currentPlugins$.subscribe((plugins) => {
      Object.values(plugins).forEach((plugin) => {
        if (plugin.enabled && plugin.path && !plugin.hook) {
          this.persistEnabledPlugins()
          const context = buildContext('plugin')
          ECHO_CONTEXT_SERVICE.contexts['plugin'] = context

          const pluginEntry = module.require(path.resolve(plugin.path, 'entry.js'))
          const hook: EchoPluginHook = pluginEntry()

          hook.start()

          this.plugins$.next({ key: plugin.key, hook: hook })
        }

        if (!plugin.enabled && plugin.hook) {
          this.persistEnabledPlugins()
          plugin.hook.destroy()
          this.plugins$.next({ key: plugin.key, hook: undefined })
        }
      })
    })
  }

  public persistEnabledPlugins() {
    const enabledPluginKeys = Object.values(this.currentPlugins$.value)
      .filter((e) => e.enabled)
      .map((e) => e.key)
    this.echoDir.writeJson(['enabled_plugins'], enabledPluginKeys)
  }

  public loadEnabledPlugins() {
    const enabledPluginKeys: string[] = this.echoDir.loadJson('enabled_plugins') ?? []
    enabledPluginKeys.forEach((e) => {
      this.plugins$.next({ key: e, enabled: true })
    })
  }

  public togglePlugin(plugin: EchoPlugin) {
    this.plugins$.next({ key: plugin.key, enabled: !plugin.enabled })
  }

  private async handlePluginResponse(plugin: EchoPlugin, resp: string) {
    const pluginPath = path.resolve(this.installedPluginsPath, `${plugin.key}`)
    if (!fs.existsSync(pluginPath)) {
      const zipFilePath = path.resolve(pluginPath, `${plugin.key}.zip`)

      fs.mkdirSync(pluginPath)
      fs.writeFileSync(zipFilePath, resp)
      const pluginZip = new StreamZip.async({
        file: zipFilePath
      })
      await pluginZip.extract(null, pluginPath)
      await pluginZip.close()
      fs.unlinkSync(zipFilePath)
    }
  }

  public async installPlugin(plugin: EchoPlugin) {
    return this.httpUtil
      .get<string>(
        `${this.DIST_PLUGINS_URL}/${plugin.manifest!!.name}.zip`,
        // @ts-ignore
        { responseType: 'arraybuffer' }
      )
      .subscribe(async (resp) => {
        this.handlePluginResponse(plugin, resp)
        this.loadInstalledPlugins()
      })
  }

  public uninstallPlugin(plugin: EchoPlugin) {
    fs.rmdirSync(path.resolve(this.installedPluginsPath, `${plugin.key}`), {
      recursive: true
    })
    this.plugins$.next({ key: plugin.key, path: undefined, enabled: undefined })
    this.loadInstalledPlugins()
  }

  public loadInstalledPlugins() {
    fs.readdir(this.installedPluginsPath, (_, files) => {
      files.forEach((file) => {
        const pluginPath = path.resolve(this.installedPluginsPath, file)
        this.plugins$.next({ key: file, path: pluginPath })
      })
    })
  }

  public loadPlugins() {
    this.loadEnabledPlugins()
  
    this.httpUtil
      .get<{ [key: string]: EchoPluginManifest }>(this.PUBLISHED_PLUGINS_LIST_URL)
      .subscribe((resp) => {
        Object.values(resp).forEach((e) => this.plugins$.next({ key: e.name, manifest: e }))
        this.loadInstalledPlugins()
      })
  }
}
