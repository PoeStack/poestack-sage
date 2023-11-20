import { Instance, types } from 'mobx-state-tree'
import { LeagueEntry, ILeagueEntry } from './domains/league'

export interface ILeagueStore extends Instance<typeof LeagueStore> {}

export const LeagueStore = types
  .model('LeagueStore', {
    leagues: types.optional(types.array(LeagueEntry), []),
    priceLeagues: types.optional(types.array(LeagueEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({
    addLeague(league: ILeagueEntry) {
      self.leagues.push(league)
    },
    removeLeague(league: ILeagueEntry) {
      self.leagues.remove(league)
    },
    setLeagues(leagues: ILeagueEntry[]) {
      self.leagues.replace(leagues)
    },
    addPriceLeague(league: ILeagueEntry) {
      self.priceLeagues.push(league)
    },
    removePriceLeague(league: ILeagueEntry) {
      self.priceLeagues.remove(league)
    },
    setPriceLeagues(leagues: ILeagueEntry[]) {
      self.priceLeagues.replace(leagues)
    }
  }))
