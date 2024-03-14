import { round } from '@/lib/currency'
import { ColumnDef } from '@tanstack/react-table'
import { ChangeEvent } from 'react'
import { TableColumnHeader } from '../column-header'
import DebouncedInput from '../debounced-input'

type ColumnProps<T> = Partial<ColumnDef<T>> & {}

export function quantityInputColumn<T extends { quantity: number; selectedQuantity: number }>(
  props: ColumnProps<T> = {}
): ColumnDef<T> {
  const key = 'selectedQuantity'
  const header = 'selectedQuantity'

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
      const initialValue = row.getValue<number>(key)

      const onInnerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (Number.isNaN(newValue) || newValue < 0) return 0
        else if (newValue > row.original.quantity) return round(row.original.quantity)
        return round(newValue, 4)
      }

      const placeHolder = `${row.original.quantity ?? '?'}`

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
          value={initialValue}
          min={0}
          max={row.original.quantity}
          onInnerChange={onInnerChange}
          placeholder={placeHolder}
          onChange={(value) => updateTableData(value)}
          onBlur={(value) => updateTableData(value)}
          debounce={250}
        />
      )
    },
    ...props
  }
}
