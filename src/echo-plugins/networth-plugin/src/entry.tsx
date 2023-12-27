import { EchoPluginHook, EchoRoute } from 'echo-common'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import App from '.'
import { ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { context } from './context'
// Top level extend usable in all modules
dayjs.extend(utc)
dayjs.extend(relativeTime)

const pluginRoute = (): EchoRoute => ({
  plugin: 'networth',
  path: 'networth',
  page: App,
  navItems: [{ displayname: 'Networth', location: 'l-sidebar-m', icon: ArchiveBoxIcon }]
})

const start = () => {
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
