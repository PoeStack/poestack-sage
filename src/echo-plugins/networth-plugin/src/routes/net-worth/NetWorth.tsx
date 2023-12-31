import { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import ToolbarContainer from '../../components/Toolbar/ToolbarContainer'
import NetWorthChartCard from '../../components/Cards/NetWorthChartCard'
import NetWorthSummaryCard from '../../components/Cards/NetWorthSummaryCard'
import IncomeSummaryCard from '../../components/Cards/IncomeSummaryCard'
import SnapshotSummaryCard from '../../components/Cards/SnapshotSummaryCard'
import TabBreakdownChartCard from '../../components/Cards/TabBreakdownChartCard'
import MainContentSkeleton from '../../components/LoadingStates/MainContentSkeleton'
import ItemTableCard from '../../components/Cards/ItemTableCard'

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
        <main className="flex flex-col p-2 gap-2 lg:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-auto gap-2 lg:gap-4">
            <NetWorthSummaryCard />
            <IncomeSummaryCard />
            <SnapshotSummaryCard />
          </div>
          <div className="grid lg:grid-cols-5 auto-rows-auto gap-2 lg:gap-4">
            <NetWorthChartCard className="lg:col-span-3" />
            <TabBreakdownChartCard className="lg:col-span-2" />
          </div>
          <ItemTableCard />
        </main>
      )}
    </div>
  )
}

export default observer(NetWorth)
