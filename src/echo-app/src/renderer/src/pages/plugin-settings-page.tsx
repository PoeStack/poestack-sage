import { bind } from '@react-rxjs/core'
import { APP_CONTEXT } from '../echo-context-factory'
import { Button, Checkbox, Table } from 'echo-common/components-v1'
import { useTranslation } from 'react-i18next'

const [usePlugins] = bind(APP_CONTEXT.plugins.currentPlugins$, {})
console.log(APP_CONTEXT.plugins)
export const PluginSettingsPage = () => {
  const { t } = useTranslation()
  const pluginMap = usePlugins()
  const plugins = Object.values(pluginMap)
  const availablePlugins = plugins.filter((plugin) => !plugin.path)
  const installedPlugins = plugins.filter((plugin) => plugin.path)

  return (
    <div className="p-4 w-full h-full overflow-y-scroll">
      <div className="p-4 w-full max-h-1/2 overflow-y-scroll">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h1 className="font-semibold text-accent-foreground">
              {t('title.installedPluginsTitle')}
            </h1>
          </div>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('label.pluginName')}</Table.Head>
              <Table.Head>{t('label.pluginVersion')}</Table.Head>
              <Table.Head>{t('label.pluginStatus')}</Table.Head>
              <Table.Head>{t('label.pluginEnabled')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(installedPlugins || []).length > 0 &&
              plugins.map((plugin) => (
                <Table.Row key={plugin.key}>
                  <Table.Cell>{plugin.manifest?.name}</Table.Cell>
                  <Table.Cell>{plugin.manifest?.version}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      onClick={() => APP_CONTEXT.plugins.uninstallPlugin(plugin)}
                    >
                      {t('label.uninstallPlugin')}
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-row items-center justify-start">
                      <Checkbox
                        id={`${plugin.manifest?.name}-enabled`}
                        name="enabled"
                        checked={!!plugin.enabled}
                        onCheckedChange={() => APP_CONTEXT.plugins.togglePlugin(plugin)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            {(installedPlugins || []).length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={3}>{t('label.noPluginsInstalled')}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
      <div className="p-4 w-full h-1/2 overflow-y-scroll">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h1 className="font-semibold text-accent-foreground">
              {t('title.availablePluginsTitle')}
            </h1>
          </div>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('label.pluginName')}</Table.Head>
              <Table.Head>{t('label.pluginVersion')}</Table.Head>
              <Table.Head>{t('label.pluginStatus')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(availablePlugins || []).length > 0 &&
              availablePlugins.map((plugin) => (
                <Table.Row key={plugin.key}>
                  <Table.Cell>{plugin.manifest?.name}</Table.Cell>
                  <Table.Cell>{plugin.manifest?.version}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      onClick={() => APP_CONTEXT.plugins.installPlugin(plugin)}
                    >
                      {t('label.installPlugin')}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            {(availablePlugins || []).length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={3}>{t('label.noPluginsInstalled')}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}
