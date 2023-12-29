import ProfileMenu from './ProfileMenu'
import { Button } from 'echo-common/components-v1'
import { RefreshCcw, XCircle } from 'lucide-react'
import { IStatusMessage } from '../../interfaces/status-message.interface'
import { Loader2 } from 'lucide-react'
import StatusMessageContainer from '../StatusMessage/StatusMessageContainer'
import { observer } from 'mobx-react'
import { cn } from 'echo-common'
import GlobalSettings from './GlobalSettings'
import { useTranslation } from 'react-i18next'
import DeleteSnapshots from './DeleteSnapshots'
import ToolbarContentSkeleton from '../LoadingStates/ToolbarContentSkeleton'

type ToolbarProps = {
  isSubmitting: boolean
  isInitiating: boolean
  isSnapshotting: boolean
  isProfileValid: boolean
  readyToSnapshot: boolean
  statusMessage?: IStatusMessage
  handleSnapshot: () => void
  handleCancelSnapshot: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  isSubmitting,
  isInitiating,
  isSnapshotting,
  isProfileValid,
  readyToSnapshot,
  statusMessage,
  handleSnapshot,
  handleCancelSnapshot
}) => {
  const { t } = useTranslation()
  return (
    <header className="z-50 flex border-b">
      <div className="flex flex-none flex-row items-center pl-2 space-x-2">
        {(isInitiating || isSnapshotting) && <Loader2 className="animate-spin" />}
        {statusMessage && <StatusMessageContainer />}
      </div>
      {isInitiating && <ToolbarContentSkeleton />}
      {!isInitiating && (
        <div className="divide-x divide-solid flex flex-1 flex-row items-center justify-end">
          <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
            <ProfileMenu />
          </div>
          <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
            <Button
              disabled={!readyToSnapshot}
              className="border rounded h-8 p-1 pr-1.5 space-x-1 bg-gradient hover:brightness-90"
              onClick={() => handleSnapshot()}
            >
              <RefreshCcw className={cn('h-4 w-4', isSnapshotting && 'animate-spin')} />
              <span>{t('action.takeSnapshot')}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!isSnapshotting}
              className="h-8 w-8"
              onClick={() => handleCancelSnapshot()}
            >
              <XCircle className="h-4 w-4" />
            </Button>
            <DeleteSnapshots />
          </div>
          {/* TODO Add overlay support */}
          {/* <div className="py-1 px-1 h-full flex justify-center items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PictureInPicture2 className="h-4 w-4" />
          </Button>
        </div> */}
          <div className="py-1 px-1 h-full flex justify-center items-center">
            <GlobalSettings />
          </div>
        </div>
      )}
    </header>
  )
}

export default observer(Toolbar)
