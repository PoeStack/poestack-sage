import { SageValuation } from '@/types/echo-api/valuation'
import { TableColumnHeader } from '../column-header'
import { ColumnDef } from '@tanstack/react-table'
import { SparklineCell } from '../table-cells/item-sparkline-cell'

type ColumnProps<T> = Partial<ColumnDef<T>> & {
  mode: '2 days' | '7 days'
  animation?: boolean
}

export function historyColumn<T extends { valuation?: SageValuation }>(
  { mode, animation, ...props }: ColumnProps<T> = { mode: '2 days' }
): ColumnDef<T> {
  const key = mode === '2 days' ? '2_day_history' : '7_day_history'
  const header = mode === '2 days' ? 'Price last 2 days' : 'Price last 7 days'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    id: key,
    accessorKey: key,
    accessorFn: (pricedItem) => {
      const valuation = pricedItem.valuation
      if (!valuation) return '- '
      // Remove indexes
      const history =
        mode === '2 days'
          ? valuation.history.primaryValueHourly
          : valuation.history.primaryValueDaily
      if (history.length < 2) return '- '
      let i = history.length
      let indexToUse = history.length
      while (i--) {
        if (history[i]) {
          indexToUse = i
          break
        }
      }
      if (indexToUse === 0) return '- '

      if (!history[indexToUse]) return '- '
      if (!history[0]) return '- '

      return (history[indexToUse] / history[0] - 1) * 100
    },
    enableSorting: true,
    enableGlobalFilter: false,
    size: 200,
    minSize: 100,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.original.valuation
      const totalChange = row.getValue<number | string>(key)
      return (
        <SparklineCell
          valuation={value}
          totalChange={totalChange}
          mode={mode}
          animation={animation}
        />
      )
    },
    ...props
  }
}
