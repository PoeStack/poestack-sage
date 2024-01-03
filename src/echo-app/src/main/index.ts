import { app, BrowserWindow, Menu, shell, Tray, ipcMain } from 'electron'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { Server } from 'http'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initialize, enable } from '@electron/remote/main'
import { createLocalServer } from '../local-server/server'
import { EchoLoggingService, LogLevel, PinoLoggingTarget, EchoDirService } from 'echo-common'
import { ACTIVATED_LOG_LEVELS } from '../constants'

const logger = createLogger()

let mainWindow: BrowserWindow | null
let tray: Tray | null
let server: Server | null

const ICON_PATH = is.dev ? 'assets/icon.png' : path.join(process.resourcesPath, 'icon.png')

initialize()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false,
    icon: ICON_PATH,
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
    tray = createTray()
    mainWindow = null
  })
}

function createTray() {
  const appIcon = new Tray(ICON_PATH)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click: function () {
        if (server && server.listening) {
          server?.close(() => {
            app.quit()
          })
        } else {
          app.quit()
        }
      }
    }
  ])

  appIcon.on('click', function () {
    if (mainWindow) {
      mainWindow.show()
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  appIcon.setToolTip('PoeStack Sage')
  appIcon.setContextMenu(contextMenu)
  return appIcon
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

  if (is.dev) {
    const notifyOfRemoteAuth = (token: string) => {
      mainWindow?.webContents.send('AUTH_TOKEN_RECEIVED', { TOKEN_RECEIVED: token })
    }
    if (!server || !server.listening) {
      server = createLocalServer(notifyOfRemoteAuth)
    }
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    if (tray) {
      tray.destroy()
    }
  })
})

app.on('window-all-closed', () => {
  let minimizeToTrayOnClose = process.platform === 'darwin'
  try {
    const settingsPath = path.resolve(os.homedir(), 'poestack-sage', 'poe-stack-settings.json')
    if (fs.existsSync(settingsPath)) {
      minimizeToTrayOnClose = JSON.parse(
        fs.readFileSync(settingsPath).toString()
      ).minimizeToTrayOnClose
    }
  } catch (e) {
    console.log(e)
  } finally {
    if (!minimizeToTrayOnClose || is.dev) {
      if (server && server.listening) {
        server?.close(() => {
          app.quit()
        })
      } else {
        app.quit()
      }
    }
  }
})

ipcMain.handle(
  'IPC_LOG',
  (
    _,
    data: {
      logLevel: LogLevel
      message: string
      payload?: unknown
    }
  ) => {
    switch (data.logLevel) {
      case LogLevel.Error:
        logger.error(data.message, data.payload)
        break

      case LogLevel.Warn:
        logger.warn(data.message, data.payload)
        break

      case LogLevel.Info:
        logger.info(data.message, data.payload)
        break

      case LogLevel.Debug:
        logger.debug(data.message, data.payload)
        break

      case LogLevel.Trace:
        logger.trace(data.message, data.payload)
        break

      case LogLevel.Fatal:
        logger.fatal(data.message, data.payload)
        break
    }
  }
)

function createLogger() {
  const echoDirService = new EchoDirService()

  echoDirService.ensureDirExists('logs')

  const now = new Date().toISOString().split('T')[0]
  const logPath = path.resolve(echoDirService.homeDirPath, 'logs', `${now}.log`)

  const logger = new EchoLoggingService()
    .activateLogLevel(ACTIVATED_LOG_LEVELS)
    .activateLoggingTarget(
      PinoLoggingTarget.create({
        transport: {
          target: 'pino/file',
          options: {
            destination: logPath
          }
        },
        formatters: {
          // can be used to display meta data like hostname, pid and so on
          bindings: () => ({}),
          level: (label: string) => {
            return { level: label.toUpperCase() }
          }
        }
      })
    )

  return logger
}
