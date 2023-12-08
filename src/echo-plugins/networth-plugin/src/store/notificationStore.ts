import { computed } from 'mobx'
import { model, Model, modelAction, prop, tProp, types } from 'mobx-keystone'
import { Notification } from './domains/notification'
import { NotificationType } from '../interfaces/notification.interface'
import { translateError } from '../utils/error.utils'
import { NotificationPath } from '../types/resouces'
import { PersistWrapper } from '../utils/persist.utils'

@model('nw/notificationStore')
export class NotificationStore extends Model(
  ...PersistWrapper(
    {
      notifications: tProp(types.array(types.model(Notification)), []),
      displayed: tProp(types.array(types.string), []),
      version: prop(1)
    },
    {
      // Do not write any data
      whitelist: []
    }
  )
) {
  @computed
  get alertNotifications() {
    const alerts = this.notifications.filter((n) => n.displayAlert)
    return alerts
  }

  @computed
  get unreadNotifications() {
    const alerts = this.notifications.filter((n) => !n.read)
    return alerts
  }

  @modelAction
  addDisplayed(uuid: string) {
    this.displayed.unshift(uuid)
    this.displayed = this.displayed.slice(0, 10)
  }

  @modelAction
  createNotification(
    wording: NotificationPath,
    displayAlert?: boolean,
    error?: Error,
    translateParam?: string
  ) {
    const path = wording.split('.')
    const type = (path.shift() || 'error') as NotificationType
    const key = path.join('.')
    const prefix = `notification:${type}`
    const title = `${prefix}.title.${key}`
    const description = error ? translateError(error) : `${prefix}.description.${key}`

    const notification = new Notification({
      title,
      description,
      type,
      displayAlert,
      stackTrace: error ? error.message : undefined,
      translateParam
    })

    this.notifications.unshift(notification)
    this.notifications = this.notifications.slice(0, 10)

    if (error) {
      console.error(error)
    }

    return notification
  }

  @modelAction
  markAsRead(uuid: string) {
    const notification = this.notifications.find((n) => n.uuid === uuid)
    notification?.setRead(true)
    return notification
  }

  @modelAction
  markAllAsRead() {
    this.notifications.forEach((n) => {
      n.setRead(true)
    })
  }
}
