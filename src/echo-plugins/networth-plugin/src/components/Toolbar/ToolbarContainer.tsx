import { observer } from 'mobx-react'
import * as React from 'react'
import { useStore } from '../../hooks/useStore'
import Toolbar from './Toolbar'

type ToolbarContainerProps = {}

const ToolbarContainer: React.FC<ToolbarContainerProps> = () => {
  const { uiStateStore, accountStore } = useStore()

  const activeProfile = accountStore.activeAccount.activeProfile

  return (
    <Toolbar
      isSubmitting={uiStateStore.isSubmitting}
      isInitiating={uiStateStore.isInitiating}
      isSnapshotting={uiStateStore.isSnapshotting}
      isProfileValid={activeProfile?.isProfileValid || false}
      readyToSnapshot={activeProfile?.readyToSnapshot || false}
      statusMessage={uiStateStore.statusMessage}
      handleSnapshot={() => activeProfile?.snapshot()}
      handleCancelSnapshot={() => uiStateStore.setCancelSnapshot(true)}
    />
  )
}

export default observer(ToolbarContainer)
