import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../column-header'
import { ItemIconCell } from '../table-cells/item-icon-cell'
import { ItemNameCell } from '../table-cells/item-name-cell'

type ColumnProps<T> = Partial<ColumnDef<T>> & {
  showRarityIndicator?: boolean
}

export function nameColumn<T extends { displayName: string; icon: string; frameType?: number }>({
  showRarityIndicator,
  ...props
}: ColumnProps<T> = {}): ColumnDef<T> {
  const key = 'displayName'
  const header = 'Name'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey: key,
    enableSorting: true,
    enableGlobalFilter: true,
    size: 230,
    minSize: 90,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)

      return (
        <div className="flex flex-row gap-2">
          <ItemIconCell
            value={row.original.icon}
            frameType={row.original.frameType}
            showRarityIndicator={showRarityIndicator}
          />
          <ItemNameCell value={value} />
        </div>
      )
    },
    ...props
  }
}
