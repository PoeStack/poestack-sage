/* eslint-disable no-extra-boolean-cast */
'use client'

import { BasicSelect } from '@/components/basic-select'
import DataTable, { DataTableOptions } from '@/components/data-table/data-table'
import DebouncedInput from '@/components/debounced-input'
import { useSkipper } from '@/hooks/useSkipper'
import { SageListingItemType, SageListingType } from '@/types/sage-listing-type'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { ColumnDef, FilterFnOption } from '@tanstack/react-table'
import { atom, useAtom } from 'jotai'
import { memo, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getListingsByCategory, useListingsStore } from './listingsStore'

interface DataTableProps {
  columns: ColumnDef<SageListingType['items'][number]>[]
  className?: string
  globalFilterFn?: FilterFnOption<SageListingType['items'][number]>
}

type ShowItemMode = 'Show all' | 'Show selected' | 'Show unselected'
const showItemsModeAtom = atom<ShowItemMode>('Show all')

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ListingTable = ({ columns, className, globalFilterFn }: DataTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [showItemsMode, setShowItemsMode] = useAtom(showItemsModeAtom)

  const listing = useListingsStore(
    useShallow((state) => {
      return getListingsByCategory(state)?.find((l) => l.uuid === state.selectedListingId)
    })
  )

  const selectedItems = useListingsStore(
    useShallow((state) =>
      state.selectedListingId ? state.selectedItemsMap[state.selectedListingId] : {}
    )
  )

  const filteredItems = useMemo((): SageListingItemType[] => {
    if (!listing) return []
    if (listing.meta.listingMode === 'bulk' || showItemsMode === 'Show all') return listing.items
    return listing.items.filter((item) => {
      const selected = !!selectedItems[item.hash]
      if (showItemsMode === 'Show selected') return selected
      return !selected
    })
  }, [listing, showItemsMode, selectedItems])

  const setSelectedItems = useListingsStore((state) => state.setSelectedItems)
  const updateData = useListingsStore((state) => state.updateData)

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const tableOptions = useMemo((): DataTableOptions<SageListingItemType> => {
    return {
      data: filteredItems,
      columns,
      getRowId: (row) => row.hash,
      enableMultiSort: listing?.meta.listingMode !== 'bulk',
      autoResetPageIndex,
      onGlobalFilterChange: setGlobalFilter,
      onRowSelectionChange: setSelectedItems,
      globalFilterFn: globalFilterFn,
      state: {
        rowSelection: selectedItems,
        globalFilter: globalFilter
      },
      initialState: {
        pagination: {
          pageSize: 10
        },
        sorting: [
          {
            desc: true,
            id: 'valuation'
          }
        ]
      },
      meta: {
        // https://muhimasri.com/blogs/react-editable-table/
        updateData: (...params) => {
          skipAutoResetPageIndex()
          updateData(...params)
        }
      }
    }
  }, [
    filteredItems,
    columns,
    autoResetPageIndex,
    globalFilter,
    globalFilterFn,
    listing?.meta.listingMode,
    selectedItems,
    setSelectedItems,
    skipAutoResetPageIndex,
    updateData
  ])

  return (
    <div className={className}>
      <div className="flex items-center pb-4 gap-2">
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
        {listing?.meta.listingMode === 'single' && (
          <div className="w-full max-w-40">
            <BasicSelect
              options={['Show all', 'Show selected', 'Show unselected']}
              onSelect={setShowItemsMode}
              value={showItemsMode}
            />
          </div>
        )}
      </div>
      <DataTable options={tableOptions} />
    </div>
  )
}

export default memo(ListingTable)
