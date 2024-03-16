import { ColumnDef } from '@tanstack/react-table'
import { SageItemGroup } from 'sage-common'
import { Checkbox } from '../ui/checkbox'

type ColumnProps<T> = Partial<ColumnDef<T>> & {}

export function checkColumn<T extends { group?: SageItemGroup } | {}>(
  props?: ColumnProps<T>
): ColumnDef<T> {
  const id = 'selected'
  const header = 'selection'

  return {
    header: ({ table }) => {
      return (
        <div
          className="inline-block px-3 pt-[0.6rem] pb-[0.3rem] cursor-pointer text-center"
          onClick={() =>
            table.toggleAllRowsSelected(
              !(table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate'))
            )
          }
        >
          <Checkbox
            checked={
              table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      )
    },
    id: id,
    enableSorting: true,
    enableGlobalFilter: false,
    enableResizing: false,
    size: 40,
    meta: {
      headerWording: header,
      className: 'min-w-[40px] max-w-fit p-0',
      removePadding: true
    },
    sortDescFirst: true,
    cell: ({ row }) => {
      if ('group' in row.original) {
        return (
          <div
            className="inline-block px-3 pt-3 pb-2 cursor-pointer text-center data-[state=disabled]:cursor-not-allowed"
            data-state={row.original.group ? 'enabled' : 'disabled'}
            onClick={() => {
              if ('group' in row.original && row.original.group) {
                row.toggleSelected(!row.getIsSelected())
              }
            }}
          >
            <Checkbox
              checked={row.getIsSelected()}
              aria-label="Select row"
              disabled={!row.original.group}
            />
          </div>
        )
      }
      return (
        <div
          className="inline-block px-3 pt-3 pb-2 cursor-pointer text-center data-[state=disabled]:cursor-not-allowed"
          onClick={() => {
            row.toggleSelected(!row.getIsSelected())
          }}
        >
          <Checkbox checked={row.getIsSelected()} aria-label="Select row" />
        </div>
      )
    },
    ...props
  }
}
