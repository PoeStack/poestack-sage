import React from 'react'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'

const NetWorth = () => {
  const store = useStore()

  return (
    <>
      {/* <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          uiStateStore?.increment()
        }}
      >
        Increment
      </button> */}
      <br />
      <button
        className="h-10 px-6 font-semibold rounded-full bg-violet-600 text-white mb-1"
        onClick={() => {
          store?.uiStateStore.addAccount()
        }}
      >
        addAccount
      </button>
      <br />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          store?.uiStateStore.addAccountToActiveAccountStore()
        }}
      >
        addAccountToActiveAccountStore
      </button>
      <br />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          store?.uiStateStore.addProfileToActiveAccount()
        }}
      >
        addProfileToActiveAccount
      </button>
      <br />
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
      Active profile: {store?.accountStore.activeAccount?.activeProfile?.name}
      {/* <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          uiStateStore?.subscribtion()
        }}
      >
        Subscribtion increment
      </button> */}
      {/* <div>{uiStateStore?.counter}</div> */}
    </>
  )
}

export default observer(NetWorth)
