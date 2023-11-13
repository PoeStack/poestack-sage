import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { bind } from '@react-rxjs/core'
import { ECHO_ROUTER, EchoPluginHook } from 'echo-common'
import { EchoRoute } from 'echo-common/dist/cjs/echo-router'
import fs from 'fs'
import os from 'os'
import * as path from 'path'
import React, { useEffect } from 'react'
import { ProfilePage } from './profile-page'
import { getDevPlugins } from './dev-plugins'

const [useCurrentRoute] = bind(ECHO_ROUTER.currentRoute$)
const [useCurrentRoutes] = bind(ECHO_ROUTER.routes$)

export const PluginPage: React.FC = () => {
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      const imports = getDevPlugins()
      imports.forEach((prom) => {
        prom.then((entry) => {
          const plugin: EchoPluginHook = entry.default()
          plugin.start()
        })
      })
    } else {
      function loadPlugins(baseDir: string) {
        fs.readdir(baseDir, (err, files) => {
          if (err) {
            return console.log('Unable to scan directory: ' + err)
          }
          files.forEach(function (file) {
            if (file.endsWith('.js')) {
              const p = path.resolve(baseDir, file)
              const entry = module.require(p)
              const plugin: EchoPluginHook = entry?.()
              plugin?.start()
            }
          })
        })
      }
      let pluginDir = path.resolve(os.homedir(), 'poestack-sage', 'plugins')
      if (import.meta.env.RENDERER_VITE_PLUGIN_PATH) {
        pluginDir = path.resolve('..', '..', import.meta.env.RENDERER_VITE_PLUGIN_PATH)
      }
      loadPlugins(pluginDir)
    }
  }, [])

  return (
    <>
      <div className="w-12 drop-shadow-md h-full top-7 fixed flex flex-col bg-secondary-surface items-center px-2 pt-2 pb-9 justify-center gap-2">
        <RouterIconNavigator location="l-sidebar-m" />
        <div className="flex-1 border-gray-500 w-full border-b-2"></div>
        <RouterIconNavigator location="l-sidebar-b" />
      </div>
      <div className="ml-12 pb-7 pt-7 h-full">
        <PluginBody />
      </div>
    </>
  )
}

  const [availablePlugins, setAvailablePlugins] = useState<EchoPluginConfig[]>([])

  return (
    <>
      <div className="w-full h-full overflow-y-scroll flex flex-row">
        <div className="basis-1/4"></div>
        <div className="flex flex-row">
          <div className="flex flex-col">
            <div>Plugins</div>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-col">
            {availablePlugins?.length > 0 &&
              availablePlugins.map((plugin) => (
                <div key={plugin.name} className="flex flex-row">
                  <div className="flex flex-col">{plugin.name}</div>
                  <div className="flex flex-col">{plugin.version}</div>
                  <div className="flex flex-col">{plugin.enabled}</div>
                  {plugin.enabled && (
                    <button onClick={() => handleDisablePlugin(plugin)}>Disable</button>
                  )}
                  {!plugin.enabled && (
                    <button onClick={() => handleEnablePlugin(plugin)}>Enable</button>
                  )}
                </div>
              ))}
          </div>
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
