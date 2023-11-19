import React from 'react'
import localForage from 'localforage'
import { ArchiveBoxIcon, Cog8ToothIcon } from '@heroicons/react/24/outline'
import { ECHO_CONTEXT_SERVICE, EchoPluginHook, EchoRoute } from 'echo-common'
import NetWorth from './routes/net-worth/NetWorth'
import { create } from 'mobx-persist'
import { configure, observable } from 'mobx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import { RootStore } from './mst-store/rootStore'
import { Provider } from 'mobx-react'
import { getSnapshot, onAction, onPatch, onSnapshot } from 'mobx-state-tree'
dayjs.extend(utc)
dayjs.extend(relativeTime)

export function context() {
  return ECHO_CONTEXT_SERVICE.context('plugin')
}

const configureMobx = () => {
  configure({ enforceActions: 'observed' })
}

type IRootStore = ReturnType<typeof RootStore.create>
let rootStore: IRootStore

const history = {
  snapshots: observable.array([], { deep: false }),
  actions: observable.array([], { deep: false }),
  patches: observable.array([], { deep: false })
}

const App = () => {
  return (
    <Provider value={rootStore} history={history}>
      <NetWorth />
    </Provider>
  )
}

const pluginRoute = (): EchoRoute => ({
  plugin: 'exilence-next',
  path: 'networth',
  page: App,
  navItems: [{ location: 'l-sidebar-m', icon: ArchiveBoxIcon }]
})

export const start = () => {
  // Init all stuff
  configureMobx()

  localForage.config({
    name: 'exilence-next-db',
    driver: localForage.INDEXEDDB
  })

  rootStore = RootStore.create(
    {},
    {
      alert: (m) => console.log(m) // Noop for demo: window.alert(m)
    }
  )

  context().router.registerRoute(pluginRoute())

  // ---------------

  // @ts-ignore
  window.rootStore = rootStore // for playing around with the console

  /**
   * Poor man's effort of "DevTools" to demonstrate the api:
   */

  let recording = true // supress recording history when replaying

  onSnapshot(
    rootStore,
    (s) =>
      recording &&
      history.snapshots.unshift({
        data: s,
        replay() {
          recording = false
          applySnapshot(shop, this.data)
          recording = true
        }
      })
  )
  onPatch(
    rootStore,
    (s) =>
      recording &&
      history.patches.unshift({
        data: s,
        replay() {
          recording = false
          applyPatch(shop, this.data)
          recording = true
        }
      })
  )
  onAction(
    rootStore,
    (s) =>
      recording &&
      history.actions.unshift({
        data: s,
        replay() {
          recording = false
          applyAction(shop, this.data)
          recording = true
        }
      })
  )

  // // add initial snapshot
  // history.snapshots.push({
  //   data: getSnapshot(shop),
  //   replay() {
  //     // TODO: DRY
  //     recording = false
  //     applySnapshot(shop, this.data)
  //     recording = true
  //   }
  // })
}

export function destroy() {
  context().router.unregisterRoute(pluginRoute())
}
