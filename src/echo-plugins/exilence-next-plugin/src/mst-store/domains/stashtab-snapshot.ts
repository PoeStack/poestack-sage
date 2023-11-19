import { types } from 'mobx-state-tree'
import { IPricedItem } from '../../interfaces/priced-item.interface'

export const StashTabSnapshotEntry = types
  .model('StashTabSnapshotEntry', {
    uuid: types.identifier,
    stashTabId: types.string, // The stash may not exists anymore for old snapshots
    value: 0,
    pricedItems: types.frozen<IPricedItem[]>([]) // Immutable!
  })
  .views((self) => ({}))
  .actions((self) => ({}))
