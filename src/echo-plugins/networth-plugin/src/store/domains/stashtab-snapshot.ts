import { computed } from 'mobx'
import { detach, frozen, idProp, model, Model, rootRef, tProp, types } from 'mobx-keystone'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { StashTab } from './stashtab'

export const stashTabSnapshotStashTabRef = rootRef<StashTab>('nw/stashTabSnapshotStashTabRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/stashTabSnapshot')
export class StashTabSnapshot extends Model({
  uuid: idProp,
  stashTab: tProp(types.ref(stashTabSnapshotStashTabRef)), // The stash may not exists anymore - need to be checked for isAlive
  value: tProp(0),
  pricedItems: tProp(types.frozen(types.unchecked<IPricedItem[]>()), () =>
    frozen<IPricedItem[]>([])
  )
}) {}
