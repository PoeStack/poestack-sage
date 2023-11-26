import { bind } from '@react-rxjs/core'
import { APP_CONTEXT } from '../echo-context-factory'
import { useTranslation } from 'react-i18next'

const [usePlugins] = bind(APP_CONTEXT.plugins.currentPlugins$, {})

export const PluginSettingsPage = () => {
  const { t } = useTranslation()
  const pluginMap = usePlugins()
  const plugins = Object.values(pluginMap)

  return (
    <>
      <div className="p-4 w-full h-full overflow-y-scroll">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h1 className="font-semibold text-primary-accent">{t('title.pluginsTableTitle')}</h1>
          </div>
        </div>
        <div className="pt-4 flex-row flex w-full">
          <table className="bg-secondary-surface table-auto border-separate border-spacing-3 text-left">
            <thead>
              <tr className="">
                <th>{t('label.pluginName')}</th>
                <th>{t('label.version')}</th>
                <th>{t('label.enabled')}</th>
              </tr>
            </thead>
            <tbody>
              {(plugins || []).length > 0 &&
                plugins.map((plugin) => (
                  <tr key={plugin.key}>
                    <td>{plugin.manifest?.name}</td>
                    <td>{plugin.manifest?.version}</td>
                    {!plugin.path && (
                      <td onClick={() => APP_CONTEXT.plugins.installPlugin(plugin)}>Install</td>
                    )}
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
              {(plugins || []).length === 0 && (
                <tr>
                  <td>{t('label.noPluginsInstalled')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
