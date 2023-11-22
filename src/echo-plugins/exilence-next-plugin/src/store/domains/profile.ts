import { types, getParent, onSnapshot, Instance } from 'mobx-state-tree'
import { LeagueEntry, ILeagueEntry } from './league'
import { CharacterEntry, ICharacterEntry } from './character'
import { StashTabEntry, IStashTabEntry } from './stash-tab'
import { SnapshotEntry, ISnapshotEntry } from './snapshot'
import dayjs from 'dayjs'
import { IPriceStore } from '../priceStore'
import { IStore } from '../rootStore'
import { IAccountLeagueEntry } from './account-league'
import { ILeague } from '../../interfaces/league.interface'
import { ILeaguePriceDetailsEntry } from './league-price-details'

export interface IProfileEntry extends Instance<typeof ProfileEntry> {}

export const ProfileEntry = types
  .model('ProfileEntry', {
    uuid: types.identifier,
    name: types.string,
    activeLeague: types.reference(LeagueEntry),
    activePriceLeague: types.reference(LeagueEntry),
    activeCharacter: types.maybe(types.reference(CharacterEntry)),
    activeStashTabs: types.optional(
      // Account holds the objects
      types.array(types.safeReference(StashTabEntry, { acceptsUndefined: false })),
      []
    ),
    snapshots: types.optional(types.array(SnapshotEntry), []),
    includeEquipment: false,
    includeInventory: false,
    incomeResetAt: types.maybe(types.number)
  })
  .views((self) => ({
    get isProfileValid() {
      return (
        !self.activeLeague.deleted &&
        !self.activePriceLeague.deleted &&
        !self.activeCharacter?.deleted &&
        self.activeStashTabs.every((st) => !st.deleted)
      )
    },

    get readyToSnapshot(): boolean {
      const { priceStore, uiStateStore } = getParent<IStore>(self, 3) // Account -> AccountStore -> RootStore

      return (
        self.activeStashTabs.length > 0 &&
        !priceStore.isUpdatingPrices &&
        uiStateStore.validated &&
        uiStateStore.initiated &&
        !uiStateStore.isSnapshotting &&
        this.isProfileValid
        // store.rateLimitStore.retryAfter === 0
      )
    }
  }))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot ProfileEntry: ', _snapshot)
      })
    },
    // First set all basic C(R)UD functions
    setActiveLeague(league: ILeagueEntry) {
      self.activeLeague = league
    },
    setActivePriceLeague(league: ILeagueEntry) {
      self.activePriceLeague = league
    },
    setActiveCharacter(character: ICharacterEntry) {
      self.activeCharacter = character
    },
    addActiveStashTab(stashTab: IStashTabEntry) {
      self.activeStashTabs.push(stashTab)
    },
    removeActiveStashTab(stashTab: IStashTabEntry) {
      self.activeStashTabs.remove(stashTab)
    },
    setActiveStashTabs(stashTabs: IStashTabEntry[]) {
      self.activeStashTabs.replace(stashTabs)
    },
    setIncludeEquipment(includeEquipment: boolean) {
      self.includeEquipment = includeEquipment
    },
    setIncludeInventory(includeInventory: boolean) {
      self.includeInventory = includeInventory
    },
    setIncomeResetAt(resetAt: number) {
      self.incomeResetAt = resetAt
    },
    unshiftSnapshot(snapshot: ISnapshotEntry) {
      self.snapshots.unshift(snapshot)
    },
    removeSnapshot(snapshot: ISnapshotEntry) {
      self.snapshots.remove(snapshot)
    },
    setSnapshots(snapshots: ISnapshotEntry[]) {
      self.snapshots.replace(snapshots)
    }
  }))
  .actions((self) => ({}))
