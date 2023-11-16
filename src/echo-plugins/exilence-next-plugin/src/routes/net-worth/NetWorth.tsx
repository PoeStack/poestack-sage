import React from 'react'
import { observer } from 'mobx-react'
import { useStores } from '../..'

const NetWorth = () => {
  const { accountStore } = useStores()
  const firstAccount = accountStore.activeAccount
  return (
    <>
      <button
        onClick={() => {
          accountStore.addOrUpdateAccount('Test')
        }}
      >
        CreateAccount
      </button>
      <br />
      <button
        onClick={() => {
          firstAccount?.increment()
        }}
      >
        Increment
      </button>
      <div>{firstAccount?.name}</div>
      <div>{firstAccount?.counter}</div>
    </>
  )
}

export default observer(NetWorth)
