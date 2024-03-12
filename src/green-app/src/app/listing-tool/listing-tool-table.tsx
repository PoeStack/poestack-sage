/* eslint-disable no-extra-boolean-cast */
'use client'

import DataTable, { DataTableOptions } from '@/components/data-table/data-table'
import { useSkipper } from '@/hooks/useSkipper'
import { IDisplayedItem } from '@/types/echo-api/priced-item'
import { ColumnDef, FilterFnOption } from '@tanstack/react-table'
import { atom } from 'jotai'
import { memo, useMemo } from 'react'
import { useListingToolStore } from './listingToolStore'

export const modifiedItemsAtom = atom<IDisplayedItem[]>([])

interface DataTableProps {
  columns: ColumnDef<IDisplayedItem>[]
  className?: string
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  globalFilterFn?: FilterFnOption<IDisplayedItem>
}

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ListingToolTable = ({
  columns,
  className,
  globalFilter,
  onGlobalFilterChange,
  globalFilterFn
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
      state: {
        rowSelection: selectedItems,
        globalFilter: globalFilter
      },
      initialState: {
        pagination: {
          pageSize: 25
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
    autoResetPageIndex,
    columns,
    globalFilter,
    globalFilterFn,
    modifiedItems,
    onGlobalFilterChange,
    selectedItems,
    setSelectedItems,
    skipAutoResetPageIndex,
    updateData
  ])

  return (
    <div className={className}>
      <DataTable options={tableOptions} pageSizes={pageSizes} />
    </div>
  )
}

export default memo(ListingToolTable)
