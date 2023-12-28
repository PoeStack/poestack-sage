import React, { useCallback, useEffect, useState } from 'react'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  VisibilityState,
  PaginationState,
  FilterFnOption,
  Updater
} from '@tanstack/react-table'
import { Button, Table } from 'echo-common/components-v1'
import { TablePagination } from './TablePagination'
import TableColumnToggle from './TableColumnToggle'
import DebouncedInput from '../DebouncedInput/DebouncedInput'
import { useStore } from '../../hooks/useStore'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { DeleteIcon, SearchIcon } from 'lucide-react'
import { cn } from 'echo-common'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  globalFilterFn?: FilterFnOption<TData>
}

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ItemTable = <TData, TValue>({
  columns,
  data,
  globalFilterFn
}: DataTableProps<TData, TValue>) => {
  const { t } = useTranslation()
  const { accountStore } = useStore()
  const tableState = accountStore.activeAccount.networthTableView

  const setPagination = useCallback(
    (updaterOrValue: Updater<PaginationState>) => tableState.setPagination(updaterOrValue),
    [tableState]
  )
  const setGlobalFilter = useCallback(
    (updaterOrValue: Updater<string>) => tableState.setGlobalFilter(updaterOrValue),
    [tableState]
  )
  const setSorting = useCallback(
    (updaterOrValue: Updater<SortingState>) => tableState.setSorting(updaterOrValue),
    [tableState]
  )
  const setColumnVisibility = useCallback(
    (updaterOrValue: Updater<VisibilityState>) => tableState.setColumnVisibility(updaterOrValue),
    [tableState]
  )

  const [localColumnSizing, setLocalColumnSizing] = useState(tableState.columnSizing)

  useEffect(() => {
    const timeout = setTimeout(() => {
      tableState.setColumnSizing(localColumnSizing)
    }, 250)
    return () => {
      clearTimeout(timeout)
    }
  }, [tableState, localColumnSizing])

  const table = useReactTable({
    data,
    columns,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    onColumnSizingChange: setLocalColumnSizing,
    state: {
      sorting: tableState.sorting,
      // columnFilters
      columnVisibility: tableState.columnVisibility,
      pagination: tableState.pagination,
      globalFilter: tableState.globalFilter,
      columnSizing: localColumnSizing
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
  }, [table.getState().columnSizingInfo])

  return (
    <div>
      <div className="flex items-center pb-4">
        <DebouncedInput
          value={tableState.globalFilter ?? ''}
          onChange={(value) => tableState.setGlobalFilter(String(value))}
          className="h-8 max-w-sm px-8"
          placeholder={t('label.searchItemsPlaceholder')} // ^((?!Chaos Orb).)*$
          startIcon={
            <div className="p-2">
              <SearchIcon className="h-4 w-4" />
            </div>
          }
          endIcon={
            <Button
              onClick={() => tableState.setGlobalFilter('')}
              variant="ghost"
              size="icon"
              type="button"
              className="h-8 w-8"
            >
              <DeleteIcon className="h-4 w-4" />
            </Button>
          }
        />
        <TableColumnToggle table={table} />
      </div>
      <div className="block max-w-full rounded-md border">
        <Table style={{ ...columnSizeVars }} className="w-full">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className="divide-x">
                {headerGroup.headers.map((header, i) => {
                  return (
                    <Table.Head
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        position: 'relative',
                        width: `calc(var(--header-${header?.id}-size) * 1px)`
                      }}
                      className="h-10 px-[14px]"
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
                        ></div>
                      )}
                    </Table.Head>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Header>
          {/* <MemoizedTableBody table={table} /> */}
          <Table.Body>
            {table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="divide-x"
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      style={{ width: `calc(var(--col-${cell.column.id}-size) * 1px)` }}
                      className="h-10 py-[6px] px-[14px]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={columns.length} className="h-20 text-center">
                  {t('label.noResults')}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
      <TablePagination table={table} />
    </div>
  )
}

// interface DataTableBodyProps<TData> {
//   table: TTable<TData>
// }

// const TableBody = <TData,>({ table }: DataTableBodyProps<TData>) => {
//   const { t } = useTranslation()
//   return (
//     <Table.Body>
//       {table.getRowModel().rows?.length > 0 ? (
//         table.getRowModel().rows.map((row) => (
//           <Table.Row
//             key={row.id}
//             data-state={row.getIsSelected() && 'selected'}
//             className="divide-x"
//           >
//             {row.getVisibleCells().map((cell) => (
//               <Table.Cell
//                 key={cell.id}
//                 style={{ width: `calc(var(--col-${cell.column.id}-size) * 1px)` }}
//                 className="h-10 py-[6px] px-[14px]"
//               >
//                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
//               </Table.Cell>
//             ))}
//           </Table.Row>
//         ))
//       ) : (
//         <Table.Row>
//           <Table.Cell colSpan={table.getVisibleLeafColumns().length} className="h-20 text-center">
//             {t('label.noResults')}
//           </Table.Cell>
//         </Table.Row>
//       )}
//     </Table.Body>
//   )
// }

// export const MemoizedTableBody = React.memo(
//   TableBody,
//   (prev, next) => prev.table.options.data === next.table.options.data
// ) as typeof TableBody

export default observer(ItemTable)
