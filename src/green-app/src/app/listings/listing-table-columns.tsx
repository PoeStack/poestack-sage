/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import CurrencyDisplay from '@/components/currency-display'
import DebouncedInput from '@/components/debounced-input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CurrencySwitch, formatValue, round } from '@/lib/currency'
import { parseUnsafeHashProps } from '@/lib/item-util'
import { cn } from '@/lib/utils'
import { SageValuation } from '@/types/echo-api/valuation'
import { ListingMode, SageListingItemType } from '@/types/sage-listing-type'
import { ColumnDef, Row } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import Image from 'next/image'
import { ChangeEvent, useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { TableColumnHeader } from '../../components/column-header'
dayjs.extend(relativeTime)
dayjs.extend(utc)

type ColumnDefProps = {
  listingMode: ListingMode
}

export function checkColumn(): ColumnDef<SageListingItemType> {
  const key = 'selected'

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
    id: key,
    enableResizing: false,
    enableSorting: true,
    enableGlobalFilter: false,
    enableMultiSort: true,
    size: 40,
    meta: {
      className: 'min-w-[40px] max-w-fit p-0',
      removePadding: true
    },
    sortDescFirst: true,
    cell: ({ row }) => {
      return (
        <div
          className="inline-block px-3 pt-3 pb-2 cursor-pointer text-center data-[state=disabled]:cursor-not-allowed"
          onClick={() => {
            row.toggleSelected(!row.getIsSelected())
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            // onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      )
    }
  }
}

export function nameColumn(): ColumnDef<SageListingItemType> {
  const key = 'displayName'
  const header = 'Name'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey: key,
    enableSorting: true,
    enableGlobalFilter: true,
    size: 230,
    minSize: 90,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)

      return (
        <div className="flex flex-row gap-2">
          <ItemIconCell value={row.original.icon} />
          <ItemNameCell value={value} />
        </div>
      )
    }
  }
}

export function propsColumn(): ColumnDef<SageListingItemType> {
  const key = 'unsafeHashProperties'
  const header = 'Props'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey: key,
    accessorFn: (val) => parseUnsafeHashProps(val.summary.unsafeHashProperties),
    enableSorting: true,
    enableGlobalFilter: true,
    size: 200,
    minSize: 100,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <ItemPropsCell value={value} />
    }
  }
}

export function quantityColumn(options: { diff?: boolean }): ColumnDef<SageListingItemType> {
  const { diff } = options

  const key = 'quantity'
  const header = 'Quantity'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
    accessorFn: (item) => {
      return item.quantity
    },
    enableSorting: true,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<number>(key)
      return <ItemQuantityCell quantity={value} diff={diff} />
    }
  }
}

export function historyColumn(): ColumnDef<SageListingItemType> {
  const key = 'valuation'
  const header = 'Price last 2 days'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
    accessorFn: (pricedItem) => {
      const valuation = pricedItem.valuation
      if (!valuation) return 0
      // Remove indexes
      const history = valuation.history.primaryValueHourly.slice()
      if (history.length < 2) return 0
      let i = history.length
      let indexToUse = history.length
      while (i--) {
        if (history[i]) {
          indexToUse = i
          break
        }
      }
      if (indexToUse === 0) return 0

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
      const totalChange = row.getValue<number>(key)
      return <SparklineCell valuation={value} totalChange={totalChange} />
    }
  }
}

export function itemValue(options: {
  accessorKey: string
  header: string
  cumulative?: boolean
  showChange?: boolean
  toCurrency?: 'chaos' | 'divine' | 'both'
  enableSorting?: boolean
  accessorFn?: (value: SageListingItemType) => string | number
}): ColumnDef<SageListingItemType> {
  const { header, accessorKey, accessorFn, cumulative, showChange, toCurrency, enableSorting } =
    options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey,
    accessorFn: accessorFn,
    enableSorting: enableSorting ?? false,
    enableGlobalFilter: false,
    enableResizing: false,
    sortingFn: (
      rowA: Row<SageListingItemType>,
      rowB: Row<SageListingItemType>,
      columnId: string
    ) => {
      const val1 = rowA.getValue(columnId)
      const val2 = rowB.getValue(columnId)
      if (typeof val1 === 'number' && typeof val2 === 'number') {
        return val1 - val2
      } else if (typeof val1 === 'number') {
        return val1 - 0
      } else {
        return 0 - (val2 as number)
      }
    },
    meta: {
      headerWording: header
    },
    cell: ({ row, table }) => {
      let value = 0
      // if (cumulative) {
      //   const sortedRows = table.getSortedRowModel().rows
      //   for (let i = 0; i < sortedRows.length; i++) {
      //     const total = sortedRows[i].original.calculatedTotal
      //     if (total !== undefined) {
      //       value += total
      //     }
      //     if (sortedRows[i].id === row.id) {
      //       break
      //     }
      //   }
      // } else if (accessorKey) {
      value = row.getValue(accessorKey)
      // }

      return <ItemValueCell value={value} showChange={showChange} toCurrency={toCurrency} />
    }
  }
}

export function multiplierColumn(): ColumnDef<SageListingItemType> {
  const key = 'multiplier'
  const header = 'Multiplier'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
    accessorFn: (item) => {
      if (item.primaryValuation === 0 || item.price === 0) return '- '
      return ((item.price / item.primaryValuation) * 100).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    },
    enableSorting: true,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <div className="text-right">{value}%</div>
    }
  }
}

type ItemNameCellProps = {
  value: string
}

const ItemNameCell = ({ value }: ItemNameCellProps) => {
  return (
    <div
      className={`truncate hover:overflow-x-auto hover:text-clip no-scrollbar self-center capitalize`}
      onMouseOut={(e) => {
        e.currentTarget.scrollLeft = 0
      }}
    >
      {value}
    </div>
  )
}

type ItemIconCellProps = {
  value: string
  // frameType: number
}

const ItemIconCell = ({ value }: ItemIconCellProps) => {
  // const rarityColor = rarityColors[getRarity(frameType)]

  return (
    <div className="flex flex-row gap-1 shrink-0">
      {/* <div
        style={{
          borderLeft: `5px solid ${rarityColor}`
          // background: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, rgba(0,0,0,0) 100%)`
        }}
        className="flex justify-start items-center h-full pr-[4px]"
      /> */}
      <Image
        className="block h-6 min-h-fit min-w-fit shrink-0"
        src={typeof value === 'string' ? value : ''}
        alt={''}
        height={24}
        width={24}
        sizes="33vw"
        style={{ width: 'auto', height: '24px' }}
      />
    </div>
  )
}

type ItemPropsCellProps = {
  value: string
}

const ItemPropsCell = ({ value }: ItemPropsCellProps) => {
  const hashProps = useMemo(() => {
    if (!value) return []
    return value.split(';;;').map((v) => {
      const keyVal = v.split(';;')
      return { name: keyVal[0], value: keyVal[1] }
    })
  }, [value])

  return (
    <div
      className="space-x-1 truncate hover:overflow-x-auto hover:text-clip no-scrollbar"
      onMouseLeave={(e) => (e.currentTarget.scrollLeft = 0)}
    >
      {hashProps.map(({ name, value }) => (
        <Badge key={name} variant="secondary" className="capitalize">
          {value}
        </Badge>
      ))}
    </div>
  )
}

type ItemQuantityCellProps = {
  quantity: number
  diff?: boolean
}

const ItemQuantityCell = ({ quantity, diff }: ItemQuantityCellProps) => {
  return (
    <div
      className={cn(
        'text-right',
        diff && 'font-semibold',
        diff && quantity > 0 && `text-green-400`,
        diff && quantity < 0 && `text-red-400`
      )}
    >
      {diff && quantity > 0 ? '+ ' : ''}
      {quantity}
    </div>
  )
}

type ItemValueCellProps = {
  value: number | string
  editable?: boolean
  showChange?: boolean
  toCurrency?: CurrencySwitch
}

const ItemValueCell = ({ value, showChange, toCurrency }: ItemValueCellProps) => {
  return (
    <div className="float-end">
      {typeof value === 'number' ? (
        <CurrencyDisplay
          value={value}
          showChange={showChange}
          toCurrency={toCurrency}
          splitIcons={false}
        />
      ) : (
        value
      )}
    </div>
  )
}

export function quantityInputColumn(): ColumnDef<SageListingItemType> {
  const key = 'selectedQuantity'
  const header = 'Asking Quantity'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
    enableSorting: true,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: {
      headerWording: header
    },
    cell: ({ row, table, column }) => {
      const initialValue = row.getValue<number>(key)

      const onInnerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (Number.isNaN(newValue) || newValue < 0) return 0
        else if (newValue > row.original.quantity) return round(row.original.quantity)
        return round(newValue, 4)
      }

      const placeHolder = `${row.original.quantity ?? '?'}`

      const updateTableData = (value: string | number) => {
        if (typeof value === 'number') {
          table.options.meta?.updateData(row.index, column.id, value)
        } else if (!Number.isNaN(parseFloat(value))) {
          table.options.meta?.updateData(row.index, column.id, parseFloat(value))
        } else {
          table.options.meta?.updateData(row.index, column.id, value)
        }
      }

      return (
        <DebouncedInput
          type="number"
          className="text-center remove-arrow min-w-20"
          value={initialValue}
          min={0}
          max={row.original.quantity}
          onInnerChange={onInnerChange}
          placeholder={placeHolder}
          onChange={(value) => updateTableData(value)}
          onBlur={(value) => updateTableData(value)}
          debounce={250}
        />
      )
    }
  }
}

type SparklineCellProps = {
  valuation?: SageValuation
  totalChange: number
}

const SparklineCell = ({ valuation, totalChange }: SparklineCellProps) => {
  const data = useMemo(() => {
    if (!valuation) return

    return valuation.history.primaryValueHourly.map((value) => {
      const format = formatValue(value, 'chaos')
      return {
        name: 'history',
        value: format.value
      }
    })
  }, [valuation])

  return (
    <>
      {data && (
        <div className="flex flex-row justify-between items-center">
          <ResponsiveContainer width={'100%'} height={35}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="history" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={0.6}
                fill="url(#history)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div
            className={cn(
              'shrink-0 text-right whitespace-nowrap pl-1 -mr-1 min-w-12',
              totalChange > 0 && ` text-green-400`,
              totalChange < 0 && ` text-red-400`
            )}
          >
            {totalChange.toLocaleString(undefined, {
              maximumFractionDigits: 1
            })}{' '}
            %
          </div>
        </div>
      )}
    </>
  )
}

type ColumnsDefProps = ColumnDefProps & {}

export const listingTableBulkModeColumns = ({
  listingMode
}: ColumnsDefProps): ColumnDef<SageListingItemType>[] => [
  nameColumn(),
  propsColumn(),
  quantityColumn({}),
  historyColumn(),
  itemValue({
    accessorKey: 'price',
    accessorFn: (item) => item.price,
    header: 'Value',
    enableSorting: true
  }),
  itemValue({
    accessorKey: 'calculatedTotal',
    header: 'Total Value',
    enableSorting: true,
    accessorFn: (item) => item.price * item.selectedQuantity
  }),
  multiplierColumn()
]

export const listingTradeSingleModeColumns = ({
  listingMode
}: ColumnsDefProps): ColumnDef<SageListingItemType>[] => [
  checkColumn(),
  nameColumn(),
  propsColumn(),
  quantityColumn({}),
  historyColumn(),
  itemValue({
    accessorKey: 'price',
    accessorFn: (item) => item.price,
    header: 'Value',
    enableSorting: true
  }),
  itemValue({
    accessorKey: 'calculatedTotal',
    header: 'Total Value',
    enableSorting: true,
    accessorFn: (item) => item.price * item.selectedQuantity
  }),
  multiplierColumn(),
  quantityInputColumn()
]
