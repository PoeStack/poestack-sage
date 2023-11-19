import { types } from 'mobx-state-tree'
import { LeaguePriceSourceEntry } from './league-price-source'

export const LeaguePriceDetailsEntry = types
  .model('LeaguePriceDetailsEntry', {
    uuid: types.identifier,
    leagueId: types.string,
    leaguePriceSources: types.array(LeaguePriceSourceEntry)
  })
  .views((self) => ({}))
  .actions((self) => ({}))
