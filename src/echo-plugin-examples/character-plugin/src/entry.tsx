// noinspection JSUnusedGlobalSymbols
import { lazy } from 'react';
const App = lazy(() => import("./App"))
import { UsersIcon } from '@heroicons/react/24/outline'
import { EchoContext, EchoPluginHook, EchoRoute } from 'echo-common'


export var CONTEXT: EchoContext

function start(context: EchoContext) {
  CONTEXT = context
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
  CONTEXT.router.registerRoute(pluginRoute)
}

function destroy() {
}

export default function(): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}

// export { App }
