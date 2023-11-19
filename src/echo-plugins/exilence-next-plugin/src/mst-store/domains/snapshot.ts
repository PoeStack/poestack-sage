import { types } from 'mobx-state-tree'
import { StashTabSnapshotEntry } from './stashtab-snapshot'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
// Top level extend does not work corretly
dayjs.extend(utc)
dayjs.extend(relativeTime)

export const SnapshotEntry = types
  .model('SnapshotEntry', {
    uuid: types.identifier,
    created: dayjs.utc().valueOf(),
    stashTabSnapshots: types.optional(types.array(StashTabSnapshotEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
