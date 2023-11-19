import { types } from 'mobx-state-tree'
import dayjs from 'dayjs'
import { StashTabSnapshotEntry } from './stashtab-snapshot'

export const SnapshotEntry = types
  .model('SnapshotEntry', {
    uuid: types.identifier,
    created: dayjs.utc().valueOf(),
    stashTabSnapshots: types.array(StashTabSnapshotEntry)
  })
  .views((self) => ({}))
  .actions((self) => ({}))
