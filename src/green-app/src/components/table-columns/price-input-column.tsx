import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'
import { ChangeEvent } from 'react'
import { round } from '@/lib/currency'
import DebouncedInput from '../debounced-input'
import { SageItemGroup } from 'sage-common'

type ColumnProps<T> = Partial<ColumnDef<T>> & {}

export function priceInputColumn<
  T extends { selectedPrice?: number; originalPrice?: number; group?: SageItemGroup }
>(props: ColumnProps<T> = {}): ColumnDef<T> {
  const key = 'selectedPrice'
  const header = 'selectedPrice'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    id: key,
    accessorKey: key,
    enableSorting: true,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: {
      headerWording: header
    },
    cell: ({ row, table, column }) => {
      const initialValue = row.getValue<number | undefined>(key)

      const onInnerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (Number.isNaN(newValue) || newValue < 0) return ''
        return round(newValue, 4)
      }

      const placeHolder = `${row.original.originalPrice ?? '?'}c`

      const updateTableData = (value: string | number) => {
        if (typeof value === 'number') {
          table.options.meta?.updateData?.(row.index, column.id, value)
        } else if (!Number.isNaN(parseFloat(value))) {
          table.options.meta?.updateData?.(row.index, column.id, parseFloat(value))
        } else {
          table.options.meta?.updateData?.(row.index, column.id, value)
        }
      }

      return (
        <DebouncedInput
          type="number"
          className="text-center remove-arrow min-w-20"
          value={initialValue ?? ''}
          min={0}
          onInnerChange={onInnerChange}
          placeholder={placeHolder}
          disabled={!row.original.group}
          onChange={(value) => updateTableData(value)}
          onBlur={(value) => updateTableData(value)}
          debounce={250}
        />
      )
    },
    ...props
  }
}
