import { AccessorFn, ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'

type ColumnProps<T> = Omit<ColumnDef<T>, 'accessorKey' | 'accessorFn'> & {
  accessorKey?: string
  accessorFn?: AccessorFn<T, unknown>
}

export function multiplierColumn<T extends {}>(props: ColumnProps<T>): ColumnDef<T> {
  const key = 'multiplier'
  const header = 'Multiplier'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
    enableSorting: true,
    enableGlobalFilter: false,
    meta: {
      headerWording: header
    },
    cell: ({ cell }) => {
      const value = cell.getValue<string>()
      return <div className="text-right">{value}%</div>
    },
    ...props
  }
}