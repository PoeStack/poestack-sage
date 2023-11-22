import { types, IAnyComplexType, IType, Instance } from 'mobx-state-tree'
import { IExternalPrice } from '../../interfaces/external-price.interface'
import dayjs from 'dayjs'

export interface ILeaguePriceSourceEntry extends Instance<typeof LeaguePriceSourceEntry> {}

export const LeaguePriceSourceEntry = types
  .model('LeaguePriceSourceEntry', {
    uuid: types.identifier,
    // TODO: Do I need?
    prices: types.frozen<IExternalPrice[]>([]),
    created: types.optional(types.number, () => dayjs.utc().valueOf()),
    updated: types.optional(types.number, () => dayjs.utc().valueOf())
  })
  .views((self) => ({}))
  .actions((self) => ({}))
