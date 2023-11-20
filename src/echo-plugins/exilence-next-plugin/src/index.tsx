import React from 'react'
import NetWorth from './routes/net-worth/NetWorth'
import { Store } from './mst-store/rootStore'
import { StoreContext } from './context/store'
import { applySnapshot, getSnapshot } from 'mobx-state-tree'

export const store = Store.create({})

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
