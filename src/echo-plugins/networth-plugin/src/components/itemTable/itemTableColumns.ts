import { ColumnDef } from '@tanstack/react-table'
import { itemIcon, itemName, itemQuantity, itemTabs, itemValue } from '../Columns/Columns'
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
  itemTabs({
    accessorKey: 'tab',
    header: 'tab'
  }),
  itemQuantity({
    accessorKey: 'stackSize',
    header: 'quantity'
  }),
  itemValue({
    accessorKey: 'calculated',
    header: 'price',
    enableSorting: true
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
