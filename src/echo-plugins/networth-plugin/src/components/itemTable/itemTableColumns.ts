import { ColumnDef } from '@tanstack/react-table'
import { itemIcon, itemName, itemQuantity, itemTabs, itemValue } from '../columns/Columns'
import { IPricedItem } from '../../interfaces/priced-item.interface'

export const itemTableColumns = (): ColumnDef<IPricedItem>[] => [
  itemIcon({
    accessorKey: 'icon',
    header: 'Icon'
  }),
  itemName({
    accessorKey: 'name',
    header: 'Name'
  }),
  itemTabs({
    accessorKey: 'tab',
    header: 'Tabs'
  }),
  itemQuantity({
    header: 'Quantity',
    accessorKey: 'stackSize'
  }),
  itemValue({
    accessorKey: 'calculated',
    header: 'Price',
    enableSorting: true
  }),
  itemValue({
    accessorKey: 'total',
    header: 'Total value (c)',
    enableSorting: true
  }),
  itemValue({
    accessorKey: 'comulative',
    header: 'Cumulative (c)',
    cumulative: true
  })
]
