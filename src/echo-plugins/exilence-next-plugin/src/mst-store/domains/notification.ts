import { types } from 'mobx-state-tree'
import { NotificationType } from '../../interfaces/notification.interface'

export const NotificationEntry = types
  .model('NotificationEntry', {
    uuid: types.identifier,
    title: types.string,
    timestamp: types.number,
    description: types.string,
    read: false,
    type: types.literal<NotificationType>('info'),
    displayAlert: types.maybe(types.boolean),
    stackTrace: types.maybe(types.string),
    translateParam: types.maybe(types.string)
  })
  .views((self) => ({}))
  .actions((self) => ({}))
