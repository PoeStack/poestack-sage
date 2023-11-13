// noinspection JSUnusedGlobalSymbols

import App from './App'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { ECHO_ROUTER, EchoPluginHook } from 'echo-common'

function start() {
  ECHO_ROUTER.registerRoute({
    plugin: 'example-log-plugin-stash',
    path: 'main',
    page: App,
    navItems: [{ location: 'l-sidebar-m', icon: DocumentTextIcon }]
  })
}

function destroy() {
  ECHO_ROUTER.removeRoute('example-log-plugin-stash')
}

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
