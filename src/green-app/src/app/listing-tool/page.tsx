'use client'

import CharacterSelect from '@/components/character-select'
import DebouncedInput from '@/components/debounced-input'
import { ListingCategorySelect } from '@/components/listing-category-select'
import { currentUserAtom } from '@/components/providers'
import StashSelect from '@/components/stash-select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDivinePrice } from '@/hooks/useDivinePrice'
import { postListing } from '@/lib/http-util'
import { PoeItem } from '@/types/poe-api-models'
import { SageDatabaseOfferingType } from '@/types/sage-listing-type'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FilterFn, filterFns } from '@tanstack/react-table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useAtomValue } from 'jotai'
import { ArrowLeftToLineIcon, ArrowRightToLineIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useShallow } from 'zustand/react/shallow'
import { ListingCard } from './listing-card'
import ListingToolHandler from './listing-tool-handler'
import ListingToolTable from './listing-tool-table'
import { listingToolTableEditModeColumns } from './listing-tool-table-columns'
import { getCategory, useListingToolStore } from './listingToolStore'
import { MyOfferingsCard } from './my-offerings-card'
dayjs.extend(utc)

// TODO:
// Save listings to the localstore without items => When they got inactive(> 30min) then they will move over to another subsection in my-offerings-view
// Errorhandling
// Go through all categories
// Add offerings loading indicator
// Hide "Connect discord" when discord is connected? - Get the current connected discord
// Add "Pin all selected items" switch
// Clear cache on logout

type PageProps = {}

export default function Page() {
  const queryClient = useQueryClient()

  const {
    selectedLeague,
    selectableCategories,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    stashes,
    setStashes,
    selectedListingMode,
    setSelectedListingMode
  } = useListingToolStore(
    useShallow((state) => ({
      selectedLeague: state.league,
      selectableCategories: state.selectableCategories,
      selectedCategory: state.category,
      setSelectedCategory: state.setCategory,
      selectedSubCategory: state.subCategory,
      setSelectedSubCategory: state.setSubCategory,
      stashes: state.stashes[state.league] || [],
      setStashes: state.setStashes,
      selectedListingMode: state.categoryListingMode[getCategory(state)] || 'bulk',
      setSelectedListingMode: state.setCategoryListingMode
    }))
  )

  const [[refetchAll], setRefetchAll] = useState<(() => void)[]>([])
  const [isStashListItemsFetching, setStashListFetching] = useState<boolean>(false)

  useDivinePrice(selectedLeague)

  const mutation = useMutation({
    mutationFn: (listing: SageDatabaseOfferingType) => postListing(listing),
    onMutate: async (offering) => {
      await queryClient.cancelQueries({ queryKey: [currentUser?.profile?.uuid, 'my-listings'] })

      const previousListings = queryClient.getQueryData([currentUser?.profile?.uuid, 'my-listings'])

      queryClient.setQueryData(
        [currentUser?.profile?.uuid, 'my-listings'],
        (old?: SageDatabaseOfferingType[]) => {
          return [
            ...(old || []).filter(
              (x) =>
                !(
                  x.meta.league === offering.meta.league &&
                  x.meta.category === offering.meta.category
                )
            ),
            {
              ...offering,
              meta: {
                ...offering.meta,
                totalPrice: offering.items.reduce(
                  (sum, item) => item.price * item.quantity + sum,
                  0
                )
              }
            }
          ].sort((a, b) => b.meta.timestampMs - a.meta.timestampMs)
        }
      )

      return { previousListings }
    },
    onError: (err, offering, context) => {
      queryClient.setQueryData(
        [currentUser?.profile?.uuid, 'my-listings'],
        context?.previousListings
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [currentUser?.profile?.uuid, 'my-listings'] })
    }
  })

  const currentUser = useAtomValue(currentUserAtom)
  const [selectedIgn, setSelectedIgn] = useState<string | null>(null)

  const [showRightSidePanel, setShowRightSidePanel] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const resetData = useListingToolStore((state) => state.resetData)

  const postItems = useCallback(() => {
    const currentState = useListingToolStore.getState()
    const modifiedItems = currentState.modifiedItems
    const selectedItemsMap = currentState.selectedItems
    const selectedItems = modifiedItems.filter(
      (item) =>
        item.calculatedPrice !== undefined && item.group && selectedItemsMap[item.group.hash]
    )

    if (
      !currentUser?.profile?.uuid ||
      !selectedLeague ||
      !selectedCategory ||
      !selectedIgn ||
      currentState.totalPrice === 0 ||
      currentState.localMultiplier === 0 ||
      selectedItems.length === 0
    ) {
      // Button is disabled but just in case
      return
    }
    const listing: SageDatabaseOfferingType = {
      uuid: uuidv4(),
      userId: currentUser.profile.uuid,
      deleted: false,
      meta: {
        league: selectedLeague,
        category: selectedCategory,
        subCategory: selectedSubCategory || 'ALL',
        ign: selectedIgn,
        listingMode: selectedListingMode,
        timestampMs: dayjs.utc().valueOf(),
        tabs: stashes.map((s) => s.id)
      },
      items: selectedItems
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .map((e) => ({
          hash: e.group!.hash,
          quantity: e.stackSize,
          price: e.calculatedPrice!
        }))
    }

    console.log(listing)
    mutation.mutate(listing)
  }, [
    currentUser?.profile?.uuid,
    mutation,
    selectedCategory,
    selectedSubCategory,
    selectedIgn,
    selectedLeague,
    selectedListingMode,
    stashes
  ])

  const postListingButtonDisabled =
    !currentUser?.profile?.uuid || !selectedLeague || !selectedCategory || !selectedIgn

  const columns = useMemo(() => {
    return listingToolTableEditModeColumns()
  }, [])

  const fuzzyFilter: FilterFn<PoeItem> = useCallback((row, columnId, filterValue, addMeta) => {
    return filterFns.includesString(row, columnId, filterValue, addMeta)
  }, [])

  const handleRefetchAll = useCallback((refetchAll: () => void) => {
    setRefetchAll([refetchAll])
  }, [])

  return (
    <>
      <ListingToolHandler
        setRefetchAll={handleRefetchAll}
        setStashListFetching={setStashListFetching}
      />
      <div className="flex flex-row">
        <div className="flex flex-1" />
        <div className="flex flex-row gap-2">
          <div className="min-h-full min-w-[160px] max-w-[230px]">
            <div className="flex flex-col gap-2 sticky top-[4.5rem] h-fit">
              <div className="flex flex-row gap-1">
                <CharacterSelect selectedLeague={selectedLeague} onIgnSelect={setSelectedIgn} />
              </div>
              <StashSelect
                className="flex h-[500px]"
                league={selectedLeague}
                selected={stashes}
                onSelect={setStashes}
                isStashListItemsFetching={isStashListItemsFetching}
                onLoadStashTabsClicked={() => {
                  console.warn('trigger load tabs')
                  refetchAll?.()
                }}
              />
              <ListingCard
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
                postListingButtonDisabled={postListingButtonDisabled}
                isPostListingLoading={mutation.isPending}
                listingMode={selectedListingMode}
                onListingModeChange={setSelectedListingMode}
                onPostItemsClicked={postItems}
              />
            </div>
          </div>
          <div className="flex flex-col w-[1024px]">
            <div className="flex flex-row justify-start items-center pb-2 gap-x-2">
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={(value) => setGlobalFilter(String(value))}
                onBlur={(value) => setGlobalFilter(String(value))}
                className="pl-8 max-w-60"
                placeholder={'Search ...'}
                startIcon={
                  <div className="p-2">
                    <MagnifyingGlassIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </div>
                }
              />
              <div className="w-40">
                <ListingCategorySelect
                  control="select"
                  isSubCategory={false}
                  selectableCategories={selectableCategories}
                  category={selectedCategory}
                  subCategory={selectedSubCategory}
                  onCategorySelect={setSelectedCategory}
                  onSubCategorySelect={setSelectedSubCategory}
                />
              </div>
              <div className="w-40">
                <ListingCategorySelect
                  control="select"
                  isSubCategory
                  selectableCategories={selectableCategories}
                  category={selectedCategory}
                  subCategory={selectedSubCategory}
                  onCategorySelect={setSelectedCategory}
                  onSubCategorySelect={setSelectedSubCategory}
                />
              </div>
              <div className="flex-1" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="default">
                    Reset data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. <br />
                      If you confirm, the following data will be reset:
                      <ul className="list-disc pl-4">
                        <li>Multiplier per (sub-)category</li>
                        <li>Sellmode per (sub-)category</li>
                        <li>Overrides/Overprices</li>
                        <li>Unselected items</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => resetData()}>Reset Data</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowRightSidePanel((prev) => !prev)}
              >
                {showRightSidePanel ? (
                  <ArrowLeftToLineIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightToLineIcon className="w-4 h-4" />
                )}
              </Button>
              {/* <Button
              variant="secondary"
              size="default"
              onClick={() => setShowFilter((prev) => !prev)}
            >
              Show Filter
            </Button> */}
            </div>
            <ListingToolTable
              className=""
              columns={columns as any}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              globalFilterFn={fuzzyFilter as any}
            />
          </div>
          {showRightSidePanel && (
            <div className="min-h-full w-[300px] min-w-[215px]">
              <div className="h-11" />
              <div className="flex flex-col gap-2 sticky top-[4.25rem] h-fit">
                <MyOfferingsCard
                  league={selectedLeague}
                  setCategory={setSelectedCategory}
                  setSubCategory={setSelectedSubCategory}
                  setStashes={setStashes}
                  setListingMode={setSelectedListingMode}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1" />
      </div>
    </>
  )
}
