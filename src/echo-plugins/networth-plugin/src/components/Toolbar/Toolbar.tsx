import ProfileMenu from './ProfileMenu'
import { Button } from 'echo-common/components-v1'
import { PictureInPicture2, RefreshCcw, Trash2, XCircle } from 'lucide-react'
import { useStore } from '../../hooks/useStore'
import { IStatusMessage } from '../../interfaces/status-message.interface'
import { Loader2 } from 'lucide-react'
import StatusMessageContainer from '../statusMessage/StatusMessageContainer'
import { observer } from 'mobx-react'
import { cn } from 'echo-common'

type ToolbarProps = {
  isSubmitting: boolean
  isInitiating: boolean
  isSnapshotting: boolean
  statusMessage?: IStatusMessage
}

const Toolbar: React.FC<ToolbarProps> = ({
  isSubmitting,
  isInitiating,
  isSnapshotting,
  statusMessage
}) => {
  return (
    <header className="z-50 flex border-b">
      <div className="flex flex-none flex-row items-center pl-2 space-x-2">
        {(isInitiating || isSnapshotting) && <Loader2 className="animate-spin" />}
        {statusMessage && <StatusMessageContainer />}
      </div>
      <div className="divide-x divide-solid flex flex-1 flex-row items-center justify-end">
        <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
          <ProfileMenu />
        </div>
        <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
          <Button variant="ghost" className="border p-1 pr-1.5 rounded h-8">
            <div className="flex flex-row justify-center text-xs items-center gap-1">
              <RefreshCcw className={cn('h-4 w-4', isSnapshotting && 'animate-spin')} />
              TAKE SNAPSHOT
            </div>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <XCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="py-1 px-1 h-full flex justify-center items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PictureInPicture2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default observer(Toolbar)
