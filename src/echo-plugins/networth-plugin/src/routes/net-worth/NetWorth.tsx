import React from 'react'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { Toolbar } from '../../components/Toolbar/Toolbar'

const NetWorth = () => {
  const store = useStore()

  return (
    <div className="relative flex flex-col h-full w-full">
      <Toolbar />
      <main className="flex-row p-2">
        <button
          className="h-10 px-6 font-semibold rounded-full bg-violet-600 text-white mb-1"
          onClick={() => {
            store?.uiStateStore.fillTree()
          }}
        >
          fillTree
        </button>
        <br />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
          onClick={() => {
            store?.uiStateStore.testReferences()
          }}
        >
          testReferences
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
          onClick={() => {
            store?.accountStore.initSession()
          }}
        >
          InitSession
        </button>
        <br />
        Accounts:
        <ul>
          {store?.accountStore.accounts.map((acccount) => {
            return <li key={acccount.name}>{acccount!.name}</li>
          })}
        </ul>
        <br />
        Active account: {store?.accountStore.activeAccount?.name}
        <br />
        Profiles in account: {store?.accountStore.activeAccount?.name}
        <ul>
          {store?.accountStore.activeAccount?.profiles.map((profile) => {
            return <li key={profile.name}>{profile.name}</li>
          })}
        </ul>
        <br />
        Active Profile: {store?.accountStore.activeAccount?.activeProfile?.name}
        <br />
        Active League: {store?.accountStore.activeAccount?.activeProfile?.activeLeague?.name}
        <br />
        Active Price-League:{' '}
        {store?.accountStore?.activeAccount?.activeProfile?.activePriceLeague?.name}
        <br />
        Active Character: {store?.accountStore.activeAccount?.activeProfile?.activeCharacter?.name}
        <br />
        Active Stash-Tabs:{' '}
        {store?.accountStore.activeAccount?.activeProfile?.activeStashTabs
          ?.map((st) => st.name)
          .join(', ')}
      </main>
    </div>
  )
}

export default observer(NetWorth)
