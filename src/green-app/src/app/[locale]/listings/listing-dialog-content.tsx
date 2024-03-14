'use client'

import { currentDivinePriceAtom } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWhisperHashCopied } from '@/hooks/useWhisperHash'
import { cn } from '@/lib/utils'
import { createWishperAndCopyToClipboard } from '@/lib/whsiper-util'
import { SageListingItemType } from '@/types/sage-listing-type'
import { FilterFn, filterFns } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { RefreshCwIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import ListingMetaOverview from './listing-meta-overview'
import ListingTable from './listing-table'
import { listingTableBulkModeColumns, listingTradeSingleModeColumns } from './listing-table-columns'
import { getListingsByCategory, useListingsStore } from './listingsStore'
import { useTranslation } from 'react-i18next'

type ListingDialogContentProps = {}

export default function ListingDialogContent() {
  const { t } = useTranslation()
  // FilteredListings can only be undefined, if we would remove deleted listings. But for this we have to ensure, that the dialog get closed automatically or something else
  const selectedListing = useListingsStore(
    useShallow(
      (state) => getListingsByCategory(state).find((l) => l.uuid === state.selectedListingId)!
    )
  )
  const [copyBtnDisabled, isLoading, messageCopied, messageSent, setMessageCopied] =
    useWhisperHashCopied(selectedListing)

  const divinePrice = useAtomValue(currentDivinePriceAtom)

  const fuzzyFilter: FilterFn<SageListingItemType> = useCallback(
    (row, columnId, filterValue, addMeta) => {
      return filterFns.includesString(row, columnId, filterValue, addMeta)
    },
    []
  )

  const columns = useMemo(() => {
    if (selectedListing.meta.listingMode === 'bulk') {
      return listingTableBulkModeColumns()
    } else {
      return listingTradeSingleModeColumns()
    }
  }, [selectedListing.meta.listingMode])

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('title.bulkListing')}</DialogTitle>
        {/* <DialogDescription></DialogDescription> */}
      </DialogHeader>
      <ScrollArea className="max-h-[70vh]">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-2">
            <ListingMetaOverview selectedListing={selectedListing} />
            {/* These values need to be stable! */}
            {/* <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Item Filter</AccordionTrigger>
                <AccordionContent>
                  <ListingFilterCard
                    className=""
                    category={selectedListing.meta.category}
                    filterGroups={subFilterGroups}
                    onFilterGroupsChange={setSubFilterGroups}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion> */}
            <ListingTable
              className="col-span-full"
              columns={columns}
              globalFilterFn={fuzzyFilter}
            />
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="fley flex-row justify-end gap-1">
        <Button
          className="flex flex-row gap-2"
          variant={messageCopied ? 'secondary' : 'default'}
          disabled={copyBtnDisabled || isLoading}
          onClick={() => {
            const state = useListingsStore.getState()
            if (!divinePrice || !state.selectedListingId || !selectedListing) return

            const selectedItemsMap = state.selectedItemsMap[state.selectedListingId]
            const selectedItems = selectedListing.items.filter(
              (item) => selectedItemsMap[item.hash]
            )
            createWishperAndCopyToClipboard(divinePrice, selectedListing, selectedItems)
            setMessageCopied?.()
          }}
        >
          {messageCopied
            ? t('action.whisperCopied')
            : messageSent
              ? t('action.copyWhisperAgain')
              : t('action.copyWhisper')}
          {isLoading && (
            <RefreshCwIcon className={cn(isLoading && 'animate-spin', 'w-4 h-w shrink-0')} />
          )}
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {t('action.close')}
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}
