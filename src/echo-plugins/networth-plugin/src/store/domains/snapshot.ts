import dayjs from 'dayjs'
import { idProp, model, Model, modelAction, rootRef, tProp, types } from 'mobx-keystone'
import { StashTabSnapshot } from './stashtab-snapshot'

@model('nw/snapshot')
export class Snapshot extends Model({
  uuid: idProp,
  created: tProp(types.number, () => dayjs.utc().valueOf()),
  stashTabSnapshots: tProp(types.array(types.model(StashTabSnapshot)), [])
}) {
  @modelAction
  addStashTabSnapshot(stashTabSnapshot: StashTabSnapshot) {
    this.stashTabSnapshots.push(stashTabSnapshot)
  }
}
