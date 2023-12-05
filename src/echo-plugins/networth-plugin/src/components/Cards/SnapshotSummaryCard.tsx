import { Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { History } from 'lucide-react'
import dayjs from 'dayjs'

function SnapshotSummaryCard() {
  const { accountStore } = useStore()
  const snapshotCount = accountStore.activeAccount.activeProfile?.snapshots.length ?? 0
  const lastSnapshot =
    snapshotCount > 0
      ? accountStore.activeAccount.activeProfile?.snapshots[snapshotCount - 1]
      : undefined

  const snapshotMessage = lastSnapshot ? dayjs(lastSnapshot.created).fromNow() : ''

  return (
    <Card className="min-w-[300px] grow">
      <Card.Content className="p-3 py-1">
        <div className="flex flex-row items-center justify-between min-h-[64px]">
          <div className="flex flex-row items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <span>{accountStore.activeAccount.activeProfile?.snapshots.length ?? 0}</span>
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="border-t p-3">
        <div className="text-sm flex flex-row grow items-center justify-between">
          <span>Snapshot count</span>
          {snapshotMessage && <span>{snapshotMessage}</span>}
        </div>
      </Card.Footer>
    </Card>
  )
}

export default observer(SnapshotSummaryCard)
