import { types, IAnyComplexType, IType } from 'mobx-state-tree'
import { IExternalPrice } from '../../interfaces/external-price.interface'
import dayjs from 'dayjs'

export const LeaguePriceSourceEntry = types
  .model('LeaguePriceSourceEntry', {
    uuid: types.identifier,
    prices: types.frozen<IExternalPrice[]>([]),
    created: dayjs.utc().valueOf(),
    updated: dayjs.utc().valueOf()
  })
  .views((self) => ({}))
  .actions((self) => ({}))
