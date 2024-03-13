/* eslint-disable no-extra-boolean-cast */
'use client'

import DataTable, { DataTableOptions } from '@/components/data-table/data-table'
import { useSkipper } from '@/hooks/useSkipper'
import { IDisplayedItem } from '@/types/echo-api/priced-item'
import {
  Column,
  ColumnDef,
  ColumnOrderState,
  FilterFnOption,
  Table,
  VisibilityState
} from '@tanstack/react-table'
import { atom } from 'jotai'
import { memo, useMemo } from 'react'
import { useListingToolStore } from './listingToolStore'

export const modifiedItemsAtom = atom<IDisplayedItem[]>([])

interface DataTableProps {
  columns: ColumnDef<IDisplayedItem>[]
  className?: string
  isLoading?: boolean
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  globalFilterFn?: FilterFnOption<IDisplayedItem>
  columnVisibility: VisibilityState
  columnOrder: ColumnOrderState
  onColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
  onColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>
  tableRef: React.MutableRefObject<Table<IDisplayedItem> | undefined>
}

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ListingToolTable = ({
  columns,
  className,
  isLoading,
  globalFilter,
  onGlobalFilterChange,
  globalFilterFn,
  columnVisibility,
  columnOrder,
  onColumnVisibility,
  onColumnOrder,
  tableRef
}: DataTableProps) => {
  //   const { t } = useTranslation();

  const modifiedItems = useListingToolStore((state) => state.modifiedItems)
  const selectedItems = useListingToolStore((state) => state.selectedItems)
  const setSelectedItems = useListingToolStore((state) => state.setSelectedItems)
  const updateData = useListingToolStore((state) => state.updateData)

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const pageSizes = useMemo(() => [10, 15, 25, 50, 75, 100], [])

  const tableOptions = useMemo((): DataTableOptions<IDisplayedItem> => {
    return {
      data: modifiedItems,
      columns,
      enableRowSelection: (row) => !!row.original.group,
      getRowId: (row) => `${row.group?.hash || row.displayName}`,
      autoResetPageIndex,
      enableMultiSort: false,
      onGlobalFilterChange: onGlobalFilterChange,
      onRowSelectionChange: setSelectedItems,
      globalFilterFn: globalFilterFn,
      onColumnVisibilityChange: onColumnVisibility,
      onColumnOrderChange: onColumnOrder,
      state: {
        rowSelection: selectedItems,
        globalFilter: globalFilter,
        columnVisibility: columnVisibility,
        columnOrder: columnOrder
      },
      initialState: {
        pagination: {
          pageSize: 25
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
          tag: false,
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
    autoResetPageIndex,
    columnOrder,
    columnVisibility,
    columns,
    globalFilter,
    globalFilterFn,
    modifiedItems,
    onColumnOrder,
    onColumnVisibility,
    onGlobalFilterChange,
    selectedItems,
    setSelectedItems,
    skipAutoResetPageIndex,
    updateData
  ])

  return (
    <div className={className}>
      <DataTable
        options={tableOptions}
        pageSizes={pageSizes}
        isLoading={isLoading}
        tableRef={tableRef}
      />
    </div>
  )
}

export default memo(ListingToolTable)
