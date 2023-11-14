
import { Module } from 'module'
const orgResolvePath = Module['_resolveLookupPaths']
Module['_resolveLookupPaths'] = function (request, parent) {
  console.log('mreq', request, parent)
  return orgResolvePath(request, parent)
}

import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initialize, enable } from '@electron/remote/main'

let mainWindow: BrowserWindow | null

initialize()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    icon: './build/icon.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  enable(mainWindow.webContents)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  const handleRedirect = (e: any, url: any) => {
    e.preventDefault()
    shell.openExternal(url)
  }
  mainWindow.webContents.on('will-navigate', handleRedirect)

  // mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
