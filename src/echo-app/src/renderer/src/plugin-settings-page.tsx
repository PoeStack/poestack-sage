import React, { useEffect, useState } from 'react'

import { ECHO_PLUGIN_CONFIG, EchoPluginConfig, EchoPluginHook } from 'echo-common'
import * as path from 'path'

export const PluginPage: React.FC = () => {
  useEffect(() => {
    setAvailablePlugins(Object.values(ECHO_PLUGIN_CONFIG.loadPluginConfig()))
  }, [])

  function handleEnablePlugin(pluginConfig: EchoPluginConfig) {
    const pluginConfigs = ECHO_PLUGIN_CONFIG.loadPluginConfig()
    pluginConfigs[pluginConfig.name].enabled = true
    const p = path.resolve(pluginConfig.path)
    const entry = module.require(p)
    const plugin: EchoPluginHook = entry()
    plugin.start()
    const updatedConfigs = ECHO_PLUGIN_CONFIG.writePluginConfig(pluginConfigs)
    setAvailablePlugins(Object.values(updatedConfigs))
  }

  function handleDisablePlugin(pluginConfig: EchoPluginConfig) {
    const pluginConfigs = ECHO_PLUGIN_CONFIG.loadPluginConfig()
    pluginConfigs[pluginConfig.name].enabled = false
    const p = path.resolve(pluginConfig.path)
    const entry = module.require(p)
    console.log('entry', entry)
    const plugin: EchoPluginHook = entry()
    plugin.destroy()
    const updatedConfigs = ECHO_PLUGIN_CONFIG.writePluginConfig(pluginConfigs)
    setAvailablePlugins(Object.values(updatedConfigs))
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
