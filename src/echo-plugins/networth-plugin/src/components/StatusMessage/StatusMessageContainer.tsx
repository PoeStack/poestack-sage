import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { useStore } from '../../hooks/useStore'
import StatusMessage from './StatusMessage'

const StatusMessageContainer = () => {
  const { uiStateStore } = useStore()

  return <StatusMessage statusMessage={uiStateStore.statusMessage} />
}

export default observer(StatusMessageContainer)
