import { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import ToolbarContainer from '../../components/Toolbar/ToolbarContainer'
import NetWorthChartCard from '../../components/Cards/NetWorthChartCard'
import ItemTableContainer from '../../components/ItemTable/ItemTableContainer'
import NetWorthSummaryCard from '../../components/Cards/NetWorthSummaryCard'
import IncomeSummaryCard from '../../components/Cards/IncomeSummaryCard'
import SnapshotSummaryCard from '../../components/Cards/SnapshotSummaryCard'
import TabBreakdownChartCard from '../../components/Cards/TabBreakdownChartCard'
import MainContentSkeleton from '../../components/LoadingStates/MainContentSkeleton'

const NetWorth = () => {
  const { accountStore, uiStateStore } = useStore()

  useEffect(() => {
    accountStore.initSession()
  }, [accountStore])

  return (
    <div className="flex flex-col h-full w-full">
      <ToolbarContainer />
      {uiStateStore.isInitiating && <MainContentSkeleton />}
      {!uiStateStore.isInitiating && (
        <main className="flex flex-col p-2 gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-4">
            <NetWorthSummaryCard />
            <IncomeSummaryCard />
            <SnapshotSummaryCard />
          </div>
          <div className="grid lg:grid-cols-3 auto-rows-auto gap-4">
            <NetWorthChartCard className="lg:col-span-2" />
            <TabBreakdownChartCard />
          </div>
          <div className="flex flex-row">
            <ItemTableContainer />
          </div>
        </main>
      )}
    </div>
  )
}

export default observer(NetWorth)
