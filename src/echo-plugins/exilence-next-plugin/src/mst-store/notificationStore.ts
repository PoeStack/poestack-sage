import { Instance, types } from 'mobx-state-tree'
import { NotificationEntry, INotificationEntry } from './domains/notification'
import { NotificationType } from '../interfaces/notification.interface'
import { translateError } from '../utils/error.utils'
import { v4 as uuidv4 } from 'uuid'

export interface INotificationStore extends Instance<typeof NotificationStore> {}

export const NotificationStore = types
  .model('NotificationStore', {
    notifications: types.optional(types.array(NotificationEntry), []),
    displayed: types.optional(types.array(types.string), [])
  })
  .views((self) => ({
    get alertNotifications() {
      const alerts = self.notifications.filter((n) => n.displayAlert)
      return alerts
    },
    get unreadNotifications() {
      const alerts = self.notifications.filter((n) => !n.read)
      return alerts
    }
  }))
  .actions((self) => ({
    addNotification(notification: INotificationEntry) {
      self.notifications.push(notification)
    },
    removeNotification(notification: INotificationEntry) {
      self.notifications.remove(notification)
    },
    setNotifications(notifications: INotificationEntry[]) {
      self.notifications.replace(notifications)
    },
    addDisplayed(displayed: string) {
      self.displayed.unshift(displayed), self.displayed.replace(self.displayed.slice(0, 10))
    },
    removeDisplayed(displayed: string) {
      self.displayed.remove(displayed)
    },
    setDisplayed(displayed: string[]) {
      self.displayed.replace(displayed)
    }
  }))
  .actions((self) => ({
    createNotification(
      key: string,
      type: NotificationType,
      displayAlert?: boolean,
      error?: Error,
      translateParam?: string
    ) {
      const prefix = `notification:${type}`
      const title = `${prefix}.title.${key}`
      const description = error ? translateError(error) : `${prefix}.description.${key}`

      const notification = NotificationEntry.create({
        uuid: uuidv4(),
        title,
        description,
        type,
        displayAlert,
        stackTrace: error ? error.message : undefined,
        translateParam
      })

      self.notifications.unshift(notification)
      self.notifications.replace(self.notifications.slice(0, 10))

      return notification
    },

    markAsRead(uuid: string) {
      const notification = self.notifications.find((n) => n.uuid === uuid)
      notification!.setRead(true)
      return notification
    },

    markAllAsRead() {
      self.notifications.forEach((n) => {
        n.setRead(true)
      })
    }
  }))
