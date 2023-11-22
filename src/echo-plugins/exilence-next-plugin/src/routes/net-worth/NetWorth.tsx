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
        {/* <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          uiStateStore?.increment()
        }}
      >
        Increment
      </button> */}
        {/* <br />
      <button
        className="h-10 px-6 font-semibold rounded-full bg-violet-600 text-white mb-1"
        onClick={() => {
          store?.uiStateStore.addAccounts()
        }}
      >
        addAccounts
      </button>
      <br />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          store?.uiStateStore.replaceAccounts()
        }}
      >
        replaceAccounts
      </button>
      <br /> */}
        {/* <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          store?.uiStateStore.addProfileToActiveAccount()
        }}
      >
        addProfileToActiveAccount
      </button>
      <br /> */}
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
        {store?.accountStore.accounts.map((acccount) => {
          return (
            <ul>
              <li key={acccount.name}>{acccount!.name}</li>
            </ul>
          )
        })}
        <br />
        Active account: {store?.accountStore.activeAccount?.name}
        <br />
        Profiles in account: {store?.accountStore.activeAccount?.name}
        {store?.accountStore.activeAccount?.profiles.map((profile) => {
          return (
            <ul>
              <li key={profile.name}>{profile.name}</li>
            </ul>
          )
        })}
        <br />
        Active Profile: {store?.accountStore.activeAccount?.activeProfile?.name}
        <br />
        Active League: {store?.accountStore.activeAccount?.activeProfile?.activeLeague.id}
        <br />
        Active Price-League:{' '}
        {store?.accountStore.activeAccount?.activeProfile?.activePriceLeague.id}
        <br />
        Active Character: {store?.accountStore.activeAccount?.activeProfile?.activeCharacter?.id}
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
