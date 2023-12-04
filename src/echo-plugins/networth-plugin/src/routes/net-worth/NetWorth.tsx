import { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import ToolbarContainer from '../../components/Toolbar/ToolbarContainer'
import NetWorthCard from '../../components/cards/NetWorthCard'
import ItemTableContainer from '../../components/ItemTable/ItemTableContainer'

const NetWorth = () => {
  const { accountStore, uiStateStore } = useStore()

  useEffect(() => {
    accountStore.initSession()
  }, [accountStore])

  return (
    <div className="flex flex-col h-full w-full">
      <ToolbarContainer />
      <main className="flex flex-col p-2 gap-4">
        <div className="grow">
          <NetWorthCard />
        </div>
        <div className="flex flex-row">
          <ItemTableContainer />
        </div>
        {/* <Test /> */}
      </main>
    </div>
  )
}

const Test = observer(() => {
  const { accountStore, uiStateStore } = useStore()
  return (
    <>
      <button
        className="h-10 px-6 font-semibold rounded-full bg-violet-600 text-white mb-1"
        onClick={() => {
          uiStateStore.fillTree()
        }}
      >
        fillTree
      </button>
      <br />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          uiStateStore.testReferences()
        }}
      >
        testReferences
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
        onClick={() => {
          accountStore.initSession()
        }}
      >
        InitSession
      </button>
      <br />
      Accounts:
      <ul>
        {accountStore.accounts.map((acccount) => {
          return <li key={acccount.name}>{acccount!.name}</li>
        })}
      </ul>
      <br />
      Active account: {accountStore.activeAccount.name}
      <br />
      Profiles in account: {accountStore.activeAccount.name}
      <ul>
        {accountStore.activeAccount.profiles.map((profile) => {
          return <li key={profile.name}>{profile.name}</li>
        })}
      </ul>
      <br />
      Active Profile: {accountStore.activeAccount.activeProfile?.name}
      <br />
      Active League: {accountStore.activeAccount.activeProfile?.activeLeague?.name}
      <br />
      Active Price-League: {accountStore.activeAccount.activeProfile?.activePriceLeague?.name}
      <br />
      Active Character: {accountStore.activeAccount.activeProfile?.activeCharacter?.name}
      <br />
      Active Stash-Tabs:{' '}
      {accountStore.activeAccount.activeProfile?.activeStashTabs?.map((st) => st.name).join(', ')}
    </>
  )
})

export default observer(NetWorth)
