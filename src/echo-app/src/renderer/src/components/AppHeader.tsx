import { CSSProperties } from 'react'
import Process from 'process'
import { X, Minus, Maximize } from 'lucide-react'

import { getCurrentWindow } from '@electron/remote'
import { Button } from 'echo-common/components-v1'

export function AppHeader() {
  if (Process.platform === 'win32') {
    return <WindowsHeader />
  } else {
    return <MacOSHeader />
  }
}

const WindowsHeader = () => {
  return (
    <>
      <div className="h-7" />
      <div
        style={{ WebkitAppRegion: 'drag' } as CSSProperties}
        className="bg-background brightness-75 fixed top-0 h-7 w-full flex"
      >
        <div className="flex justify-end items-center space-x-3 h-full w-full pr-1">
          <Button
            style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              getCurrentWindow().minimize()
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              if (getCurrentWindow().isMaximized()) {
                getCurrentWindow().unmaximize()
              } else {
                getCurrentWindow().maximize()
              }
            }}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          <Button
            style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              getCurrentWindow().close()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

const MacOSHeader = () => {
  return (
    <>
      <div className="h-7" />
      <div
        style={{ WebkitAppRegion: 'drag' } as CSSProperties}
        className="bg-background brightness-75 fixed top-0 h-7 w-full flex"
      >
        <div
          style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
          className="flex items-center space-x-0 h-full pl-2 flex-0"
        >
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-inherit h-8 w-6"
            onClick={() => {
              getCurrentWindow().close()
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-inherit h-8 w-6"
            onClick={() => {
              getCurrentWindow().minimize()
            }}
          >
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-inherit h-8 w-6"
            onClick={() => {
              if (getCurrentWindow().isMaximized()) {
                getCurrentWindow().unmaximize()
              } else {
                getCurrentWindow().maximize()
              }
            }}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
          </Button>
        </div>
      </div>
    </>
  )
}
