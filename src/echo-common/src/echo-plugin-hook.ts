import { PluginContext } from "./plugin-context"

export type EchoPluginHook = {
  start: (pluginContext: PluginContext) => void
  destroy: () => void
}
