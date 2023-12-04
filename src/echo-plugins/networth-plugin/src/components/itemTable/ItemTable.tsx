import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  // ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  PaginationState,
  filterFns,
  FilterFn,
  FilterFnOption,
  Updater
} from '@tanstack/react-table'
import { Label, Switch, Table } from 'echo-common/components-v1'
import { TablePagination } from './TablePagination'
import TableColumnToggle from './TableColumnToggle'
import DebouncedInput from '../Input/DebouncedInput'
import { useStore } from '../../hooks/useStore'
import { observer } from 'mobx-react'
import { getRarityIdentifier } from '../../utils/item.utils'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { useTranslation } from 'react-i18next'

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
  const [sorting, setSorting] = React.useState<SortingState>([])
  // const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const setPagination = useCallback(
    (updaterOrValue: Updater<PaginationState>) => tableState.setPagination(updaterOrValue),
    [tableState]
  )
  const setGlobalFilter = useCallback(
    (updaterOrValue: Updater<string>) => tableState.setGlobalFilter(updaterOrValue),
    [tableState]
  )

  const table = useReactTable({
    data,
    columns,
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
    state: {
      sorting,
      // columnFilters,
      columnVisibility,
      pagination: tableState.pagination,
      globalFilter: tableState.globalFilter
    }
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <DebouncedInput
          value={tableState.globalFilter ?? ''}
          onChange={(value) => tableState.setGlobalFilter(String(value))}
          className="h-8 max-w-sm mr-2"
          placeholder={t('label.searchItemsPlaceholder')} // ^((?!Chaos Orb).)*$
        />
        <TableColumnToggle table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} className="divide-x">
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.Head key={header.id} className="h-10 px-[14px]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Head>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="divide-x"
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id} className="h-10 py-[6px] px-[14px]">
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

export default observer(ItemTable)
