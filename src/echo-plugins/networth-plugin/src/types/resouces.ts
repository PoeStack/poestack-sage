import common from '../locales/en/common.json'
import notification from '../locales/en/notification.json'
import status from '../locales/en/status.json'

const allResources = {
  common,
  notification,
  status
} as const

export type Resources = typeof allResources

const notificationRes = {
  success: notification.success.title,
  error: notification.error.title,
  warning: notification.warning.title,
  info: notification.info.title
} as const

export type NotificationPath = Paths<typeof notificationRes>
export type StatusPath = Paths<typeof allResources.status.message>

// Property dot path use it like Paths<Notifications>
type Join<Key, Previous, TKey extends number | string = string> = Key extends TKey
  ? Previous extends TKey
    ? `${Key}${'' extends Previous ? '' : '.'}${Previous}`
    : never
  : never

type Previous = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]]

export type Paths<TEntity, TDepth extends number = 3, TKey extends number | string = string> = [
  TDepth
] extends [never]
  ? never
  : TEntity extends object
    ? {
        [Key in keyof TEntity]-?: Key extends TKey
          ? `${Key}` | Join<Key, Paths<TEntity[Key], Previous[TDepth]>>
          : never
      }[keyof TEntity]
    : ''
