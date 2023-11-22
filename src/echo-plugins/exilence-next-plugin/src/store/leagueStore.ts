import { Instance, cast, getParent, types } from 'mobx-state-tree'
import { LeagueEntry, ILeagueEntry } from './domains/league'
import { IStore } from './rootStore'
import { IProfileEntry } from './domains/profile'
import { PoeLeague } from 'sage-common'
import { toLeagueEntity } from '../utils/entity.utils'

export interface ILeagueStore extends Instance<typeof LeagueStore> {}

const findLeaguesToSafeRemove = (
  self: ILeagueStore,
  leaguesToRemove: ILeagueEntry[],
  profileLeagueId: (profile: IProfileEntry) => string
) => {
  // Find nodes with a reference: 'type.reference(LeagueEntry)' => Profile
  const { accountStore } = getParent<IStore>(self)
  const toKeep = leaguesToRemove.filter((ltr) => {
    return accountStore.accounts.some((ac) => {
      return ac.profiles.some((ac) => profileLeagueId(ac) === ltr.id)
    })
  })
  const toRemove = leaguesToRemove.filter((ltr) => !toKeep.some((tr) => tr.id === ltr.id))
  return [toRemove, toKeep]
}

export const LeagueStore = types
  .model('LeagueStore', {
    leagues: types.optional(types.array(LeagueEntry), []),
    priceLeagues: types.optional(types.array(LeagueEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({
    updateLeagues(activeApiLeagues: PoeLeague[]) {
      const activeLeagues = activeApiLeagues.map((l) => toLeagueEntity(l))
      // Update already existent leagues
      const removedLeagues: ILeagueEntry[] = []
      self.leagues.forEach((pl) => {
        const league = activeLeagues.find((apl) => pl.id === apl.id)
        if (league) {
          pl.updateLeague(league)
        } else {
          removedLeagues.push(pl)
        }
      })

      // Delete or mark removed leagues
      const [toRemove, toKeep] = findLeaguesToSafeRemove(
        cast(self),
        removedLeagues,
        (p) => p.activeLeague.id
      )
      toRemove.forEach((l) => {
        self.leagues.remove(l)
      })
      toKeep.forEach((l) => {
        l.setDeleted(true)
      })

      // Add new leagues
      const newLeagues = activeLeagues.filter((apl) => !self.leagues.some((pl) => pl.id === apl.id))
      if (newLeagues.length > 0) {
        self.leagues.push(...newLeagues)
      }
    },
    updatePriceLeagues(activeApiLeagues: PoeLeague[]) {
      const activeLeagues = activeApiLeagues.map((l) => toLeagueEntity(l))
      // Update already existent leagues
      const removedLeagues: ILeagueEntry[] = []
      self.priceLeagues.forEach((pl) => {
        const league = activeLeagues.find((apl) => pl.id === apl.id)
        if (league) {
          pl.updateLeague(league)
        } else {
          removedLeagues.push(pl)
        }
      })

      // Delete or mark removed leagues
      const [toRemove, toKeep] = findLeaguesToSafeRemove(
        cast(self),
        removedLeagues,
        (p) => p.activePriceLeague.id
      )
      toRemove.forEach((l) => {
        self.priceLeagues.remove(l)
      })
      toKeep.forEach((l) => {
        l.setDeleted(true)
      })

      // Add new leagues
      const newLeagues = activeLeagues.filter(
        (apl) => !self.priceLeagues.some((pl) => pl.id === apl.id)
      )
      if (newLeagues.length > 0) {
        self.priceLeagues.push(...newLeagues)
      }
    }
  }))
