import { bind } from '@react-rxjs/core'
import { APP_CONTEXT } from '../echo-context-factory'
import { Input, Table } from 'echo-common/components-v1'

const [usePlugins] = bind(APP_CONTEXT.plugins.currentPlugins$, {})

export const PluginSettingsPage = () => {
  const pluginMap = usePlugins()
  const plugins = Object.values(pluginMap)

  return (
    <>
      <div className="p-4 w-full h-full overflow-y-scroll">
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h1 className="font-semibold text-accent-foreground">Plugins</h1>
          </div>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Plugin Name</Table.Head>
              <Table.Head>Version</Table.Head>
              <Table.Head>Enabled</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(plugins || []).length > 0 &&
              plugins.map((plugin) => (
                <Table.Row key={plugin.key}>
                  <Table.Cell>{plugin.manifest?.name}</Table.Cell>
                  <Table.Cell>{plugin.manifest?.version}</Table.Cell>
                  {!plugin.path && (
                    <Table.Cell onClick={() => APP_CONTEXT.plugins.installPlugin(plugin)}>
                      Install
                    </Table.Cell>
                  )}
                  <Table.Cell className="text-center">
                    <Input
                      type="checkbox"
                      id={`${plugin.manifest?.name}-enabled`}
                      name="enabled"
                      checked={!!plugin.enabled}
                      onChange={() => APP_CONTEXT.plugins.togglePlugin(plugin)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            {(plugins || []).length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={3}>No Plugins installed</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
        <div className="basis-1/4"></div>
      </div>
    </>
  )
}
