import dayjs from 'dayjs'
import { idProp, model, Model, modelAction, prop, tProp, types } from 'mobx-keystone'
import { StashTabSnapshot } from './stashtab-snapshot'
import { computed } from 'mobx'
import { PersistWrapper } from '../../utils/persist.utils'

@model('nw/snapshot')
export class Snapshot extends Model(
  ...PersistWrapper({
    uuid: idProp,
    created: tProp(types.number, () => dayjs.utc().valueOf()),
    stashTabs: tProp(types.array(types.model(StashTabSnapshot)), []),
    version: prop(1)
  })
) {
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
