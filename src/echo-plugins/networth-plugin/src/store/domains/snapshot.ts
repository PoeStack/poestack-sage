import dayjs from 'dayjs'
import { idProp, model, Model, modelAction, tProp, types } from 'mobx-keystone'
import { StashTabSnapshot } from './stashtab-snapshot'
import { computed } from 'mobx'

@model('nw/snapshot')
export class Snapshot extends Model({
  uuid: idProp,
  created: tProp(types.number, () => dayjs.utc().valueOf()),
  stashTabs: tProp(types.array(types.model(StashTabSnapshot)), [])
}) {
  @modelAction
  addStashTabSnapshot(stashTabSnapshot: StashTabSnapshot) {
    this.stashTabs.push(stashTabSnapshot)
  }

  @computed
  get totalValue() {
    return this.stashTabs.reduce((total, stashTab) => {
      total += stashTab.totalValue
      return total
    }, 0)
  }
}
