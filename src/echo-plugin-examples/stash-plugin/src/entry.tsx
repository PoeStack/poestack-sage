// noinspection JSUnusedGlobalSymbols

import App from './App'
import { ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { ECHO_ROUTER, EchoPluginHook, EchoRoute } from 'echo-common'

const pluginRoute: EchoRoute = {
  plugin: 'example-stash',
  path: 'main',
  page: App,
  navItems: [{ location: 'l-sidebar-m', icon: ArchiveBoxIcon }]
}

function start() {
  ECHO_ROUTER.registerRoute(pluginRoute)
}

function destroy() {
  ECHO_ROUTER.unregisterRoute(pluginRoute)
}

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
