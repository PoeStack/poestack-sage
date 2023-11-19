import { types } from 'mobx-state-tree'
import { LeagueEntry } from './domains/league'

export const LeagueStore = types
  .model('LeagueStore', {
    leagues: types.optional(types.array(LeagueEntry), []),
    priceLeagues: types.optional(types.array(LeagueEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
