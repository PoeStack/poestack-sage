import { computed } from 'mobx'
import { detach, idProp, model, Model, prop, rootRef, tProp, types } from 'mobx-keystone'
import { NotificationType } from '../../interfaces/notification.interface'
import dayjs from 'dayjs'

@model('nw/notification')
export class Notification extends Model({
  uuid: idProp,
  title: tProp(types.string),
  timestamp: tProp(types.number, () => dayjs.utc().valueOf()),
  description: tProp(types.string),
  read: tProp(false).withSetter(),
  type: prop<NotificationType>('info'),
  displayAlert: tProp(types.maybe(types.boolean)),
  stackTrace: tProp(types.maybe(types.string)),
  translateParam: tProp(types.maybe(types.string))
}) {}
