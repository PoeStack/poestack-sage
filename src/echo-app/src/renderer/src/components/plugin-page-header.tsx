import React, { CSSProperties } from 'react'
import Process from 'process'

import { getCurrentWindow } from '@electron/remote'

export function PluginPageHeader() {
  if (Process.platform === 'win32') {
    return <WindowsHeader />
  } else {
    return <MacOSHeader />
  }
}

const WindowsHeader = () => {
  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      className="bg-secondary-surface fixed top-0 h-7 w-full flex"
    >
      <div className="flex justify-end items-center space-x-4 h-full w-full pr-2">
        <button
          style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
          onClick={() => {
            getCurrentWindow().minimize()
          }}
        >
          <svg
            className="w-[16px] h-[16px] text-gray-800 dark:text-white"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-line-cap="round"
            stroke-line-join="round"
            strokeWidth="1"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>
        <button
          style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
          onClick={() => {
            if (getCurrentWindow().isMaximized()) {
              getCurrentWindow().unmaximize()
            } else {
              getCurrentWindow().maximize()
            }
          }}
        >
          <svg
            className="w-[16px] h-[16px] text-gray-800 dark:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            stroke-line-cap="round"
            stroke-line-join="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />{' '}
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
        <button
          style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
          onClick={() => {
            getCurrentWindow().close()
          }}
        >
          <svg
            className="w-[16px] h-[16px] text-gray-800 dark:text-white"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-line-cap="round"
            stroke-line-join="round"
            strokeWidth="1"
          >
            <line x1="20" y1="4" x2="4" y2="20" /> <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const MacOSHeader = () => {
  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
      className="bg-secondary-surface fixed top-0 h-7 w-full flex"
    >
      <div
        style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
        className="flex items-center space-x-2 h-full pl-2 flex-0"
      >
        <button
          className="w-3 h-3 bg-red-500 rounded-full"
          onClick={() => {
            getCurrentWindow().close()
          }}
        />
        <button
          className="w-3 h-3 bg-yellow-500 rounded-full"
          onClick={() => {
            getCurrentWindow().minimize()
          }}
        />
        <button
          className="w-3 h-3 bg-green-500 rounded-full"
          onClick={() => {
            if (getCurrentWindow().isMaximized()) {
              getCurrentWindow().unmaximize()
            } else {
              getCurrentWindow().maximize()
            }
          }}
        />
      </div>
    </div>
  )
}
