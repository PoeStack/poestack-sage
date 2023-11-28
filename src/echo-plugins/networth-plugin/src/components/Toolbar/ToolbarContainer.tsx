import { observer } from 'mobx-react'
import * as React from 'react'
import { useStore } from '../../hooks/useStore'
import Toolbar from './Toolbar'

type ToolbarContainerProps = {}

const ToolbarContainer: React.FC<ToolbarContainerProps> = () => {
  const { uiStateStore } = useStore()

  console.log(
    uiStateStore.isInitiating,
    uiStateStore.isSnapshotting,
    uiStateStore.statusMessage?.message
  )

  return (
    <Toolbar
      isSubmitting={uiStateStore.isSubmitting}
      isInitiating={uiStateStore.isInitiating}
      isSnapshotting={uiStateStore.isSnapshotting}
      statusMessage={uiStateStore.statusMessage}
    />
  )
}

export default observer(ToolbarContainer)
