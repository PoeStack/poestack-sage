import { types, getParent, onSnapshot, Instance } from 'mobx-state-tree'
import { LeagueEntry } from './league'
import { CharacterEntry } from './character'
import { StashTabEntry } from './stash-tab'
import { SnapshotEntry } from './snapshot'
import dayjs from 'dayjs'

export interface IProfileEntry extends Instance<typeof ProfileEntry> {}

export const ProfileEntry = types
  .model('ProfileEntry', {
    uuid: types.identifier,
    name: types.string,
    activeLeague: types.safeReference(LeagueEntry),
    activePriceLeague: types.safeReference(LeagueEntry),
    activeCharacter: types.safeReference(CharacterEntry),
    activeStashTabs: types.optional(
      // Account holds the objects
      types.array(types.safeReference(StashTabEntry, { acceptsUndefined: false })),
      []
    ),
    snapshots: types.optional(types.array(SnapshotEntry), []),
    includeEquipment: false,
    includeInventory: false,
    incomeResetAt: dayjs.utc().valueOf()
  })
  .views((self) => ({}))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot ProfileEntry: ', _snapshot)
      })
    }
  }))
