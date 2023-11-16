import { bind } from '@react-rxjs/core'
import { APP_CONTEXT } from './echo-context-factory'

const [usePlugins] = bind(APP_CONTEXT.plugins.currentPlugins$, {})

export const PluginSettingsPage = () => {
  const pluginMap = usePlugins()
  const plugins = Object.values(pluginMap)

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
            {plugins?.length &&
              plugins.map((plugin) => (
                <tr key={plugin.key}>
                  <td>{plugin.manifest?.name}</td>
                  <td>{plugin.manifest?.version}</td>
                  {!plugin.path && <td onClick={() => APP_CONTEXT.plugins.installPlugin(plugin)}>Install</td>}
                  <td className="text-center">
                    <input
                      type="checkbox"
                      id={`${plugin.manifest?.name}-enabled`}
                      name="enabled"
                      checked={!!plugin.enabled}
                      onChange={() => APP_CONTEXT.plugins.togglePlugin(plugin)}
                    />
                  </td>
                </tr>
              ))}
            {!plugins?.length && (
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
