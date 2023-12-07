import { ECHO_CONTEXT_SERVICE } from 'echo-common'

export function context() {
  return ECHO_CONTEXT_SERVICE.context('plugin')
}
