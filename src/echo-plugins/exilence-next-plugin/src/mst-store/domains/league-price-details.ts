import { types } from 'mobx-state-tree'
import { LeaguePriceSourceEntry } from './league-price-source'
import { LeagueEntry } from './league'

export const LeaguePriceDetailsEntry = types
  .model('LeaguePriceDetailsEntry', {
    uuid: types.identifier,
    league: types.safeReference(LeagueEntry),
    leaguePriceSources: types.optional(types.array(LeaguePriceSourceEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
