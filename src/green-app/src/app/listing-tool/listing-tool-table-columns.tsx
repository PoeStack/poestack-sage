'use client'

import { checkColumn } from '@/components/table-columns/check-column'
import { historyColumn } from '@/components/table-columns/history-column'
import { nameColumn } from '@/components/table-columns/name-column'
import { priceColumn } from '@/components/table-columns/price-column'
import { propsColumn } from '@/components/table-columns/props-column'
import { quantityColumn } from '@/components/table-columns/quantity-column'
import { priceInputColumn } from '@/components/table-columns/price-input-column'
import { tabsColumn } from '@/components/table-columns/tabs-column'
import { IDisplayedItem } from '@/types/echo-api/priced-item'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
dayjs.extend(relativeTime)
dayjs.extend(utc)

export const listingToolTableEditModeColumns = (): ColumnDef<IDisplayedItem>[] => [
  checkColumn(),
  nameColumn(),
  propsColumn(),
  // itemTag(),
  tabsColumn(),
  quantityColumn(),
  historyColumn(),
  priceInputColumn(),
  priceColumn({
    accessorKey: 'calculatedPrice',
    accessorFn: (item) => (item.calculatedPrice !== undefined ? item.calculatedPrice : '?'),
    headerName: 'Value'
  }),
  priceColumn({
    accessorKey: 'calculatedTotal',
    headerName: 'Total Value',
    accessorFn: (item) => item.calculatedTotalPrice
  })
  // priceColumn({
  //   accessorKey: 'cumulative',
  //   headerName: 'Commulative',
  //   cumulative: true
  // })
]
