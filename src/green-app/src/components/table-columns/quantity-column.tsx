import { ColumnDef } from '@tanstack/react-table'
import { ItemQuantityCell } from '../table-cells/item-quantity-cell'
import { TableColumnHeader } from '../column-header'

type ColumnProps<T> = Partial<ColumnDef<T>> & {
  diff?: boolean
}

export function quantityColumn<T extends { stackSize: number } | { quantity: number }>({
  diff,
  ...props
}: ColumnProps<T> = {}): ColumnDef<T> {
  const key = 'quantity'
  const header = 'Quantity'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
    accessorFn: (value) => {
      if ('stackSize' in value) {
        return value.stackSize
      } else if ('quantity' in value) {
        return value.quantity
      }
      return 0
    },
    enableSorting: true,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: {
      headerWording: header
    },
    cell: ({ cell }) => {
      const value = cell.getValue<number>()
      return <ItemQuantityCell quantity={value} diff={diff} />
    },
    ...props
  }
}
