import { ProfileMenu } from './ProfileMenu'
import { Button } from 'echo-common/components-v1'
import { PictureInPicture2, RefreshCcw, Trash2, XCircle } from 'lucide-react'

export function Toolbar() {
  return (
    <header className="z-50 divide-x divide-solid flex flex-row items-center justify-end border-b">
      <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
        <ProfileMenu />
      </div>
      <div className="py-2 px-2 h-full flex justify-center items-center gap-2.5">
        <Button variant="ghost" className="border p-1 pr-1.5 rounded h-8">
          <div className="flex flex-row justify-center text-xs items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
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
    </header>
  )
}
