'use client'

import CurrencyDisplay from '@/components/currency-display'
import DebouncedInput from '@/components/debounced-input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CurrencySwitch, formatValue, round } from '@/lib/currency'
import { SageItemGroup } from '@/lib/item-grouping-service'
import { parseTabNames, parseUnsafeHashProps } from '@/lib/item-util'
import { cn } from '@/lib/utils'
import { IDisplayedItem } from '@/types/echo-api/priced-item'
import { SageValuation } from '@/types/echo-api/valuation'
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

type DisplayedItem = keyof IDisplayedItem | keyof SageItemGroup | 'cumulative'

export function checkColumn(): ColumnDef<IDisplayedItem> {
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
          data-state={row.original.group ? 'enabled' : 'disabled'}
          onClick={() => {
            if (row.original.group) {
              row.toggleSelected(!row.getIsSelected())
            }
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            // onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            disabled={!row.original.group}
          />
        </div>
      )
    }
  }
}

export function nameColumn(): ColumnDef<IDisplayedItem> {
  const key: DisplayedItem = 'displayName'
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

export function tagColumn(): ColumnDef<IDisplayedItem> {
  const key: DisplayedItem = 'tag'
  const header = 'Tag'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey: key,
    accessorFn: (val) => val.group?.tag,
    enableSorting: true,
    enableGlobalFilter: true,
    size: 65,
    minSize: 65,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <ItemTagCell value={value} />
    }
  }
}

export function propsColumn(): ColumnDef<IDisplayedItem> {
  const key: DisplayedItem = 'unsafeHashProperties'
  const header = 'Props'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey: key,
    accessorFn: (val) => parseUnsafeHashProps(val.group?.unsafeHashProperties),
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

export function tabsColumn(): ColumnDef<IDisplayedItem> {
  const key: DisplayedItem = 'tabs'
  const header = 'Tab'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey: key,
    accessorFn: (val) => parseTabNames(val.tabs),
    enableSorting: true,
    enableGlobalFilter: true,
    size: 75,
    minSize: 50,
    meta: {
      headerWording: header,
      staticResizing: true
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(key)
      return <ItemTabsCell value={value} />
    }
  }
}

export function quantityColumn(options: { diff?: boolean }): ColumnDef<IDisplayedItem> {
  const { diff } = options

  const key: DisplayedItem = 'stackSize'
  const header = 'Quantity'

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey: key,
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

export function historyColumn(): ColumnDef<IDisplayedItem> {
  const key: DisplayedItem = 'valuation'
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
  accessorKey: DisplayedItem
  header: string
  cumulative?: boolean
  showChange?: boolean
  toCurrency?: 'chaos' | 'divine' | 'both'
  enableSorting?: boolean
  accessorFn?: (value: IDisplayedItem) => string | number
}): ColumnDef<IDisplayedItem> {
  const { header, accessorKey, accessorFn, cumulative, showChange, toCurrency, enableSorting } =
    options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey,
    accessorFn: accessorFn,
    enableSorting: enableSorting ?? false,
    enableGlobalFilter: false,
    enableResizing: false,
    sortingFn: (rowA: Row<IDisplayedItem>, rowB: Row<IDisplayedItem>, columnId: string) => {
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
      if (cumulative) {
        const sortedRows = table.getSortedRowModel().rows
        for (let i = 0; i < sortedRows.length; i++) {
          const total = sortedRows[i].original.calculatedTotal
          if (total !== undefined) {
            value += total
          }
          if (sortedRows[i].id === row.id) {
            break
          }
        }
      } else if (accessorKey) {
        value = row.getValue(accessorKey)
      }

      return <ItemValueCell value={value} showChange={showChange} toCurrency={toCurrency} />
    }
  }
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
        className="block h-6 min-h-fit min-w-fit"
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

type ItemNameCellProps = {
  value: string
}

const ItemNameCell = ({ value }: ItemNameCellProps) => {
  return (
    <div
      className={`  truncate hover:overflow-x-auto hover:text-clip no-scrollbar capitalize self-center`}
      onMouseOut={(e) => {
        e.currentTarget.scrollLeft = 0
      }}
    >
      {value}
    </div>
  )
}

type ItemTagCellProps = {
  value: string
}

const ItemTagCell = ({ value }: ItemTagCellProps) => {
  return <span className="truncate capitalize">{value}</span>
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

type ItemTabsCellProps = {
  value: string
}

const ItemTabsCell = ({ value }: ItemTabsCellProps) => {
  return <span className="truncate">{value}</span>
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

export function quantityInputColumn(): ColumnDef<IDisplayedItem> {
  const key = 'selectedPrice'
  const header = 'Override'

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
      const initialValue = row.getValue<number | undefined>(key)

      const onInnerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (Number.isNaN(newValue) || newValue < 0) return ''
        return round(newValue, 4)
      }

      const placeHolder = `${row.original.originalPrice ?? '?'}c`

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
          value={initialValue ?? ''}
          min={0}
          onInnerChange={onInnerChange}
          placeholder={placeHolder}
          disabled={!row.original.group}
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
            <AreaChart height={35} data={data}>
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

export const listingToolTableEditModeColumns = (): ColumnDef<IDisplayedItem>[] => [
  checkColumn(),
  nameColumn(),
  propsColumn(),
  // itemTag(),
  tabsColumn(),
  quantityColumn({}),
  historyColumn(),
  quantityInputColumn(),
  itemValue({
    accessorKey: 'calculatedPrice',
    accessorFn: (item) => (item.calculatedPrice !== undefined ? item.calculatedPrice : '?'),
    header: 'Value',
    enableSorting: true
  }),
  itemValue({
    accessorKey: 'calculatedTotal',
    header: 'Total Value',
    enableSorting: true,
    accessorFn: (item) => item.calculatedTotal
  })
  // itemValue({
  //   accessorKey: 'cumulative',
  //   header: 'cumulative',
  //   cumulative: true
  // })
]
