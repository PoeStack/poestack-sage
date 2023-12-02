import { IApiSnapshot } from '../interfaces/api/api-snapshot.interface'
import { IApiStashTabSnapshot } from '../interfaces/api/api-stash-tab-snapshot.interface'
import { IPricedItem } from '../interfaces/priced-item.interface'
import { IStashTab } from '../interfaces/stash.interface'
import { Snapshot } from '../store/domains/snapshot'
import { StashTab } from '../store/domains/stashtab'
import { findItem, getRarityIdentifier, mergeItemStacks } from './item.utils'

export const diffSnapshots = (
  snapshot1: Snapshot,
  snapshot2: Snapshot,
  removedItemsPriceResolver?: (items: IPricedItem[]) => void
) => {
  const difference: IPricedItem[] = []
  const removedItems: IPricedItem[] = []
  const itemsInSnapshot1 = mergeItemStacks(
    snapshot1.stashTabs.flatMap((sts) => sts.pricedItems.data)
  )
  const itemsInSnapshot2 = mergeItemStacks(
    snapshot2.stashTabs.flatMap((sts) => sts.pricedItems.data)
  )

  // items that exist in snapshot 2 but not in snapshot 1 & items that exist in both snapshots but should be updated
  const itemsToAddOrUpdate = itemsInSnapshot2.filter((x) => {
    const foundItem = findItem(itemsInSnapshot1, x)
    if (foundItem === undefined) return true
    if (x.stackSize !== foundItem.stackSize) return true
    return false
  })

  itemsToAddOrUpdate.map((item) => {
    const recentItem = { ...item }
    const existingItem = findItem(itemsInSnapshot1, recentItem)
    if (existingItem) {
      recentItem.stackSize = recentItem.stackSize - existingItem.stackSize
      const existingItemTotal = recentItem.calculated * existingItem.stackSize
      recentItem.total = recentItem.total - existingItemTotal
      if (recentItem.total !== 0 && recentItem.stackSize !== 0) {
        difference.push(recentItem)
      }
    } else if (recentItem.total !== 0 && recentItem.stackSize !== 0) {
      difference.push(recentItem)
    }
  })

  // items that exist in snapshot 1 but not in snapshot 2
  const itemsToRemove = itemsInSnapshot1.filter((x) => findItem(itemsInSnapshot2, x) === undefined)
  itemsToRemove.map((item) => {
    const recentItem = { ...item }
    if (recentItem.total !== 0 && recentItem.stackSize !== 0) {
      recentItem.total = -recentItem.total
      recentItem.stackSize = -recentItem.stackSize
      if (removedItemsPriceResolver) removedItems.push(recentItem)
      difference.push(recentItem)
    }
  })

  if (removedItemsPriceResolver && removedItems.length > 0) removedItemsPriceResolver(removedItems)

  return difference
}

export const filterItems = (items: IPricedItem[], filterText: string) => {
  const rarity = getRarityIdentifier(filterText)

  let itemNameRegex = new RegExp('', 'i')
  try {
    // try/catch required because of filtering being an onChange event, example: typing only [ would lead to a SyntaxError
    itemNameRegex = new RegExp(filterText, 'i')
  } catch (error) {
    console.error(error)
  }

  return mergeItemStacks(
    items.filter(
      (i) =>
        (i.calculated > 0 && i.name.toLowerCase().includes(filterText)) ||
        (i.tab &&
          i.tab
            .map((t) => t.name)
            .join(', ')
            .toLowerCase()
            .includes(filterText)) ||
        (i.calculated > 0 && rarity >= 0 && i.frameType === rarity) ||
        itemNameRegex.test(i.name)
    )
  )
}

export const filterSnapshotItems = (
  snapshots: Snapshot[],
  filterText: string,
  filteredStashTabs: StashTab[] | undefined
) => {
  if (snapshots.length === 0) {
    return []
  }
  const rarity = getRarityIdentifier(filterText)

  let itemNameRegex = new RegExp('', 'i')
  try {
    // try/catch required because of filtering being an onChange event, example: typing only [ would lead to a SyntaxError
    itemNameRegex = new RegExp(filterText, 'i')
  } catch (error) {
    console.error(error)
  }

  return mergeItemStacks(
    snapshots
      .flatMap((sts) =>
        sts.stashTabs.filter(
          (st) =>
            !filteredStashTabs || filteredStashTabs.map((fst) => fst.id).includes(st.stashTabId)
        )
      )
      .flatMap((sts) =>
        sts.pricedItems.data.filter(
          (i) =>
            (i.calculated > 0 && i.name.toLowerCase().includes(filterText)) ||
            (i.tab &&
              i.tab
                .map((t) => t.name)
                .join(', ')
                .toLowerCase()
                .includes(filterText)) ||
            (i.calculated > 0 && rarity >= 0 && i.frameType === rarity) ||
            itemNameRegex.test(i.name)
        )
      )
  )
}
