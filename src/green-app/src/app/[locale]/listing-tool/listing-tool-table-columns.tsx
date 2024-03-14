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
import { tagColumn } from '@/components/table-columns/tag-column'
dayjs.extend(relativeTime)
dayjs.extend(utc)

export const listingToolTableEditModeColumns = (): ColumnDef<IDisplayedItem>[] => [
  checkColumn(),
  nameColumn(),
  propsColumn(),
  tagColumn(),
  tabsColumn(),
  quantityColumn(),
  historyColumn(),
  historyColumn({ mode: '7 days' }),
  priceInputColumn(),
  priceColumn({
    accessorKey: 'calculatedPrice',
    headerName: 'price',
    accessorFn: (item) => (item.calculatedPrice !== undefined ? item.calculatedPrice : '?')
  }),
  priceColumn({
    accessorKey: 'calculatedTotal',
    headerName: 'totalPrice',
    accessorFn: (item) => item.calculatedTotalPrice
  }),
  priceColumn({
    accessorKey: 'cumulative',
    headerName: 'commulativePrice',
    cumulativeColumn: 'calculatedTotal',
    enableSorting: false
  })
]
