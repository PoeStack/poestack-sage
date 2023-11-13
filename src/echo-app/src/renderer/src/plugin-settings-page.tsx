import React, { useEffect, useState } from 'react'

import {
  ECHO_PLUGIN_CONFIG,
  EchoPluginConfig,
  EchoPluginConfigs,
  EchoPluginHook
} from 'echo-common'
import * as path from 'path'
import { importDevPlugin } from './dev-plugins'

function filterPluginsByEnv(pluginConfigs: EchoPluginConfigs) {
  return import.meta.env.MODE === 'development'
    ? Object.values(pluginConfigs).filter((config) => config.name.endsWith('-dev'))
    : Object.values(pluginConfigs).filter((config) => !config.name.endsWith('-dev'))
}

async function getPlugin(pluginConfig: EchoPluginConfig): Promise<EchoPluginHook> {
  if (import.meta.env.MODE === 'development') {
    const entry = await importDevPlugin(pluginConfig.name)
    console.log(JSON.stringify(entry))
    return entry.default()
  } else {
    const p = path.resolve(pluginConfig.path)
    const entry = module.require(p)
    const plugin: EchoPluginHook = entry()
    return plugin
  }
}

export const PluginSettingsPage: React.FC = () => {
  useEffect(() => {
    setAvailablePlugins(filterPluginsByEnv(ECHO_PLUGIN_CONFIG.loadPluginConfigs()))
  }, [])

  async function handleEnablePlugin(pluginConfig: EchoPluginConfig) {
    const pluginConfigs = ECHO_PLUGIN_CONFIG.loadPluginConfigs()
    pluginConfigs[pluginConfig.name].enabled = true
    const plugin = await getPlugin(pluginConfig)
    plugin.start()
    const updatedConfigs = ECHO_PLUGIN_CONFIG.writePluginConfigs(pluginConfigs)
    setAvailablePlugins(filterPluginsByEnv(updatedConfigs))
  }

  async function handleDisablePlugin(pluginConfig: EchoPluginConfig) {
    const pluginConfigs = ECHO_PLUGIN_CONFIG.loadPluginConfigs()
    pluginConfigs[pluginConfig.name].enabled = false
    const plugin = await getPlugin(pluginConfig)
    plugin.destroy()
    const updatedConfigs = ECHO_PLUGIN_CONFIG.writePluginConfigs(pluginConfigs)
    setAvailablePlugins(filterPluginsByEnv(updatedConfigs))
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
