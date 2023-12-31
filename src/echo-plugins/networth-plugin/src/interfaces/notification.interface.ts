export type NotificationType = 'success' | 'info' | 'error' | 'warning'

// CHECKED
export interface INotification {
  uuid?: string
  title: string
  timestamp?: number
  description?: string
  read?: boolean
  type: NotificationType
  displayAlert?: boolean
  stackTrace?: string
  translateParam?: string
}
