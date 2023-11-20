import { Instance, types } from 'mobx-state-tree'
import { NotificationType } from '../../interfaces/notification.interface'
import dayjs from 'dayjs'

export interface INotificationEntry extends Instance<typeof NotificationEntry> {}

export const NotificationEntry = types
  .model('NotificationEntry', {
    uuid: types.identifier,
    title: types.string,
    timestamp: types.optional(types.number, () => dayjs.utc().valueOf()),
    description: types.string,
    read: false,
    type: types.literal<NotificationType>('info'),
    displayAlert: types.maybe(types.boolean),
    stackTrace: types.maybe(types.string),
    translateParam: types.maybe(types.string)
  })
  .views((self) => ({}))
  .actions((self) => ({
    setRead(read: boolean) {
      self.read = read
    }
  }))
