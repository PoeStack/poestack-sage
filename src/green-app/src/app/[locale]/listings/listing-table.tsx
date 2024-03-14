/* eslint-disable no-extra-boolean-cast */
'use client'

import { BasicSelect } from '@/components/basic-select'
import DataTable, { DataTableOptions } from '@/components/data-table/data-table'
import DebouncedInput from '@/components/debounced-input'
import TableColumnToggle from '@/components/table-column-toggle'
import { useSkipper } from '@/hooks/useSkipper'
import { SageListingItemType, SageListingType } from '@/types/sage-listing-type'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnOrderState,
  ColumnSizingState,
  FilterFnOption,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getListingsByCategory, useListingsStore } from './listingsStore'
import { useTranslation } from 'react-i18next'

interface DataTableProps {
  columns: ColumnDef<SageListingType['items'][number]>[]
  className?: string
  globalFilterFn?: FilterFnOption<SageListingType['items'][number]>
}

type ShowItemMode = 'showAll' | 'showSelected' | 'showUnselected'
const options: ShowItemMode[] = ['showAll', 'showSelected', 'showUnselected']
const showItemsModeAtom = atom<ShowItemMode>('showAll')

const columnOrderAtom = atomWithStorage<ColumnOrderState>('l-table-columnOrder', [])
const columnVisiblityAtom = atomWithStorage<VisibilityState>('l-table-columnVisibility', {
  cumulative: false,
  '7_day_history': false
})
const columnSizingAtom = atomWithStorage<ColumnSizingState>('l-table-columnSizing', {})

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ListingTable = ({ columns, className, globalFilterFn }: DataTableProps) => {
  const { t } = useTranslation()
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
    if (listing.meta.listingMode === 'bulk' || showItemsMode === 'showAll') return listing.items
    return listing.items.filter((item) => {
      const selected = !!selectedItems[item.hash]
      if (showItemsMode === 'showSelected') return selected
      return !selected
    })
  }, [listing, showItemsMode, selectedItems])

  const setSelectedItems = useListingsStore((state) => state.setSelectedItems)
  const updateData = useListingsStore((state) => state.updateData)

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const tableRef = useRef<Table<SageListingItemType> | undefined>()
  const [columnVisibility, setColumnVisibility] = useAtom(columnVisiblityAtom)
  const [columnOrder, setColumnOrder] = useAtom(columnOrderAtom)
  const [columnSizing, setColumnSizing] = useAtom(columnSizingAtom)
  const handleTableReset = useCallback(() => {
    tableRef.current?.resetColumnOrder()
    tableRef.current?.resetColumnVisibility()
    tableRef.current?.resetColumnSizing()
  }, [])

  const [localColumnSizing, setLocalColumnSizing] = useState(columnSizing)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setColumnSizing(localColumnSizing)
    }, 250)
    return () => {
      clearTimeout(timeout)
    }
  }, [localColumnSizing, setColumnSizing])

  const tableOptions = useMemo((): DataTableOptions<SageListingItemType> => {
    return {
      data: filteredItems,
      columns,
      getRowId: (row) => row.hash,
      enableMultiSort: true,
      autoResetPageIndex,
      onGlobalFilterChange: setGlobalFilter,
      onRowSelectionChange: setSelectedItems,
      globalFilterFn: globalFilterFn,
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: setColumnOrder,
      onColumnSizingChange: setLocalColumnSizing,
      state: {
        globalFilter: globalFilter,
        rowSelection: selectedItems,
        columnVisibility: columnVisibility,
        columnOrder: columnOrder,
        columnSizing: localColumnSizing
      },
      initialState: {
        pagination: {
          pageSize: 10
        },
        sorting: [
          columnVisibility['2_day_history'] ?? true
            ? {
                desc: true,
                id: '2_day_history'
              }
            : {
                desc: true,
                id: '7_day_history'
              }
        ],
        columnVisibility: {
          cumulative: false,
          '7_day_history': false
        }
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
    setSelectedItems,
    globalFilterFn,
    setColumnVisibility,
    setColumnOrder,
    globalFilter,
    selectedItems,
    columnVisibility,
    columnOrder,
    localColumnSizing,
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
          placeholder={t('label.searchPh')}
          startIcon={
            <div className="p-2">
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          }
        />
        {listing?.meta.listingMode === 'single' && (
          <div className="w-full max-w-40">
            <BasicSelect
              options={options}
              onSelect={setShowItemsMode}
              value={showItemsMode}
              translate
            />
          </div>
        )}
        <div className="flex-1" />
        <TableColumnToggle
          columns={columns as any}
          columnVisibility={columnVisibility}
          columnOrder={columnOrder}
          onColumnVisibility={setColumnVisibility}
          onColumnOrder={setColumnOrder}
          resetTable={handleTableReset}
        />
      </div>
      <DataTable options={tableOptions} tableRef={tableRef} />
    </div>
  )
}

export default memo(ListingTable)
