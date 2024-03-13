/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { currentDivinePriceAtom } from '@/components/providers'
import { priceColumn } from '@/components/table-columns/price-column'
import { TimeTracker } from '@/components/time-tracker'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useWhisperHashCopied } from '@/hooks/useWhisperHash'
import { cn } from '@/lib/utils'
import { createWishperAndCopyToClipboard } from '@/lib/whsiper-util'
import { ListingMode, SageListingType } from '@/types/sage-listing-type'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRightFromSquareIcon,
  LayoutListIcon,
  PackageIcon,
  RefreshCwIcon
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { TableColumnHeader } from '../../components/column-header'
import { useListingsStore } from './listingsStore'
import { multiplierColumn } from '@/components/table-columns/multiplier-column'
import useStore from '@/hooks/useStore'
dayjs.extend(utc)

export function categoryColumn(): ColumnDef<SageListingType> {
  const key = 'category'
  const header = 'Category'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (listing) => {
      return listing.meta.subCategory || listing.meta.category
    },
    enableSorting: true,
    enableGlobalFilter: true,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return (
        <div className="flex flex-row gap-1">
          <Image
            src={row.original.meta.icon}
            width={20}
            height={20}
            alt={row.original.meta.altIcon}
          />
          <span className="capitalize">{value}</span>
        </div>
      )
    }
  }
}

export function listingModeColumn(): ColumnDef<SageListingType> {
  const key = 'listingMode'
  const header = 'Sell Mode'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (listing) => {
      return listing.meta.listingMode
    },
    enableSorting: true,
    enableGlobalFilter: true,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const mode = row.getValue<ListingMode>(key)
      return (
        <div className="flex flex-row gap-1 items-center">
          {mode === 'bulk' ? (
            <PackageIcon className="w-4 h-4" />
          ) : (
            <LayoutListIcon className="w-4 h-4" />
          )}
          <span className="capitalize">{mode === 'bulk' ? 'Whole Listing' : 'Individual'}</span>
        </div>
      )
    }
  }
}

export function sellerColumn(): ColumnDef<SageListingType> {
  const key = 'seller'
  const header = 'Seller'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (listing) => {
      return listing.meta.ign
    },
    enableSorting: true,
    enableGlobalFilter: true,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <div>{value}</div>
    }
  }
}

export function createdColumn(): ColumnDef<SageListingType> {
  const key = 'created'
  const header = 'Created'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    accessorFn: (listing) => {
      return Math.trunc(listing.meta.timestampMs / 10000) * 10000
    },
    enableSorting: true,
    enableGlobalFilter: false,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<number>(key)
      return <TimeTracker createdAt={dayjs.utc(value)} />
    }
  }
}

export function actionsColumn(): ColumnDef<SageListingType> {
  const key = 'actions'
  const header = 'Actions'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    id: key,
    accessorKey: key,
    enableSorting: false,
    enableGlobalFilter: false,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const divinePrice = useAtomValue(currentDivinePriceAtom)
      const [detailsTooltipOpen, setDetailsTooltipOpen] = useState(false)
      const setSelectedListingId = useListingsStore((state) => state.setSelectedListingId)
      const [copyBtnDisabled, isLoading, messageCopied, messageSent, setMessageCopied] =
        useWhisperHashCopied(row.original)

      return (
        <TooltipProvider disableHoverableContent>
          <div className="flex flex-row gap-2">
            <Tooltip open={detailsTooltipOpen} onOpenChange={setDetailsTooltipOpen}>
              <TooltipTrigger asChild>
                {/* <DialogTrigger className="group" asChild> */}
                <Button
                  size="icon"
                  variant="default"
                  onClick={() => {
                    setDetailsTooltipOpen(false)
                    setSelectedListingId(row.original.uuid)
                  }}
                >
                  <ArrowUpRightFromSquareIcon className="h-4 w-4" />
                </Button>
                {/* </DialogTrigger> */}
              </TooltipTrigger>
              <TooltipContent>{'Show Details'}</TooltipContent>
            </Tooltip>
            {/* <Tooltip>
              <TooltipTrigger asChild> */}
            <Button
              className="flex flex-row gap-2"
              size="default"
              disabled={copyBtnDisabled || isLoading}
              variant={messageCopied ? 'outline' : 'secondary'}
              onClick={() => {
                if (!divinePrice || !setMessageCopied) return

                const state = useListingsStore.getState()
                const selectedItemsMap = state.selectedItemsMap[row.original.uuid]
                const selectedItems = row.original.items.filter(
                  (item) => selectedItemsMap[item.hash]
                )
                createWishperAndCopyToClipboard(divinePrice, row.original, selectedItems)
                setMessageCopied()
              }}
            >
              {messageCopied ? `Whisper copied!` : messageSent ? `Copy again?` : 'Copy whisper'}
              {isLoading && (
                <RefreshCwIcon className={cn(isLoading && 'animate-spin', 'w-4 h-w shrink-0')} />
              )}
            </Button>
            {/* </TooltipTrigger>
              <TooltipContent>{messageCopied ? 'Whisper copied' : 'Copy whisper'}</TooltipContent>
            </Tooltip> */}
            {/* TODO: Support functions */}
            {/* <Separator orientation="vertical" className="h-9" />
            <DropdownMenu>
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{'Actions'}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Remove Listing</DropdownMenuItem>
                <DropdownMenuItem>Filter by Seller</DropdownMenuItem>
                <DropdownMenuItem>Ignore Seller</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </TooltipProvider>
      )
    }
  }
}

export const listingsTableColumns = (): ColumnDef<SageListingType>[] => [
  // collapseColumn(),
  categoryColumn(),
  listingModeColumn(),
  sellerColumn(),
  priceColumn({
    accessorKey: 'totalPrice',
    headerName: 'Price',
    accessorFn: (listing) => listing.meta.calculatedTotalPrice
  }),
  multiplierColumn({
    accessorFn: (listing) => {
      if (listing.meta.multiplier === -1) return '- '
      return listing.meta.multiplier.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
  }),
  createdColumn(),
  actionsColumn()
]
