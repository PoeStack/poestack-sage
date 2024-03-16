import { useListingToolStore } from '@/app/[locale]/listing-tool/listingToolStore'
import { currentUserAtom } from '@/components/providers'
import { DEFAULT_VALUATION_INDEX } from '@/lib/constants'
import { listStash, listValuations } from '@/lib/http-util'
import { ItemGroupingService } from 'sage-common'
import {
  createCompactTab,
  filterPricedItems,
  mapItemsToDisplayedItems,
  mapItemsToPricedItems,
  mapMapStashItemToPoeItem,
  mergeItemStacks,
  mergeItems
} from '@/lib/item-util'
import { LISTING_CATEGORIES, ListingCategory, ListingSubCategory } from '@/lib/listing-categories'
import { IStashTab } from '@/types/echo-api/stash'
import { GroupedItem, StashItem, ValuatedItem } from '@/types/item'
import { PoeItem } from '@/types/poe-api-models'
import { useQueries } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { memo, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

type SelectableCategories = Record<
  string,
  {
    category: ListingCategory
    count: number
    subcategories: Record<
      string,
      {
        subCategory: ListingSubCategory
        count: number
      }
    >
  }
>

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
  const setSelectableSubCategories = useListingToolStore(
    (state) => state.setSelectableSubCategories
  )

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
    data: [categoryTagItem, selectableCategories, ungroupedItems],
    isGroupedItemsSuccess,
    isGroupedItemsLoading,
    isGroupedItemsFetching,
    isGroupedItemsError,
    refetchAll
  } = useMemo(() => {
    const categoryTagItem: Record<string, GroupedItem[]> = {}
    const selectableCategories: SelectableCategories = {}
    const ungroupedItems: StashItem[] = []

    groupedItemsResults.forEach((result) => {
      result.data?.map((item) => {
        let itemInSelectedCategory = false

        if (item.group) {
          const selectedItemMainCategory = LISTING_CATEGORIES.find(
            (c) => c.name === selectedCategory && c.tags.includes(item.group!.primaryGroup.tag)
          )
          const selectedItemSubCategory = selectedItemMainCategory?.subCategories.find(
            (c) => c.name === selectedSubCategory
          )

          itemInSelectedCategory = selectedSubCategory
            ? !!selectedItemSubCategory?.tags.includes(item.group.primaryGroup.tag)
            : !!selectedItemMainCategory

          const currentItemCategories = LISTING_CATEGORIES.filter((e) =>
            e.tags.includes(item.group!.primaryGroup.tag)
          )

          currentItemCategories.forEach((currentCategory) => {
            const itemIncluded = currentCategory.filter?.({ group: item.group!.primaryGroup })
            if (itemIncluded === false) {
              itemInSelectedCategory = false
              return
            }
            if (!selectableCategories[currentCategory.name]) {
              selectableCategories[currentCategory.name] = {
                category: currentCategory,
                count: 1,
                subcategories: {}
              }
            } else {
              selectableCategories[currentCategory.name].count += 1
            }

            const selectableSubcategories =
              selectableCategories[currentCategory.name].category.subCategories

            const selectableMainSubcategories = selectableSubcategories.filter((c) => !c.restItems)
            const selectableRestSubcategories = selectableSubcategories.filter((c) => c.restItems)

            const excludeItem = (subCategory: ListingSubCategory) => {
              if (subCategory === selectedItemSubCategory) {
                itemInSelectedCategory = false
              }
            }

            selectableMainSubcategories.forEach((subCategory) => {
              if (!item.group) return excludeItem(subCategory)
              const itemInGroup = subCategory.tags.includes(item.group.primaryGroup.tag)
              const itemIncluded = subCategory.filter?.({ group: item.group.primaryGroup })
              if (!((itemIncluded ?? true) && itemInGroup)) return excludeItem(subCategory)

              if (!selectableCategories[currentCategory.name].subcategories[subCategory.name]) {
                selectableCategories[currentCategory.name].subcategories[subCategory.name] = {
                  count: 1,
                  subCategory
                }
              } else {
                selectableCategories[currentCategory.name].subcategories[subCategory.name].count +=
                  1
              }
            })
            selectableRestSubcategories.forEach((subCategory) => {
              if (!item.group) return excludeItem(subCategory)
              const itemInGroup = subCategory.tags.includes(item.group.primaryGroup.tag)
              const itemIncluded = subCategory.filter?.({ group: item.group.primaryGroup })
              if (!((itemIncluded ?? true) && itemInGroup)) return excludeItem(subCategory)
              const itemInOtherCat = selectableMainSubcategories.some((c) => {
                const itemInGroup = c.tags.includes(item.group!.primaryGroup.tag)
                const itemIncluded = c.filter?.({ group: item.group!.primaryGroup })
                return (itemIncluded ?? true) && itemInGroup
              })
              if (itemInOtherCat) return excludeItem(subCategory)

              if (!selectableCategories[currentCategory.name].subcategories[subCategory.name]) {
                selectableCategories[currentCategory.name].subcategories[subCategory.name] = {
                  count: 1,
                  subCategory
                }
              } else {
                selectableCategories[currentCategory.name].subcategories[subCategory.name].count +=
                  1
              }
            })
          })
        }

        if (item.group && (itemInSelectedCategory || !selectedCategory)) {
          if (categoryTagItem[item.group.primaryGroup.tag]) {
            categoryTagItem[item.group.primaryGroup.tag].push(item)
          } else {
            categoryTagItem[item.group.primaryGroup.tag] = [item]
          }
        } else if (!selectedCategory) {
          // No category items; No valuated items; Only stackable items will be shown
          ungroupedItems.push(item)
        }
      })
    })

    console.log(selectableCategories)

    return {
      data: [categoryTagItem, selectableCategories, ungroupedItems],
      isGroupedItemsSuccess: groupedItemsResults.some((result) => result.isSuccess),
      isGroupedItemsLoading: groupedItemsResults.some((result) => result.isLoading),
      isGroupedItemsFetching: groupedItemsResults.some((result) => result.isFetching),
      isGroupedItemsError: groupedItemsResults.some((result) => result.isError),
      refetchAll: () =>
        groupedItemsResults.forEach((result) => {
          result.refetch()
        })
    }
  }, [groupedItemsResults, selectedCategory, selectedSubCategory])

  useEffect(() => {
    // Autoselect logic:
    // - If the selected tag has items autoselect the first tag which was found with the most items in it
    // - If the next stashes contains the selected tag, then do not change the tag. Even if stashes are reloaded
    // - If a stash selected but not loaded the tag will not deselected
    // - Auto deselect tag when the selected tag is not available
    if (!(isGroupedItemsSuccess && !isGroupedItemsFetching)) return

    const selectedCategoryWithItems = Object.values(selectableCategories).find(
      (category) => category.category.name === selectedCategory && category.count > 0
    )

    if (selectedCategoryWithItems) {
      const selectedSubCategoryWithItems = Object.values(
        selectedCategoryWithItems.subcategories
      ).find((category) => category.subCategory.name === selectedSubCategory && category.count > 0)
      if (!selectedSubCategoryWithItems) {
        const subCategory = Object.entries(selectedCategoryWithItems.subcategories).toSorted(
          (a, b) => b[1].count - a[1].count
        )[0]
        setSelectedSubCategory(subCategory?.[0] || null)
      }
      return
    }

    if (Object.keys(selectableCategories).length === 0) {
      console.log('Deselect category')
      setSelectedCategory(null)
      setSelectedSubCategory(null)
      return
    }

    const category = Object.entries(selectableCategories).toSorted(
      (a, b) => b[1].count - a[1].count
    )[0]

    const subCategory = Object.entries(category[1].subcategories).toSorted(
      (a, b) => b[1].count - a[1].count
    )[0]

    if (category[0]) {
      console.log('Autoselect category', category[0])
      setSelectedCategory(category[0])
      setSelectedSubCategory(subCategory?.[0] || null)
    } else {
      console.log('Deselect category')
      setSelectedCategory(null)
      setSelectedSubCategory(null)
    }
    // Some objects are not stable! We use booleans to determine the change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, stashes, isGroupedItemsSuccess, isGroupedItemsFetching, setSelectedCategory])

  const {
    data: displayedItems,
    isValuationPending,
    isValuationError
  } = useQueries({
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
        .flat()

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
        .flat()

      displayedItems = mergeItemStacks(displayedItems)

      const isValuationPending = valuationResults.some((result) => result.isPending)
      const isValuationError =
        isGroupedItemsError || valuationResults.some((result) => result.isError)
      return {
        data: isGroupedItemsLoading || isValuationPending || isValuationError ? [] : displayedItems,
        isValuationPending,
        isValuationError
      }
    }
  })

  useEffect(() => {
    console.log('Set setInitialItems')
    setInitialItems(displayedItems)
  }, [displayedItems, selectedCategory, selectedSubCategory, setInitialItems])

  useEffect(() => {
    console.log('Set refetchAll')
    setRefetchAll(refetchAll)
  }, [refetchAll, setRefetchAll])

  useEffect(() => {
    console.log('Set setStashListFetching')
    setStashListFetching(isGroupedItemsLoading || isValuationPending)
  }, [isGroupedItemsLoading, isValuationPending, isValuationError, setStashListFetching])

  useEffect(() => {
    console.log('Set setSelectableCategories and setSelectableSubCategories')
    setSelectableCategories(Object.values(selectableCategories).map((cat) => cat.category))
    setSelectableSubCategories(
      Object.values(selectableCategories).flatMap((cat) =>
        Object.values(cat.subcategories).map((subCat) => subCat.subCategory)
      )
    )
  }, [selectableCategories, setSelectableCategories, setSelectableSubCategories])

  return null
}

export default memo(ListingToolHandler)
