import { types } from 'mobx-state-tree'
import { LeaguePriceDetailsEntry } from './domains/league-price-details'

export const PriceStore = types
  .model('PriceStore', {
    leaguePriceDetails: types.optional(types.array(LeaguePriceDetailsEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
