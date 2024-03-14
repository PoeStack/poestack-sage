import { ICompactTab } from '@/types/echo-api/stash'
import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'
import { parseTabNames } from '@/lib/item-util'
import { ItemNameCell } from '../table-cells/item-name-cell'

type ColumnProps<T> = Partial<ColumnDef<T>> & {}

export function tabsColumn<T extends { tabs: ICompactTab[] }>(
  props?: ColumnProps<T>
): ColumnDef<T> {
  const key = 'tabs'
  const header = 'tabs'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (val) => parseTabNames(val.tabs),
    enableSorting: true,
    enableGlobalFilter: true,
    size: 75,
    minSize: 50,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <ItemNameCell value={value} />
    },
    ...props
  }
}
