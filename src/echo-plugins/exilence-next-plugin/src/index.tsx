import React from 'react'
import localForage from 'localforage'
import { ArchiveBoxIcon, Cog8ToothIcon } from '@heroicons/react/24/outline'
import { ECHO_CONTEXT_SERVICE, EchoPluginHook, EchoRoute } from 'echo-common'
import NetWorth from './routes/net-worth/NetWorth'
import { create } from 'mobx-persist'
import { configure, observable } from 'mobx'

import { Store, IStore } from './mst-store/rootStore'
import { Provider } from 'mobx-react'
import {
  applyAction,
  applyPatch,
  applySnapshot,
  getSnapshot,
  onAction,
  onPatch,
  onSnapshot
} from 'mobx-state-tree'

export function context() {
  return ECHO_CONTEXT_SERVICE.context('plugin')
}

const configureMobx = () => {
  configure({ enforceActions: 'observed' })
}

let store: IStore
const StoreContext = React.createContext<IStore>({} as IStore)

export function useStore() {
  return React.useContext(StoreContext)
}

const App = () => {
  return (
    <StoreContext.Provider value={store}>
      <NetWorth />
    </StoreContext.Provider>
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

  store = Store.create({})

  // applySnapshot(rootStore, {})

  context().router.registerRoute(pluginRoute())

  // ---------------

  // @ts-ignore
  window.rootStore = store // for playing around with the console

  /**
   * Poor man's effort of "DevTools" to demonstrate the api:
   */

  // let recording = true // supress recording history when replaying

  // onSnapshot(
  //   rootStore,
  //   (s) => {

  //   }
  //     // @ts-ignore
  //     // history.snapshots.unshift({
  //     //   data: s,
  //     //   replay() {
  //     //     recording = false
  //     //     // @ts-ignore
  //     //     applySnapshot(rootStore, this.data)
  //     //     recording = true
  //     //   }
  //     // })
  // )
  // onPatch(
  //   rootStore,
  //   (s) =>
  //     recording &&
  //     // @ts-ignore
  //     history.patches.unshift({
  //       data: s,
  //       replay() {
  //         recording = false
  //         // @ts-ignore
  //         applyPatch(rootStore, this.data)
  //         recording = true
  //       }
  //     })
  // )
  // onAction(
  //   rootStore,
  //   (s) =>
  //     recording &&
  //     // @ts-ignore
  //     history.actions.unshift({
  //       data: s,
  //       replay() {
  //         recording = false
  //         // @ts-ignore
  //         applyAction(rootStore, this.data)
  //         recording = true
  //       }
  //     })
  // )

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
