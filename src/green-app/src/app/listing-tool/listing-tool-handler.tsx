import { useListingToolStore } from '@/app/listing-tool/listingToolStore'
import { currentUserAtom } from '@/components/providers'
import { DEFAULT_VALUATION_INDEX } from '@/lib/constants'
import { listStash, listValuations } from '@/lib/http-util'
import { ItemGroupingService } from '@/lib/item-grouping-service'
import {
  createCompactTab,
  filterPricedItems,
  mapItemsToDisplayedItems,
  mapItemsToPricedItems,
  mapMapStashItemToPoeItem,
  mergeItemStacks,
  mergeItems
} from '@/lib/item-util'
import { LISTING_CATEGORIES } from '@/lib/listing-categories'
import { IStashTab } from '@/types/echo-api/stash'
import { GroupedItem, StashItem, ValuatedItem } from '@/types/item'
import { PoeItem } from '@/types/poe-api-models'
import { useQueries } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { memo, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

type ListingToolHandlerProps = {
  setRefetchAll: (refetchAll: () => void) => void
  setStashListFetching: (fetching: boolean) => void
}

const ListingToolHandler = ({ setRefetchAll, setStashListFetching }: ListingToolHandlerProps) => {
  const currentUser = useAtomValue(currentUserAtom)
  const stashes = useListingToolStore(useShallow((state) => state.stashes[state.league] || []))
  const league = useListingToolStore((state) => state.league)
  const selectedCategory = useListingToolStore((state) => state.category)
  const selectedSubCategory = useListingToolStore((state) => state.subCategory)
  const setSelectedCategory = useListingToolStore((state) => state.setCategory)
  const setSelectedSubCategory = useListingToolStore((state) => state.setSubCategory)
  const setInitialItems = useListingToolStore((state) => state.setInitialItems)
  const setSelectableCategories = useListingToolStore((state) => state.setSelectableCategories)

  // const setRefetchAll = useSetAtom(refetchAllAtom)
  // const setStashListFetching = useSetAtom(stashListFetchingAtom)

  // TODO: Attention, this data is not stable! idk how to fix it. Is not fixable with useMemo somehow idk.
  const groupedItemsResults = useQueries({
    queries: stashes
      ? stashes.map((stash) => {
          return {
            queryKey: [currentUser?.profile?.uuid, 'stash', league, stash.id],
            queryFn: async () => {
              if (!currentUser?.profile?.uuid || !league) return []
              const stashItems = await listStash(league, stash.id)

              let items: PoeItem[] = []
              if (stashItems.type === 'MapStash') {
                items = mapMapStashItemToPoeItem(stashItems, league)
              } else if (stashItems.items) {
                items = stashItems.items
              }
              return new ItemGroupingService().withGroup(items).map((x) => ({ ...x, stash }))
            },
            enabled: false
          }
        })
      : []
  })

  const {
    data: [categoryTagItem, selectableTagsCount, ungroupedItems],
    // isGroupedItemsPending,
    isGroupedItemsSuccess,
    isGroupedItemsLoading,
    isGroupedItemsFetching,
    isGroupedItemsError,
    refetchAll
  } = useMemo(() => {
    const categoryTagItem: Record<string, GroupedItem[]> = {}
    const selectableTags: Record<string, number> = {}
    const ungroupedItems: StashItem[] = []
    groupedItemsResults.forEach((result) => {
      result.data?.map((item) => {
        const category = LISTING_CATEGORIES.find((e) => e.name === selectedCategory)
        if (
          item.group &&
          (category?.tags?.includes(item.group.primaryGroup.tag) || !selectedCategory)
        ) {
          if (categoryTagItem[item.group.primaryGroup.tag]) {
            categoryTagItem[item.group.primaryGroup.tag].push(item)
          } else {
            categoryTagItem[item.group.primaryGroup.tag] = [item]
          }
        } else if (!selectedCategory) {
          // No category items; No valuated items; Only stackable items will be shown
          ungroupedItems.push(item)
        }

        if (item.group) {
          selectableTags[item.group.primaryGroup.tag] ??= 0
          selectableTags[item.group.primaryGroup.tag] += 1
        }
      })
    })

    return {
      data: [categoryTagItem, selectableTags, ungroupedItems],
      // isGroupedItemsPending: groupedItemsResults.some((result) => result.isPending),
      isGroupedItemsSuccess: groupedItemsResults.some((result) => result.isSuccess),
      isGroupedItemsLoading: groupedItemsResults.some((result) => result.isLoading),
      isGroupedItemsFetching: groupedItemsResults.some((result) => result.isFetching),
      isGroupedItemsError: groupedItemsResults.some((result) => result.isError),
      refetchAll: () =>
        groupedItemsResults.forEach((result) => {
          result.refetch()
        })
    }
  }, [groupedItemsResults, selectedCategory])

  useEffect(() => {
    // Autoselect logic:
    // - If the selected tag has items autoselect the first tag which was found with the most items in it
    // - If the next stashes contains the selected tag, then do not change the tag. Even if stashes are reloaded
    // - If a stash selected but not loaded the tag will not deselected
    // - Auto deselect tag when the selected tag is not available
    if (!(isGroupedItemsSuccess && !isGroupedItemsLoading)) return

    const selectedCategoryContainsItems = Object.values(categoryTagItem).some(
      (items) => items.length > 0
    )

    if (selectedCategoryContainsItems && selectedCategory) return

    if (Object.keys(selectableTagsCount).length === 0) {
      console.log('Deselect category')
      setSelectedCategory(null)
      setSelectedSubCategory(null)
      return
    }

    const tagToSelect = Object.entries(selectableTagsCount).sort((a, b) => b[1] - a[1])[0]

    const category = LISTING_CATEGORIES.find((e) => e.tags.includes(tagToSelect[0]))
    if (category) {
      console.log('Autoselect category', category.name)
      setSelectedCategory(category.name)
      setSelectedSubCategory(null)
    }
    // Some objects are not stable! We use booleans to determine the change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, stashes, isGroupedItemsSuccess, isGroupedItemsLoading, setSelectedCategory])

  const { data: displayedItems, isValuationPending } = useQueries({
    queries:
      categoryTagItem && league
        ? Object.keys(categoryTagItem).map((tag) => {
            return {
              queryKey: ['valuations', league, tag],
              queryFn: () => listValuations(league, tag),
              gcTime: 20 * 60 * 1000,
              staleTime: 20 * 60 * 1000,
              enabled: !!league && !!tag
            }
          })
        : [], // if users is undefined, an empty array will be returned
    combine: (valuationResults) => {
      const valuationShards = valuationResults
        .filter((x) => x.data && !x.isPending)
        .map((x) => x.data!)

      const valuationItems = Object.entries(categoryTagItem)
        .map(([tag, items]) => {
          const valuations = valuationShards.find((shard) => shard.meta.tag === tag)?.valuations
          return items.map((item): GroupedItem | ValuatedItem => {
            if (valuations && item.group && valuations[item.group.primaryGroup.hash]) {
              return {
                ...item,
                valuation: valuations[item.group.primaryGroup.hash]
              }
            }
            return item
          })
        })
        .flatMap((x) => x)

      // Merge all items to stashtabs
      const mergedStashItems: { stashTab: IStashTab; valuation: ValuatedItem[] }[] = []
      valuationItems.forEach((item) => {
        if (item) {
          const stashTab = mergedStashItems.find((x) => x.stashTab.id === item.stash.id)
          if (stashTab) {
            stashTab.valuation.push(item)
          } else {
            mergedStashItems.push({ stashTab: item.stash, valuation: [item] })
          }
        }
      })
      // Not grouped items - Which are not selectable and an overprice can not be set
      ungroupedItems.forEach((item) => {
        const stashTab = mergedStashItems.find((x) => x.stashTab.id === item.stash.id)
        if (stashTab) {
          stashTab.valuation.push(item)
        } else {
          mergedStashItems.push({ stashTab: item.stash, valuation: [item] })
        }
      })
      const currentState = useListingToolStore.getState()
      const selectedMultiplier = currentState.localMultiplier / 100
      const overprices = currentState.overprices

      let displayedItems = mergedStashItems
        .map((valuatedStash) => {
          const compactStash = createCompactTab(valuatedStash.stashTab)
          let pricedItems = mapItemsToPricedItems(
            valuatedStash.valuation,
            compactStash,
            DEFAULT_VALUATION_INDEX
          )
          pricedItems = filterPricedItems(pricedItems, selectedCategory, selectedSubCategory)
          const pricedStackedItems = mergeItems(pricedItems)
          return mapItemsToDisplayedItems(pricedStackedItems, selectedMultiplier, overprices)
        })
        .flatMap((x) => x)

      displayedItems = mergeItemStacks(displayedItems)

      const isValuationError =
        isGroupedItemsError || valuationResults.some((result) => result.isError)
      const isValuationFetching =
        isGroupedItemsFetching || valuationResults.some((result) => result.isFetching)
      return {
        data: isValuationError || isValuationFetching ? [] : displayedItems,
        // We have stash indicators for error handling or informations
        // data: displayedItems,
        isValuationPending: valuationResults.some((result) => result.isPending),
        isValuationFetching,
        isValuationError
      }
    }
  })

  useEffect(() => {
    console.log('Set setInitialItems')
    setInitialItems(displayedItems, selectedCategory + (selectedSubCategory || ''))
  }, [displayedItems, selectedCategory, selectedSubCategory, setInitialItems])

  useEffect(() => {
    console.log('Set refetchAll')
    setRefetchAll(refetchAll)
  }, [refetchAll, setRefetchAll])

  useEffect(() => {
    console.log('Set setStashListFetching')
    setStashListFetching(isGroupedItemsFetching || isValuationPending)
  }, [isGroupedItemsFetching, isValuationPending, setStashListFetching])

  useEffect(() => {
    console.log('Set setSelectableCategories')
    const selectableCategories = LISTING_CATEGORIES.filter((category) =>
      Object.keys(selectableTagsCount)?.some((tag) => category.tags.includes(tag))
    )
    setSelectableCategories(selectableCategories)
  }, [selectableTagsCount, setSelectableCategories])

  return null
}

export default memo(ListingToolHandler)
