'use client'

import { checkColumn } from '@/components/table-columns/check-column'
import { historyColumn } from '@/components/table-columns/history-column'
import { multiplierColumn } from '@/components/table-columns/multiplier-column'
import { nameColumn } from '@/components/table-columns/name-column'
import { priceColumn } from '@/components/table-columns/price-column'
import { propsColumn } from '@/components/table-columns/props-column'
import { quantityColumn } from '@/components/table-columns/quantity-column'
import { quantityInputColumn } from '@/components/table-columns/quantity-input-column'
import { SageListingItemType } from '@/types/sage-listing-type'
import { ColumnDef } from '@tanstack/react-table'

export const listingTableBulkModeColumns = (): ColumnDef<SageListingItemType>[] => [
  nameColumn(),
  propsColumn(),
  quantityColumn(),
  historyColumn({ mode: '2 days', animation: false }),
  priceColumn({
    accessorKey: 'price',
    accessorFn: (item) => item.price,
    header: 'Value'
  }),
  priceColumn({
    accessorKey: 'calculatedTotal',
    header: 'Total Value',
    accessorFn: (item) => item.price * item.selectedQuantity
  }),
  multiplierColumn({
    accessorFn: (item) => {
      if (item.primaryValuation === 0 || item.price === 0) return '- '
      return ((item.price / item.primaryValuation) * 100).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
  })
]

export const listingTradeSingleModeColumns = (): ColumnDef<SageListingItemType>[] => [
  checkColumn(),
  nameColumn(),
  propsColumn(),
  quantityColumn(),
  historyColumn({ mode: '2 days', animation: false }),
  priceColumn({
    accessorKey: 'price',
    accessorFn: (item) => item.price,
    header: 'Value',
    enableSorting: true
  }),
  priceColumn({
    accessorKey: 'calculatedTotal',
    header: 'Total Value',
    enableSorting: true,
    accessorFn: (item) => item.price * item.selectedQuantity
  }),
  multiplierColumn({
    accessorFn: (item) => {
      if (item.primaryValuation === 0 || item.price === 0) return '- '
      return ((item.price / item.primaryValuation) * 100).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
  }),
  quantityInputColumn()
]
