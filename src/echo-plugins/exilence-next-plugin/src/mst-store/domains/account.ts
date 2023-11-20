import { Instance, destroy, getParent, onSnapshot, types } from 'mobx-state-tree'
import { AccountLeagueEntry, IAccountLeagueEntry } from './account-league'
import { ProfileEntry, IProfileEntry } from './profile'
import { Subject, delay, from, map, of, takeUntil, timer } from 'rxjs'
import { runInAction } from 'mobx'
import { IStore, Store } from '../rootStore'
import { ILeagueEntry } from './league'

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
  .views((self) => ({
    get activeLeague() {
      return self.activeProfile?.activeLeague
      // const store = getParent<any>(self, 2)
      // const profile = self.activeProfile
      // if (profile) {
      //   return store.leagueStore.leagues.find(
      //     (l: ILeagueEntry) => l.id === profile.activeLeague?.id
      //   )
      // }
      // return undefined
    },
    get activePriceLeague() {
      return self.activeProfile?.activePriceLeague
      // const store = getParent<any>(self, 2)
      // const profile = self.activeProfile
      // if (profile) {
      //   return store.leagueStore.priceLeagues.find(
      //     (l: ILeagueEntry) => l.id === profile.activePriceLeague?.id
      //   )
      // }
      // return undefined
    },
    get activeCharacter() {
      return self.activeProfile?.activeCharacter
      // const profile = self.activeProfile
      // if (profile) {
      //   const accountLeague = self.accountLeagues.find(
      //     (l) => l.league?.id === profile?.activeLeague?.id
      //   )
      //   return accountLeague?.characters.find((ac) => ac.name === profile.activeCharacter?.name)
      // }
      // return undefined
    },
    get characters() {
      const profile = self.activeProfile
      if (profile) {
        return self.accountLeagues.find((l) => l.league?.id === profile.activeLeague?.id)
          ?.characters
      }
      return undefined
    }
  }))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot AccountEntry: ', _snapshot)
      })
    },
    // First set all basic C(R)UD functions
    setActiveProfile(profile?: IProfileEntry) {
      const store = getParent<IStore>(self, 2)
      store.uiStateStore.setChangingProfile(true)
      store.uiStateStore.changeItemTablePage(0)
      self.activeProfile = profile
    },
    addProfile(profile: IProfileEntry) {
      self.profiles.push(profile)
    },
    removeProfile(profile: IProfileEntry) {
      self.profiles.remove(profile)
    },
    setProfiles(profiles: IProfileEntry[]) {
      self.profiles.replace(profiles)
    },
    addAccountLeague(accoutLeague: IAccountLeagueEntry) {
      self.accountLeagues.push(accoutLeague)
    },
    removeAccountLeague(accoutLeague: IAccountLeagueEntry) {
      self.accountLeagues.remove(accoutLeague)
    },
    setAccountLeagues(accoutLeagues: IAccountLeagueEntry[]) {
      self.accountLeagues.replace(accoutLeagues)
    }
  }))
  .actions((self) => ({
    queueSnapshot(milliseconds?: number) {
      const store = getParent<IStore>(self, 2)
      // fromStream(
      timer(milliseconds ? milliseconds : store.settingStore.autoSnapshotInterval).pipe(
        map(() => {
          if (self.activeProfile && self.activeProfile.readyToSnapshot) {
            self.activeProfile.snapshot()
          } else {
            this.dequeueSnapshot()
            this.queueSnapshot(10 * 1000)
          }
        }),
        takeUntil(self.cancelled)
      )
      // )
    },

    dequeueSnapshot() {
      self.cancelled.next(true)
    }
  }))
