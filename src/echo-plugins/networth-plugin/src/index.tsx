import React from 'react'
import NetWorth from './routes/net-worth/NetWorth'
import { RootStore } from './store/rootStore'
import { StoreContext } from './context/store'
import { applySnapshot, getSnapshot, registerRootStore, onSnapshot } from 'mobx-keystone'

export function createRootStore() {
  const rootStore = new RootStore({})
  // although not strictly required, it is always a good idea to register your root stores
  // as such, since this allows the model hook `onAttachedToRootStore` to work and other goodies
  registerRootStore(rootStore)

  onSnapshot(rootStore, (sn) => {
    console.log(sn)
  })

  // we can also connect the store to the redux dev tools
  // const remotedev = require('remotedev')
  // const connection = remotedev.connectViaExtension({
  //   name: 'Test account'
  // })

  // connectReduxDevTools(remotedev, connection, rootStore)

  return rootStore
}

export const store = createRootStore()

// @ts-ignore
window.rootStore = store

const App = () => {
  return (
    <StoreContext.Provider value={store}>
      <NetWorth />
    </StoreContext.Provider>
  )
}

export default App

/**
  Save / Restore the state of the store while self module is hot reloaded
*/
const module = {
  hot: (import.meta as any).hot
}
if (module.hot) {
  if (module.hot.data && module.hot.data.store) {
    applySnapshot(store, module.hot.data.store)
  }
  module.hot.dispose((data: any) => {
    data.store = getSnapshot(store)
  })
}
