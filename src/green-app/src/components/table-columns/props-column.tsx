import { parseUnsafeHashProps } from '@/lib/item-util'
import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'
import { SageItemGroup } from 'sage-common'
import { ItemPropsCell } from '../table-cells/item-props-cell'
import { SageItemGroupSummary } from '@/types/echo-api/item-group'

type ColumnProps<T> = Partial<ColumnDef<T>> & {}

export function propsColumn<
  T extends { group?: SageItemGroup } | { summary?: SageItemGroupSummary }
>(props?: ColumnProps<T>): ColumnDef<T> {
  const key = 'unsafeHashProperties'
  const header = 'props'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (val) => {
      if ('group' in val) {
        return parseUnsafeHashProps(val.group?.unsafeHashProperties)
      } else if ('summary' in val) {
        return parseUnsafeHashProps(val.summary?.unsafeHashProperties)
      }
      return ''
    },
    enableSorting: true,
    enableGlobalFilter: true,
    size: 120,
    minSize: 85,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <ItemPropsCell value={value} />
    },
    ...props
  }
}
