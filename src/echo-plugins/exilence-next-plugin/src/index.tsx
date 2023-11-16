import React from 'react'
import localForage from 'localforage'
import { RootStore } from './store/rootStore'
import { ArchiveBoxIcon, Cog8ToothIcon } from '@heroicons/react/24/outline'
import { ECHO_ROUTER } from 'echo-common'
import NetWorth from './routes/net-worth/NetWorth'
import { create } from 'mobx-persist'
import { configure } from 'mobx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const configureMobx = () => {
  configure({ enforceActions: 'observed' })
}

export let rootStore = new RootStore()

const RootStoreContext = React.createContext<RootStore>({} as RootStore)

export function useStores() {
  return React.useContext(RootStoreContext)
}

type Props = {
  error?: Error
}

const App = ({ error }: Props) => {
  return (
    <RootStoreContext.Provider value={rootStore}>
      <NetWorth />
    </RootStoreContext.Provider>
  )
}

function registerRoute(error?: Error) {
  ECHO_ROUTER.registerRoute({
    plugin: 'exilence-next',
    path: 'networth',
    page: <App error={error} />,
    navItems: [{ location: 'l-sidebar-m', icon: ArchiveBoxIcon }]
  })
}

export const start = () => {
  // Init all stuff
  configureMobx()

  localForage.config({
    name: 'exilence-next-db',
    driver: localForage.INDEXEDDB
  })

  localForage.setItem
  localForage.getItem
  localForage.removeItem

  // TODO: Write to sqlite
  const hydrate = create({
    storage: {
      setItem<T>(
        key: string,
        value: T,
        callback?: ((err: any, value: T) => void) | undefined
      ): Promise<T> {
        console.log('SetItem: ', key, value)
        return localForage.setItem(key, value, callback)
      },
      getItem<T>(
        key: string,
        callback?: ((err: any, value: T | null) => void) | undefined
      ): Promise<T | null> {
        console.log('GetItem: ', key)
        return localForage.getItem(key, callback)
      },
      removeItem(key: string, callback?: ((err: any) => void) | undefined): Promise<void> {
        console.log('RemoveItem: ', key)
        return localForage.removeItem(key, callback)
      }
    },
    jsonify: true
  })

  Promise.all([hydrate('account', rootStore.accountStore)])
    .then(() => {
      rootStore.accountStore.initSession()
      registerRoute()
    })
    .catch((err: Error) => {
      registerRoute(err)
    })
}

export function destroy() {}
