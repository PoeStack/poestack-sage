import { BehaviorSubject, Subject, scan, tap } from "rxjs"
import { HttpUtil } from "sage-common"
import fs from "fs"
import { EchoPluginHook } from "./echo-plugin-hook"
import { ECHO_DIR } from "./echo-dir-service"
import path from "path"

export type EchoPluginManifest = { name: string, version: string, echoCommonVersion: string }

export type EchoPlugin = { manifest: EchoPluginManifest, path?: string | undefined, enabled?: boolean | undefined, hook?: EchoPluginHook | undefined }

export class EchoPluginService {

  private httpUtil = new HttpUtil()

  public plugins$ = new Subject<EchoPlugin>()
  public currentPlugins$ = new BehaviorSubject<{ [key: string]: EchoPlugin }>({})

  constructor() {
    this.plugins$.subscribe((p) => {
      if (p.enabled && !p.hook) {
        console.log("loading", p.path)
        const pluginEntry = module.require(p.path!!)
        console.log("loaded", pluginEntry)
        const hook: EchoPluginHook = pluginEntry()
        p.hook = hook
        p.hook.start()
        this.plugins$.next(p)
      }

      if (!p.enabled && p.hook) {
        p.hook.destroy()
        p.hook = undefined
        p.enabled = false
        this.plugins$.next(p)
      }
    })

    this.plugins$.pipe(
      tap((e) => console.log("plugin-event", e)),
      scan((acc, v) => {
        return {...acc, [v.manifest.name]: v}
      }, this.currentPlugins$.value)
    ).subscribe(this.currentPlugins$)
  }

  public togglePlugin(plugin: EchoPlugin) {
    this.plugins$.next({...plugin, enabled: !plugin.enabled})
  }

  public installPlugin(plugin: EchoPlugin) {
    return this.httpUtil.get<string>(`https://raw.githubusercontent.com/PoeStack/poestack-sage/published-plugins/dist_plugins/${plugin.manifest.name}.js`)
      .subscribe((resp) => {
        fs.writeFileSync(path.resolve(ECHO_DIR.homeDirPath, "plugins", `${plugin.manifest.name}.js`), resp)
        this.loadInstalledPlugins()
      })
  }

  public loadInstalledPlugins() {
    fs.readdir(path.resolve(ECHO_DIR.homeDirPath, "plugins"), (err, files) => {
      files.forEach((file) => {
        const pluginName = file.slice(0, -3)
        const plugin = this.currentPlugins$.value[pluginName]
        console.log("file", file, pluginName, plugin)
        if (plugin) {
          plugin.path = path.resolve(ECHO_DIR.homeDirPath, "plugins", file)
          this.plugins$.next(plugin)
        }
      })
    })
  }

  public loadPlugins() {
    this.httpUtil.get<{ [key: string]: EchoPluginManifest }>("https://raw.githubusercontent.com/PoeStack/poestack-sage/published-plugins/public/plugins.json")
      .subscribe((resp) => {
        Object.values(resp).forEach((e) => {
          this.plugins$.next({ manifest: e })
        })
        this.loadInstalledPlugins()
      })
  }
}

export const ECHO_PLUGIN_SERVICE = new EchoPluginService()

