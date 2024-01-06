import { ColumnDef } from '@tanstack/react-table'
import {
  itemIcon,
  itemName,
  itemQuantity,
  itemTabs,
  itemTag,
  itemProps,
  itemValue,
  sparkLine
} from '../Columns/Columns'
import { IDisplayedItem } from '../../interfaces/priced-item.interface'

export const itemTableColumns = (): ColumnDef<IDisplayedItem>[] => [
  itemIcon(),
  itemName(),
  itemProps(),
  itemTag(),
  itemTabs(),
  itemQuantity({}),
  sparkLine(),
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
