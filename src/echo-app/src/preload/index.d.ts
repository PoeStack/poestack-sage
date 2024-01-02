import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown & {
      IPC_LOG: <TPayload>(payload: {
        logLevel: LogLevel
        message: string
        payload?: TPayload
      }) => Promise<void>
    }
  }
}
