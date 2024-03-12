import { AccessorFn, ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'
import { ItemValueCell } from '../table-cells/item-price-cell'

type ColumnProps<T> = Omit<ColumnDef<T>, 'accessorKey' | 'accessorFn'> & {
  headerName?: string
  toCurrency?: 'chaos' | 'divine' | 'both'
  showChange?: boolean
  cumulativeColumn?: string
  accessorKey: string
  accessorFn?: AccessorFn<T, unknown>
}

export function priceColumn<T extends {}>({
  accessorKey,
  accessorFn,
  headerName,
  toCurrency,
  showChange,
  cumulativeColumn: cumulative,
  enableSorting,
  ...props
}: ColumnProps<T>): ColumnDef<T> {
  return {
    accessorKey: accessorKey,
    accessorFn: accessorFn,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={headerName || ''} align="right" />
    ),
    enableSorting: enableSorting ?? true,
    enableGlobalFilter: false,
    enableResizing: false,
    sortingFn: (rowA, rowB, columnId: string) => {
      const val1 = rowA.getValue(columnId)
      const val2 = rowB.getValue(columnId)
      if (typeof val1 === 'number' && typeof val2 === 'number') {
        return val1 - val2
      } else if (typeof val1 === 'number') {
        return val1 - 0
      } else {
        return 0 - (val2 as number)
      }
    },
    meta: {
      headerWording: headerName
    },
    cell: ({ row, table }) => {
      let value = 0
      if (cumulative) {
        const sortedRows = table.getSortedRowModel().rows
        for (let i = 0; i < sortedRows.length; i++) {
          const total = sortedRows[i].getValue<number>(cumulative)
          if (total !== undefined) {
            value += total
          }
          if (sortedRows[i].id === row.id) {
            break
          }
        }
      } else if (accessorKey) {
        value = row.getValue(accessorKey)
      }

      return <ItemValueCell value={value} showChange={showChange} toCurrency={toCurrency} />
    },
    ...props
  }
}
