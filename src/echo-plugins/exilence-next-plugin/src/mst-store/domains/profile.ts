import { types, getParent } from 'mobx-state-tree'
import { LeagueEntry } from './league'
import { CharacterEntry } from './character'
import { StashTabEntry } from './stash-tab'
import { SnapshotEntry } from './snapshot'
import dayjs from 'dayjs'

export const ProfileEntry = types
  .model('ProfileEntry', {
    uuid: types.identifier,
    name: types.string,
    activeLeague: types.reference(LeagueEntry),
    activePriceLeague: types.reference(LeagueEntry),
    activeCharacter: types.reference(CharacterEntry),
    activeStashTabs: types.array(StashTabEntry),
    snapshots: types.array(SnapshotEntry),
    includeEquipment: false,
    includeInventory: false,
    incomeResetAt: dayjs.utc().valueOf()
  })
  .views((self) => ({}))
  .actions((self) => ({}))
