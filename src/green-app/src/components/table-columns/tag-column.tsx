import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'
import { SageItemGroup } from '@/lib/item-grouping-service'
import { ItemNameCell } from '../table-cells/item-name-cell'

type ColumnProps<T> = Partial<ColumnDef<T>> & {}

export function tagColumn<T extends { group?: SageItemGroup }>(
  props?: ColumnProps<T>
): ColumnDef<T> {
  const key = 'tag'
  const header = 'Tag'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (val) => val.group?.tag,
    enableSorting: true,
    enableGlobalFilter: true,
    size: 65,
    minSize: 65,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <ItemNameCell value={value} />
    },
    ...props
  }
}
