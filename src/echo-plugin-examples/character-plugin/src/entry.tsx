import { ECHO_CONTEXT_SERVICE, EchoPluginHook, EchoRoute } from 'echo-common'
export function context() {
  return ECHO_CONTEXT_SERVICE.context('plugin')
}

// noinspection JSUnusedGlobalSymbols
import { UsersIcon } from '@heroicons/react/24/outline'
import App from './App'

const pluginRoute: EchoRoute = {
  plugin: 'example-characters',
  path: 'main',
  page: App,
  navItems: [
    {
      location: 'l-sidebar-m',
      icon: UsersIcon
    }
  ]
}

function start() {
  context().router.registerRoute(pluginRoute)
}

function destroy() {
  context().router.unregisterRoute(pluginRoute)
}

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
