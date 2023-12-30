import { observer } from 'mobx-react'
import * as React from 'react'
import { IStatusMessage } from '../../interfaces/status-message.interface'
import { useTranslation } from 'react-i18next'
import CountdownTimer from '../CountDownTimer/CountdownTimer'

type StatusMessageProps = {
  statusMessage?: IStatusMessage
  retryAfter?: number
  timeOverCb?: () => void
}

const StatusMessage: React.FC<StatusMessageProps> = ({ statusMessage, retryAfter, timeOverCb }) => {
  const { t } = useTranslation('status')
  return (
    <>
      {statusMessage && (
        <div className="flex flex-row items-center text-sm">
          {`${t(`status:message.${statusMessage.message}` as unknown as any, {
            param: statusMessage.translateParam
          })} `}
          {!!statusMessage.currentCount && !!statusMessage.totalCount && (
            <>
              {statusMessage.currentCount} / {statusMessage.totalCount}
            </>
          )}
        </div>
      )}
      {!!retryAfter && retryAfter > 0 && (
        <div className="flex flex-row items-center text-sm">
          {statusMessage && ' ... '}
          {`${statusMessage ? t('message.rateLimitExceeded') : t('message.activeRateLimiter')} `}
          <CountdownTimer comparison={retryAfter} timeOverCb={timeOverCb} />
        </div>
      )}
    </>
  )
}

export default observer(StatusMessage)
