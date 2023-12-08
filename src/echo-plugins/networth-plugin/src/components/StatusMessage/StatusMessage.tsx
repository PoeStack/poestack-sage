import { observer } from 'mobx-react'
import * as React from 'react'
import { IStatusMessage } from '../../interfaces/status-message.interface'
import { useTranslation } from 'react-i18next'

type StatusMessageProps = {
  statusMessage?: IStatusMessage
}

const StatusMessage: React.FC<StatusMessageProps> = ({ statusMessage }) => {
  const { t } = useTranslation()
  return (
    <>
      {statusMessage && (
        <div className="flex flex-row items-center text-sm">{`${t(
          `status:message.${statusMessage.message}` as unknown as any,
          { param: statusMessage.translateParam }
        )} `}</div>
      )}
    </>
  )
}

export default observer(StatusMessage)
