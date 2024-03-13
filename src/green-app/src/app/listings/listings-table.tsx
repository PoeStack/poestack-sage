/* eslint-disable no-extra-boolean-cast */
'use client'

import { BasicSelect } from '@/components/basic-select'
import DataTable, { DataTableOptions } from '@/components/data-table/data-table'
import DebouncedInput from '@/components/debounced-input'
import TableColumnToggle from '@/components/table-column-toggle'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { cn } from '@/lib/utils'
import { SageListingType } from '@/types/sage-listing-type'
import { DialogPortal } from '@radix-ui/react-dialog'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import * as SliderPrimitive from '@radix-ui/react-slider'
import {
  ColumnDef,
  ColumnOrderState,
  ColumnSizingState,
  FilterFnOption,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { atom, useAtom } from 'jotai'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import ListingDialogContent from './listing-dialog-content'
import { getCategory, getListingsByCategory, useListingsStore } from './listingsStore'
dayjs.extend(utc)

type SellModeOptions = 'Show all modes' | 'Show whole listings' | 'Show individual listings'
const showSellModeAtom = atom<SellModeOptions>('Show all modes')

const columnOrderAtom = atomWithStorage<ColumnOrderState>('ls-table-columnOrder', [])
const columnVisiblityAtom = atomWithStorage<VisibilityState>('ls-table-columnVisibility', {})
const columnSizingAtom = atomWithStorage<ColumnSizingState>('ls-table-columnSizing', {})

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
      return getListingsByCategory(state).filter(
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

  const tableRef = useRef<Table<SageListingType> | undefined>()
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

  const tableOptions = useMemo((): DataTableOptions<SageListingType> => {
    return {
      data: filteredListings,
      columns,
      getRowId: (row) => row.uuid,
      enableMultiSort: true,
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: globalFilterFn,
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: setColumnOrder,
      onColumnSizingChange: setLocalColumnSizing,
      state: {
        globalFilter: globalFilter,
        columnVisibility: columnVisibility,
        columnOrder: columnOrder,
        columnSizing: localColumnSizing
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
    }
  }, [
    columnOrder,
    columnVisibility,
    columns,
    filteredListings,
    globalFilter,
    globalFilterFn,
    localColumnSizing,
    setColumnOrder,
    setColumnVisibility
  ])

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
