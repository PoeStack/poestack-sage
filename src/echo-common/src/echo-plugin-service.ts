import { BehaviorSubject, Subject, scan, tap } from 'rxjs'
import { HttpUtil } from 'sage-common'
import fs from 'fs'
import { EchoPluginHook } from './echo-plugin-hook'
import path from 'path'
import { EchoDirService } from './echo-dir-service'
import { EchoContext } from './echo-context'
import { ECHO_CONTEXT_SERVICE } from './echo-context-service'

export type EchoPluginManifest = { name: string; version: string; echoCommonVersion: string }

export type EchoPlugin = {
  key: string
  manifest?: EchoPluginManifest | undefined
  path?: string | undefined
  enabled?: boolean | undefined
  hook?: EchoPluginHook | undefined
}

export class EchoPluginService {
  private installedPluginsPath = path.resolve(this.echoDir.homeDirPath, 'plugins')
  private httpUtil = new HttpUtil()

  public plugins$ = new Subject<EchoPlugin>()
  public currentPlugins$ = new BehaviorSubject<{ [key: string]: EchoPlugin }>({})

  constructor(
    private echoDir: EchoDirService,
    private buildContext: (source: string) => EchoContext
  ) {
    this.plugins$
      .pipe(
        tap((e) => console.log('plugin-event', e)),
        scan((acc, v) => {
          return { ...acc, [v.key]: { ...acc[v.key], ...v } }
        }, this.currentPlugins$.value)
      )
      .subscribe(this.currentPlugins$)

    this.currentPlugins$.subscribe((e) => {
      Object.values(e).forEach((p) => {
        if (p.enabled && p.path && !p.hook) {
          this.persistEnabledPlugins()
          const context = buildContext('plugin')
          ECHO_CONTEXT_SERVICE.contexts['plugin'] = context

          const pluginEntry = module.require(p.path)
          const hook: EchoPluginHook = pluginEntry()
          hook.start()
          this.plugins$.next({ key: p.key, hook: hook })
        }

        if (!p.enabled && p.hook) {
          this.persistEnabledPlugins()
          p.hook.destroy()
          this.plugins$.next({ key: p.key, hook: undefined })
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

  public installPlugin(plugin: EchoPlugin) {
    return this.httpUtil
      .get<string>(
        `https://raw.githubusercontent.com/PoeStack/poestack-sage/published-plugins/dist_plugins/${
          plugin.manifest!!.name
        }.js`
      )
      .subscribe((resp) => {
        fs.writeFileSync(path.resolve(this.installedPluginsPath, `${plugin.key}.js`), resp)
        this.loadInstalledPlugins()
      })
  }

  public loadInstalledPlugins() {
    fs.readdir(this.installedPluginsPath, (err, files) => {
      files.forEach((file) => {
        const pluginKey = file.slice(0, -3)
        const pluginPath = path.resolve(this.installedPluginsPath, file)
        this.plugins$.next({ key: pluginKey, path: pluginPath })
      })
    })
  }

  public loadPlugins() {
    this.loadEnabledPlugins()
    this.httpUtil
      .get<{ [key: string]: EchoPluginManifest }>(
        'https://raw.githubusercontent.com/PoeStack/poestack-sage/published-plugins/public/plugins.json'
      )
      .subscribe((resp) => {
        Object.values(resp).forEach((e) => {
          this.plugins$.next({ key: e.name, manifest: e })
        })
        this.loadInstalledPlugins()
      })
  }
}
