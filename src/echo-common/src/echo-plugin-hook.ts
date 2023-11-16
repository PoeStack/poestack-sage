import { EchoContext } from "./echo-context"

export type EchoPluginHook = {
  start: (context: EchoContext) => void
  destroy: () => void
}
