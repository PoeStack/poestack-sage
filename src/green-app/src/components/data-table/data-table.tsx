/* eslint-disable no-extra-boolean-cast */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  TableOptions,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import React, { memo } from 'react'
import { TablePagination } from '../table-pagination'
import { RefreshCwIcon } from 'lucide-react'

export type DataTableOptions<TData> = Omit<
  TableOptions<TData>,
  'getCoreRowModel' | 'getPaginationRowModel' | 'getSortedRowModel' | 'getFilteredRowModel'
>

type DataTableProps<TData> = {
  options: DataTableOptions<TData>
  pageSizes?: number[]
  isLoading?: boolean
}

const DataTable = <TData,>({ options, pageSizes, isLoading }: DataTableProps<TData>) => {
  const table = useReactTable({
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...options
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
    <div className="flex flex-col">
      <div className="block max-w-full rounded-md border">
        <Table style={{ ...columnSizeVars }} className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="divide-x">
                {headerGroup.headers.map((header) => {
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
                <TableCell colSpan={options.columns.length} className="h-[6.5rem] text-center">
                  {isLoading ? (
                    <div className="flex flex-row justify-center items-center gap-2">
                      Loading items ...
                      <RefreshCwIcon className="w-4 h-w shrink-0 animate-spin" />
                    </div>
                  ) : (
                    <>No results.</>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} pageSizes={pageSizes} enableHotkeyNavigation />
    </div>
  )
}

export default memo(DataTable) as <TData>({
  options,
  pageSizes
}: DataTableProps<TData>) => React.JSX.Element
