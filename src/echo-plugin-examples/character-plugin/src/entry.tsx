// noinspection JSUnusedGlobalSymbols

import App from './App'
import { UsersIcon } from '@heroicons/react/24/outline'
import { ECHO_ROUTER, EchoPluginHook } from 'echo-common'

function start() {
  ECHO_ROUTER.registerRoute({
    plugin: 'example-characters',
    path: 'main',
    page: App,
    navItems: [{ location: 'l-sidebar-m', icon: UsersIcon }]
  })
}

function destroy() {}

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
