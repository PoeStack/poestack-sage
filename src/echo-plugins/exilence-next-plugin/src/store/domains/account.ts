import { Instance, cast, destroy, getParent, onSnapshot, types } from 'mobx-state-tree'
import { AccountLeagueEntry, IAccountLeagueEntry } from './account-league'
import { ProfileEntry, IProfileEntry } from './profile'
import { Subject, delay, from, map, of, takeUntil, timer } from 'rxjs'
import { runInAction } from 'mobx'
import { IStore, Store } from '../rootStore'
import { ILeagueEntry } from './league'
import { CharacterEntry, ICharacterEntry } from './character'
import { PoeCharacter, PoePartialStashTab } from 'sage-common'
import { toCharacterEntity, toStashTab } from '../../utils/entity.utils'
import { IStashTabEntry, StashTabEntry } from './stash-tab'

export interface IAccountEntry extends Instance<typeof AccountEntry> {}

const findEntryToSafeRemove = <T extends { id: string }>(
  self: IAccountEntry,
  entriesToRemove: T[],
  compare: (profile: IProfileEntry, toComp: string) => boolean
) => {
  // Find nodes with a reference: 'type.reference(XXX)' => Profile
  const toKeep = entriesToRemove.filter((etr) => {
    return self.profiles.some((ac) => compare(ac, etr.id))
  })
  const toRemove = entriesToRemove.filter((ltr) => !toKeep.some((tr) => tr.id === ltr.id))
  return [toRemove, toKeep]
}

export const AccountEntry = types
  .model('AccountEntry', {
    uuid: types.identifier,
    name: types.string,
    characters: types.optional(types.array(CharacterEntry), []),
    stashTabs: types.optional(types.array(StashTabEntry), []),
    profiles: types.optional(types.array(ProfileEntry), []),
    activeProfile: types.safeReference(ProfileEntry)
  })
  .volatile((self) => ({
    cancelled: new Subject<boolean>()
  }))
  .views((self) => ({
    get activeLeague() {
      return self.activeProfile?.activeLeague
    },
    get activePriceLeague() {
      return self.activeProfile?.activePriceLeague
    },
    get activeCharacter() {
      return self.activeProfile?.activeCharacter
    },
    get activeLeagueCharacters() {
      return self.characters.filter((c) => c.league?.id === self.activeProfile?.activeLeague.id)
    },
    get activeLeagueStashTabs() {
      return self.stashTabs.filter((st) => st.league?.id === self.activeProfile?.activeLeague.id)
    }
  }))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot AccountEntry: ', _snapshot)
      })
    },
    addProfile(profile: IProfileEntry) {
      self.profiles.push(profile)
    },
    // First set all basic C(R)UD functions
    setActiveProfile(profile?: IProfileEntry) {
      const store = getParent<IStore>(self, 3)
      store.uiStateStore.setChangingProfile(true)
      store.uiStateStore.changeItemTablePage(0)
      self.activeProfile = profile
    },
    updateCharacters(activeApiCharacter: PoeCharacter[]) {
      const activeCharacters = activeApiCharacter.map((c) => toCharacterEntity(c))

      // Update already existent characters
      const removedCharacters: ICharacterEntry[] = []
      self.characters.forEach((pl) => {
        const character = activeCharacters.find((apl) => pl.id === apl.id)
        if (character) {
          pl.updateCharacter(character)
        } else {
          removedCharacters.push(pl)
        }
      })

      // Delete or mark removed characters
      const [toRemove, toKeep] = findEntryToSafeRemove(
        self as IAccountEntry,
        removedCharacters,
        (profile, id) => profile.activeCharacter?.id === id
      )
      toRemove.forEach((c) => {
        self.characters.remove(c)
      })
      toKeep.forEach((c) => {
        c.setDeleted(true)
      })

      // Add new characters
      const newCharacters = activeCharacters.filter(
        (apl) => !self.characters.some((pl) => pl.id === apl.id)
      )
      if (newCharacters.length > 0) {
        self.characters.push(...newCharacters)
      }
    },
    updateLeagueStashTabs(stashTabs: PoePartialStashTab[], league: ILeagueEntry) {
      const activeStashTabs = stashTabs.map((st) => toStashTab(st, league.uuid))

      // Update already existent stashTabs
      const removedStashTabs: IStashTabEntry[] = []
      self.stashTabs
        .filter((st) => st.league?.id === league.id)
        .forEach((st) => {
          const stashTab = activeStashTabs.find((ast) => st.id === ast.id)
          if (stashTab) {
            st.updateStashTab(stashTab)
          } else {
            removedStashTabs.push(st)
          }
        })

      // Delete or mark removed stashTabs
      const [toRemove, toKeep] = findEntryToSafeRemove(
        self as IAccountEntry,
        removedStashTabs,
        (profile, id) => profile.activeStashTabs.some((st) => st.id === id)
      )
      toRemove.forEach((st) => {
        self.stashTabs.remove(st)
      })
      toKeep.forEach((st) => {
        st.setDeleted(true)
      })

      // Add new stashTabs
      const newStashTabs = activeStashTabs.filter(
        (apl) => !self.stashTabs.some((pl) => pl.id === apl.id && pl.league?.id === apl.league?.id)
      )
      if (newStashTabs.length > 0) {
        self.stashTabs.push(...newStashTabs)
      }
      self.stashTabs.forEach((st) => {
        st.setLeague(league)
      })
    }
  }))
  .actions((self) => ({
    queueSnapshot(milliseconds?: number) {
      const store = getParent<IStore>(self, 2)
      // fromStream(
      timer(milliseconds ? milliseconds : store.settingStore.autoSnapshotInterval).pipe(
        map(() => {
          if (self.activeProfile && self.activeProfile.readyToSnapshot) {
            // self.activeProfile.snapshot()
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
