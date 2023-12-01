import { computed } from 'mobx'
import { detach, frozen, idProp, model, Model, rootRef, tProp, types } from 'mobx-keystone'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { StashTab } from './stashtab'
import { ICompactTab, IStashTabNode } from '../../interfaces/stash.interface'

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
  // The stash may be deleted. The stash can be a snapshot for a character and has no reference
  stashTab: tProp(
    types.or(types.ref(stashTabSnapshotStashTabRef), types.frozen(types.unchecked<ICompactTab>()))
  ),
  value: tProp(0),
  pricedItems: tProp(types.frozen(types.unchecked<IPricedItem[]>()), () =>
    frozen<IPricedItem[]>([])
  )
}) {}
