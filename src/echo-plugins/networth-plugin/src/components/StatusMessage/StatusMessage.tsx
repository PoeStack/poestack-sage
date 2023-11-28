import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { useStore } from '../../hooks/useStore'
import { IStatusMessage } from '../../interfaces/status-message.interface'

type StatusMessageProps = {
  statusMessage?: IStatusMessage
}

const StatusMessage: React.FC<StatusMessageProps> = ({ statusMessage }) => {
  return <div className="text-sm">{statusMessage?.message}</div>
}

export default observer(StatusMessage)
