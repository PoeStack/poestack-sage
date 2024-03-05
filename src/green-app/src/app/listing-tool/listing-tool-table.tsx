/* eslint-disable no-extra-boolean-cast */
'use client'

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
import { IDisplayedItem } from '@/types/echo-api/priced-item'
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
import { atom } from 'jotai'
import React, { memo } from 'react'
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

  const table = useReactTable({
    data: modifiedItems,
    columns,
    enableRowSelection: (row) => !!row.original.group,
    getRowId: (row) => `${row.group?.hash || row.displayName}`,
    autoResetPageIndex,
    enableColumnResizing: true,
    enableMultiSort: false,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      <TablePagination table={table} pageSizes={[10, 15, 25, 50, 75, 100]} />
    </div>
  )
}

export default memo(ListingToolTable)
