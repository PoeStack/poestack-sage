import { ColumnDef } from '@tanstack/react-table'
import {
  itemIcon,
  itemName,
  itemQuantity,
  itemTabs,
  itemProps,
  itemValue,
  sparkLine
} from '../Columns/Columns'
import { IPricedItem } from '../../interfaces/priced-item.interface'

export const itemTableColumns = (): ColumnDef<IPricedItem>[] => [
  itemIcon({
    accessorKey: 'icon',
    header: 'icon'
  }),
  itemName({
    accessorKey: 'name',
    header: 'name'
  }),
  itemProps({ accessorKey: 'unsafeHashProperties', header: 'properties' }),
  itemTabs({
    accessorKey: 'tab',
    header: 'tab'
  }),
  itemQuantity({
    accessorKey: 'stackSize',
    header: 'quantity'
  }),
  sparkLine({ accessorKey: 'valuation', header: 'priceLast24Hours' }),
  itemValue({
    accessorKey: 'calculated',
    header: 'price',
    enableSorting: true,
    toCurrency: 'chaos'
  }),
  itemValue({
    accessorKey: 'total',
    header: 'total',
    enableSorting: true
  }),
  itemValue({
    accessorKey: 'cumulative',
    header: 'cumulative',
    cumulative: true
  })
]
