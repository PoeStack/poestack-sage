import { Instance, destroy, onSnapshot, types } from 'mobx-state-tree'
import { AccountLeagueEntry } from './account-league'
import { ProfileEntry, IProfileEntry } from './profile'
import { Subject, delay, from, of } from 'rxjs'
import { runInAction } from 'mobx'

export interface IAccountEntry extends Instance<typeof AccountEntry> {}

export const AccountEntry = types
  .model('AccountEntry', {
    uuid: types.identifier,
    name: types.string,
    accountLeagues: types.optional(
      // LeagueStore holds the objects
      types.array(types.safeReference(AccountLeagueEntry, { acceptsUndefined: false })),
      []
    ),
    profiles: types.optional(types.array(ProfileEntry), []),
    activeProfile: types.safeReference(ProfileEntry)
  })
  .volatile((self) => ({
    cancelled: new Subject<boolean>()
  }))
  .views((self) => ({}))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot AccountEntry: ', _snapshot)
      })
    },
    setActiveProfile(profile: IProfileEntry) {
      self.activeProfile = profile
    },
    addProfile(profile: IProfileEntry) {
      self.profiles.push(profile)
    },
    removeProfile(profile: IProfileEntry) {
      self.profiles.remove(profile)
    }
  }))
