import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { Button, Checkbox, Label, Sheet } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import dayjs from 'dayjs'

const DeleteSnapshots = () => {
  const { t } = useTranslation()
  const { accountStore } = useStore()
  const [deleteSnapshotsSheetOpen, setDeleteSnapshotsSheetOpen] = useState(false)
  const [selectedSnapshotIds, setSelectedSnapshotIds] = useState<string[]>([])

  const snapshots = accountStore.activeAccount.activeProfile?.snapshots ?? []

  const handleDeleteSnapshots = () => {
    if (selectedSnapshotIds.length > 0) {
      accountStore.activeAccount.activeProfile?.deleteSnapshots(selectedSnapshotIds)
    }
  }

  return (
    <Sheet
      open={deleteSnapshotsSheetOpen}
      onOpenChange={(open) => {
        setSelectedSnapshotIds([])
        setDeleteSnapshotsSheetOpen(open)
      }}
    >
      <Sheet.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </Sheet.Trigger>
      <Sheet.Content className="space-y-8 mt-7 overflow-y-scroll w-3/5 sm:max-w-full ">
        <Sheet.Header>
          <Sheet.Title>{t('title.deleteSnapshots')}</Sheet.Title>
        </Sheet.Header>
        <div className="flex flex-col gap-3">
          {snapshots.map((snapshot) => (
            <div key={snapshot.uuid} className="flex flex-row items-center justify-start gap-3">
              <Checkbox
                checked={selectedSnapshotIds.includes(snapshot.uuid)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSnapshotIds([...selectedSnapshotIds, snapshot.uuid])
                  } else {
                    const nextIds = selectedSnapshotIds.filter(
                      (snapshotId) => snapshotId !== snapshot.uuid
                    )
                    setSelectedSnapshotIds(nextIds)
                  }
                }}
              />
              <Label>{`Snapshot ${dayjs(snapshot.created)
                .utc()
                .local()
                .format('YYYY-MM-DD HH:mm')}, Value: ${snapshot.totalValue.toFixed(2)} c`}</Label>
            </div>
          ))}
        </div>
        <Sheet.Footer>
          <Button
            onClick={() => {
              setSelectedSnapshotIds([])
              setDeleteSnapshotsSheetOpen(false)
            }}
            variant="outline"
          >
            {t('action.cancel')}
          </Button>
          <Button
            disabled={selectedSnapshotIds.length === snapshots.length}
            onClick={() => {
              setSelectedSnapshotIds(snapshots.map((snapshot) => snapshot.uuid))
            }}
            variant="outline"
          >
            {t('action.selectAll')}
          </Button>
          <Button
            disabled={selectedSnapshotIds.length === 0}
            onClick={() => {
              handleDeleteSnapshots()
              setSelectedSnapshotIds([])
              setDeleteSnapshotsSheetOpen(false)
            }}
            variant="destructive"
          >
            {t('action.deleteSnapshots', { count: selectedSnapshotIds.length })}
          </Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  )
}

export default observer(DeleteSnapshots)
