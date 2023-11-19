import { types } from 'mobx-state-tree'
import { NotificationEntry } from './domains/notification'

export const NotificationStore = types
  .model('NotificationStore', {
    notifications: types.optional(types.array(NotificationEntry), []),
    displayed: types.optional(types.array(types.string), [])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
