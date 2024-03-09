/* eslint-disable no-extra-boolean-cast */
'use client'

import { BasicSelect } from '@/components/basic-select'
import DebouncedInput from '@/components/debounced-input'
import { TablePagination } from '@/components/table-pagination'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { SageListingType } from '@/types/sage-listing-type'
import { DialogPortal } from '@radix-ui/react-dialog'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import * as SliderPrimitive from '@radix-ui/react-slider'
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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { atom, useAtom } from 'jotai'
import React, { memo, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import ListingDialogContent from './listing-dialog-content'
import { getCategory, useListingsStore } from './listingsStore'
dayjs.extend(utc)

type SellModeOptions = 'Show all modes' | 'Show whole listings' | 'Show individual listings'
const showSellModeAtom = atom<SellModeOptions>('Show all modes')

interface DataTableProps {
  className?: string
  columns: ColumnDef<SageListingType>[]
  globalFilterFn?: FilterFnOption<SageListingType>
}

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ListingsTable = ({ columns, globalFilterFn, className }: DataTableProps) => {
  //   const { t } = useTranslation();
  const [showSellMode, setShowSellMode] = useAtom(showSellModeAtom)
  const [dialogOpen, setDialogOpen] = useListingsStore(
    useShallow((state) => [state.dialogOpen, state.setDialogOpen])
  )
  const [multiplierRange, setMultiplierRange] = useListingsStore(
    useShallow((state) => [state.multiplierRange, state.setMultiplierRange])
  )

  const [globalFilter, setGlobalFilter] = useState('')
  const modifiedListings = useListingsStore(
    useShallow((state) => {
      if (!getCategory(state)) return []
      const now = dayjs.utc().valueOf()
      return state.listingsMap[getCategory(state)].filter(
        (l) =>
          l.meta.league === state.league &&
          state.filteredByGroupListings[l.uuid] &&
          now - l.meta.timestampMs < 30 * 60 * 1000 &&
          state.multiplierRange[0] <= l.meta.multiplier &&
          l.meta.multiplier <= state.multiplierRange[1]
      )
    })
  )

  const filteredListings = useMemo((): SageListingType[] => {
    if (showSellMode === 'Show all modes') return modifiedListings
    return modifiedListings.filter((l) => {
      if (showSellMode === 'Show whole listings') return l.meta.listingMode === 'bulk'
      else return l.meta.listingMode === 'single'
    })
  }, [modifiedListings, showSellMode])

  const table = useReactTable({
    data: filteredListings,
    columns,
    getRowId: (row) => row.uuid,
    enableColumnResizing: true,
    enableMultiSort: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    state: {
      globalFilter: globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 25
      },
      sorting: [
        {
          desc: true,
          id: 'created'
        },
        {
          desc: false,
          id: 'multiplier'
        }
      ]
    }
  })

  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizing])

  return (
    <div className={className}>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
        <div className="flex items-center pb-4 gap-4">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
            onBlur={(value) => setGlobalFilter(String(value))}
            className="pl-8 max-w-48"
            placeholder={'Search ...'}
            startIcon={
              <div className="p-2">
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            }
          />
          <div className="w-full max-w-48">
            <BasicSelect
              options={['Show all modes', 'Show whole listings', 'Show individual listings']}
              onSelect={setShowSellMode}
              value={showSellMode}
            />
          </div>
          <div className="flex flex-col items-center gap-2 w-full max-w-48">
            <Label>{`Multiplier: ${multiplierRange[0]}% - ${multiplierRange[1]}%`}</Label>
            <SliderPrimitive.Root
              className={cn('relative flex w-full touch-none select-none items-center')}
              min={0}
              value={multiplierRange}
              max={200}
              step={5}
              onValueChange={(e) => setMultiplierRange(e)}
            >
              <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
              <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
            </SliderPrimitive.Root>
          </div>
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
                          width: `calc(var(--header-${header?.id}-size) * 1px)`,
                          maxWidth:
                            meta?.staticResizing !== undefined && meta.staticResizing
                              ? `calc(var(--header-${header?.id}-size) * 1px)`
                              : undefined
                        }}
                        className={cn(
                          'group',
                          'truncate',
                          !Boolean(meta?.removePadding) && 'px-[14px]',
                          meta?.className
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanResize() && (
                          <div
                            onDoubleClick={() => header.column.resetSize()}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              `absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none group-hover:bg-muted`,
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
                            width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                            maxWidth:
                              meta?.staticResizing !== undefined && meta.staticResizing
                                ? `calc(var(--col-${cell.column.id}-size) * 1px)`
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
        <TablePagination table={table} pageSizes={[10, 25, 50, 75, 100]} />
        <DialogPortal>
          <DialogContent
            className="max-w-screen-xl overflow-y-auto max-h-screen"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <ListingDialogContent />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}

export default memo(ListingsTable)
