/* eslint-disable no-extra-boolean-cast */
'use client'

import DebouncedInput from '@/components/debounced-input'
import { TablePagination } from '@/components/table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useSkipper } from '@/hooks/useSkipper'
import { cn } from '@/lib/utils'
import { SageListingItemType, SageListingType } from '@/types/sage-listing-type'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  FilterFnOption,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import React, { memo, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useListingsStore } from './listingsStore'
import { BasicSelect } from '@/components/basic-select'
import { atom, useAtom } from 'jotai'

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
      return state.listingsMap[state.category || '']?.find(
        (l) => l.uuid === state.selectedListingId
      )
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

  const table = useReactTable({
    data: filteredItems,
    columns,
    getRowId: (row) => row.hash,
    enableColumnResizing: true,
    enableMultiSort: listing?.meta.listingMode !== 'bulk',
    autoResetPageIndex,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
        ...(listing?.meta.listingMode === 'bulk'
          ? [
              {
                desc: true,
                id: 'valuation'
              }
            ]
          : [
              {
                desc: true,
                id: 'selected'
              },
              {
                desc: true,
                id: 'valuation'
              }
            ])
      ]
    },
    meta: {
      // https://muhimasri.com/blogs/react-editable-table/
      updateData: (...params) => {
        skipAutoResetPageIndex()
        updateData(...params)
      }
    }
  })

  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--sub-header-${header.id}-size`] = header.getSize()
      colSizes[`--sub-col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizing])

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
      <div className="block max-w-full rounded-md border">
        <Table style={{ ...columnSizeVars }} className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="divide-x">
                {headerGroup.headers.map((header, i) => {
                  const meta = header.column.columnDef.meta
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        position: 'relative',
                        width: `calc(var(--sub-header-${header?.id}-size) * 1px)`,
                        maxWidth:
                          meta?.staticResizing !== undefined && meta.staticResizing
                            ? `calc(var(--header-${header?.id}-size) * 1px)`
                            : undefined
                      }}
                      className={cn(
                        meta?.className,
                        !Boolean(meta?.removePadding) && 'px-[14px]',
                        'truncate'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            `absolute z-10 -right-1 top-0 h-full w-2 cursor-col-resize select-none touch-none`,
                            headerGroup.headers.length - 1 === i && 'right-0 w-1',
                            header.column.getIsResizing() && 'bg-muted'
                          )}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={cn('divide-x')}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: `calc(var(--sub-col-${cell.column.id}-size) * 1px)`,
                          maxWidth:
                            meta?.staticResizing !== undefined && meta.staticResizing
                              ? `calc(var(--sub-col-${cell.column.id}-size) * 1px)`
                              : undefined
                        }}
                        className={cn(
                          meta?.className,
                          !Boolean(meta?.removePadding) && 'py-[6px] px-[14px]',
                          'truncate'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[6.5rem] text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        className="pb-0"
        table={table}
        pageSizes={[10, 25, 50, 75, 100]}
        enableHotkeyNavigation
      />
    </div>
  )
}

export default memo(ListingTable)
