import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { useStore } from '../../hooks/useStore'
import StatusMessage from './StatusMessage'

const StatusMessageContainer = () => {
  const { uiStateStore, rateLimitStore } = useStore()

  return (
    <StatusMessage
      statusMessage={uiStateStore.statusMessage}
      retryAfter={rateLimitStore.retryAfter}
      timeOverCb={() => rateLimitStore.setRetryAfter(0)}
    />
  )
}

export default observer(StatusMessageContainer)
