import { ECHO_CONTEXT_SERVICE, EchoPluginHook, EchoRoute } from 'echo-common'
export function context(){
  return ECHO_CONTEXT_SERVICE.context("plugin")
}

// noinspection JSUnusedGlobalSymbols

import App from './App'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

const pluginRoute: EchoRoute = {
  plugin: 'example-log-plugin-stash',
  path: 'main',
  page: App,
  navItems: [{ location: 'l-sidebar-m', icon: DocumentTextIcon }]
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
