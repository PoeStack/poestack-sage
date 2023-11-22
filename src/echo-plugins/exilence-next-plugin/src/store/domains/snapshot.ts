import { Instance, types } from 'mobx-state-tree'
import { StashTabSnapshotEntry, IStashTabSnapshotEntry } from './stashtab-snapshot'
import dayjs from 'dayjs'

export interface ISnapshotEntry extends Instance<typeof SnapshotEntry> {}

export const SnapshotEntry = types
  .model('SnapshotEntry', {
    uuid: types.identifier,
    created: types.optional(types.number, () => dayjs.utc().valueOf()),
    stashTabSnapshots: types.optional(types.array(StashTabSnapshotEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({
    addStashTabSnapshot(stashTabSnapshot: IStashTabSnapshotEntry) {
      self.stashTabSnapshots.push(stashTabSnapshot)
    },
    removeStashTabSnapshot(stashTabSnapshot: IStashTabSnapshotEntry) {
      self.stashTabSnapshots.remove(stashTabSnapshot)
    },
    setStashTabSnapshots(stashTabSnapshots: IStashTabSnapshotEntry[]) {
      self.stashTabSnapshots.replace(stashTabSnapshots)
    }
  }))
