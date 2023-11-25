import { EchoPluginHook, EchoRoute } from 'echo-common'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import App from '.'
import { ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { ECHO_CONTEXT_SERVICE } from 'echo-common'
// Top level extend usable in all modules
dayjs.extend(utc)
dayjs.extend(relativeTime)

export function context() {
  return ECHO_CONTEXT_SERVICE.context('plugin')
}

const pluginRoute = (): EchoRoute => ({
  plugin: 'networth',
  path: 'networth',
  page: App,
  navItems: [{ displayname: 'Networth', location: 'l-sidebar-m', icon: ArchiveBoxIcon }]
})

const start = () => {
  // TODO: hydrate all from sqlite tables
  // applySnapshot(rootStore, {})

  context().router.registerRoute(pluginRoute())
}

const destroy = () => {
  context().router.unregisterRoute(pluginRoute())
}

export default function (): EchoPluginHook {
  return {
    start: start,
    destroy: destroy
  }
}
