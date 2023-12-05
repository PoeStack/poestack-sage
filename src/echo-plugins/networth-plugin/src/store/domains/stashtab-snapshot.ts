import { frozen, idProp, model, Model, rootRef, tProp, types } from 'mobx-keystone'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { StashTab } from './stashtab'
import { computed } from 'mobx'

export const stashTabSnapshotStashTabRef = rootRef<StashTab>('nw/stashTabSnapshotStashTabRef')

@model('nw/stashTabSnapshot')
export class StashTabSnapshot extends Model({
  uuid: idProp,
  // The stash may be deleted. The stash can be a snapshot for a character and has no reference
  stashTabId: tProp(types.string),
  value: tProp(0).withSetter(),
  pricedItems: tProp(types.frozen(types.unchecked<IPricedItem[]>()), () =>
    frozen<IPricedItem[]>([])
  )
}) {
  @computed
  get totalValue() {
    return this.pricedItems.data.reduce((total, item) => total + item.total, 0)
  }
}
