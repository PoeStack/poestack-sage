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
  return Object.values(pluginConfigs).filter(
    (config) => (import.meta.env.MODE === 'development') === config.name.endsWith('-dev')
  )
}

async function getPlugin(pluginConfig: EchoPluginConfig): Promise<EchoPluginHook> {
  if (import.meta.env.MODE === 'development') {
    const entry = await importDevPlugin(pluginConfig.name)
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

  async function handleTogglePlugin(pluginConfig: EchoPluginConfig) {
    const pluginConfigs = ECHO_PLUGIN_CONFIG.loadPluginConfigs()
    const pluginEnabled = pluginConfigs[pluginConfig.name].enabled
    const plugin = await getPlugin(pluginConfig)
    if (!pluginEnabled) {
      plugin.start()
    } else {
      plugin.destroy()
    }
    pluginConfigs[pluginConfig.name].enabled = !pluginEnabled
    const updatedConfigs = ECHO_PLUGIN_CONFIG.writePluginConfigs(pluginConfigs)
    setAvailablePlugins(filterPluginsByEnv(updatedConfigs))
  }

  const [availablePlugins, setAvailablePlugins] = useState<EchoPluginConfig[]>([])

  return (
    <>
      <div className="p-4 w-full h-full overflow-y-scroll">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h1 className="font-semibold text-primary-accent">Plugins</h1>
          </div>
        </div>
        <div className="pt-4 flex-row flex w-full">
          <table className="bg-secondary-surface table-auto border-separate border-spacing-3 text-left">
            <tr className="">
              <th>Plugin Name</th>
              <th>Version</th>
              <th>Enabled</th>
            </tr>
            {availablePlugins?.length > 0 &&
              availablePlugins.map((plugin) => (
                <tr key={plugin.name}>
                  <td>{plugin.name}</td>
                  <td>{plugin.version}</td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      id={`${plugin.name}-enabled`}
                      name="enabled"
                      checked={plugin.enabled}
                      onChange={() => handleTogglePlugin(plugin)}
                    />
                  </td>
                </tr>
              ))}
            {!availablePlugins?.length && (
              <tr>
                <td>No Plugins installed</td>
              </tr>
            )}
          </table>
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
