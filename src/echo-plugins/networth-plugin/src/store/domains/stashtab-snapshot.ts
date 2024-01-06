import { idProp, model, Model, prop, rootRef, tProp, types } from 'mobx-keystone'
import { IDisplayedItem, IPricedItem } from '../../interfaces/priced-item.interface'
import { StashTab } from './stashtab'
import { computed } from 'mobx'
import { PersistWrapper } from '../../utils/persist.utils'
import { mapItemsToDisplayedItems, mergeItemStacks } from '../../utils/item.utils'

export const stashTabSnapshotStashTabRef = rootRef<StashTab>('nw/stashTabSnapshotStashTabRef')

@model('nw/stashTabSnapshot')
export class StashTabSnapshot extends Model(
  ...PersistWrapper({
    uuid: idProp,
    // The stash may be deleted. The stash can be a snapshot for a character and has no reference
    stashTabId: tProp(types.string),
    value: tProp(0).withSetter(),
    pricedItems: prop<IPricedItem[]>(() => []),
    version: prop(1)
  })
) {
  _displayedItems: IDisplayedItem[] = []
  _isInit = false

  get displayedItems() {
    // Displayed items are static and @computed somehow does compute sometimes new although its not changed
    if (this._isInit) return this._displayedItems
    this._isInit = true
    const displayedItems = mapItemsToDisplayedItems(this.pricedItems)
    this._displayedItems = mergeItemStacks(displayedItems)
    // Set value once
    this.setValue(this._displayedItems.reduce((total, item) => total + item.total, 0))
    return this._displayedItems
  }

  @computed
  get totalValue() {
    return this.value
  }
}
