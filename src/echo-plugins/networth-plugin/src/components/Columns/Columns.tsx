import { ColumnDef, filterFns } from '@tanstack/react-table'
import { rarityColors, currencyChangeColors } from '../../assets/theme'
import { getRarity, parseTabNames } from '../../utils/item.utils'
import { SageValuation, cn } from 'echo-common'
import { CurrencySwitch } from '../../store/settingStore'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { TableColumnHeader } from './ColumnHeader'
import CurrencyDisplay from '../CurrencyDisplay/CurrencyDisplay'
import { baseChartConfig } from '../Cards/baseChartConfig'
import { useMemo, useRef } from 'react'
import { formatValue } from '../../utils/currency.utils'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Badge } from 'echo-common/components-v1'

type PricedItem = keyof IPricedItem | 'cumulative'

export function itemIcon(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { header, accessorKey } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey,
    size: 65,
    minSize: 52,
    enableSorting: false,
    enableGlobalFilter: true,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(accessorKey)
      return <ItemIconCell value={value} frameType={row.original.frameType} />
    }
  }
}

export function itemName(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { header, accessorKey } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey,
    enableSorting: true,
    enableGlobalFilter: true,
    size: 300,
    minSize: 100,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(accessorKey)
      return <ItemNameCell value={value} frameType={row.original.frameType} />
    }
  }
}

export function itemProps(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { header, accessorKey } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey,
    accessorFn: (val) => {
      const hashProps = Object.entries(val.unsafeHashProperties || {})
        .filter(([name, value]) => {
          const excludeNameByIncludes = (name: string) =>
            !['mods', 'Mods'].some((key) => name.includes(key))

          const excludeFalseValues = (value: any) => {
            if (!value || value === '0') return false
            return true
          }
          return excludeNameByIncludes(name) && excludeFalseValues(value)
        })
        .map(([name, value]) => {
          let displayValue = `${name}: ${value}`
          // Name only
          if (value === true) {
            displayValue = name
          }
          return { name, value, displayValue }
        })

      if (val.key && val.name.toLowerCase() !== val.key.toLowerCase()) {
        // Used for contract or cluster jewels
        hashProps.push({ name: val.name, value: val.key, displayValue: val.key })
      }

      hashProps.sort((a, b) => a.displayValue.length - b.displayValue.length)
      // Filterfn does not work, when an object is returned
      return hashProps.map((p) => `${p.name};;${p.displayValue}`).join(';;;')
    },
    enableSorting: true,
    enableGlobalFilter: true,
    size: 620,
    minSize: 150,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.getValue<string>(accessorKey)
      return <ItemPropsCell value={value} />
    }
  }
}

export function itemTabs(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { header, accessorKey } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey,
    enableSorting: true,
    enableGlobalFilter: true,
    size: 180,
    minSize: 75,
    meta: {
      headerWording: header
    },
    accessorFn: (val) =>
      val.tab && typeof val.tab === 'object' ? parseTabNames(val.tab || []) : '',
    cell: ({ row }) => {
      const value = row.getValue<string>(accessorKey)
      return <ItemTabsCell value={value} />
    }
  }
}

export function itemQuantity(options: {
  accessorKey: PricedItem
  header: string
  diff?: boolean
}): ColumnDef<IPricedItem> {
  const { header, accessorKey, diff } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey,
    enableSorting: true,
    enableGlobalFilter: false,
    size: 110,
    minSize: 90,
    meta: {
      headerWording: header
    },
    // maxSize: 80,
    cell: ({ row }) => {
      const value = row.getValue<number>(accessorKey)
      return <ItemQuantityCell quantity={value} diff={diff} />
    }
  }
}

export function sparkLine(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { accessorKey, header } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey,
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
    size: 180,
    minSize: 170,
    meta: {
      headerWording: header
    },
    cell: ({ row }) => {
      const value = row.original.valuation
      const totalChange = row.getValue<number>(accessorKey)
      return <SparklineCell valuation={value} totalChange={totalChange} />
    }
  }
}

export function itemValue(options: {
  accessorKey: PricedItem
  header: string
  cumulative?: boolean
  showChange?: boolean
  toCurrency?: 'chaos' | 'divine' | 'both'
  enableSorting?: boolean
}): ColumnDef<IPricedItem> {
  const { header, accessorKey, cumulative, showChange, toCurrency, enableSorting } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="right" />,
    accessorKey,
    enableSorting: enableSorting ?? false,
    enableGlobalFilter: false,
    size: 120,
    minSize: 100,
    meta: {
      headerWording: header
    },
    cell: ({ row, table }) => {
      let value = 0
      if (cumulative) {
        const sortedRows = table.getSortedRowModel().rows
        for (let i = 0; i < sortedRows.length; i++) {
          value += sortedRows[i].original.total
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
  frameType: number
}

const ItemIconCell = ({ value, frameType }: ItemIconCellProps) => {
  const rarityColor = rarityColors[getRarity(frameType)]

  return (
    <div
      style={{
        borderLeft: `5px solid ${rarityColor}`
        // background: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, rgba(0,0,0,0) 100%)`
      }}
      className="flex justify-center items-center w-full h-full"
    >
      <div>
        <img
          className="block h-6 min-h-fit min-w-fit pl-[4px]"
          src={typeof value === 'string' ? value : ''}
        />
      </div>
    </div>
  )
}

type ItemNameCellProps = {
  value: string
  frameType: number
}

const ItemNameCell = ({ value, frameType }: ItemNameCellProps) => {
  const rarityColor = rarityColors[getRarity(frameType)]

  return (
    <div className="flex items-center justify-between">
      <span className={`whitespace-nowrap overflow-hidden text-ellipsis text-[${rarityColor}]`}>
        {value}
      </span>
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

type ItemTabsCellProps = {
  value: string
}

const ItemTabsCell = ({ value }: ItemTabsCellProps) => {
  return <span className="whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
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
        diff && quantity > 0 && `text-green-700`,
        diff && quantity < 0 && `text-red-800`
      )}
    >
      {diff && quantity > 0 ? '+ ' : ''}
      {quantity}
    </div>
  )
}

type ItemValueCellProps = {
  value: number
  editable?: boolean
  showChange?: boolean
  toCurrency?: CurrencySwitch
}

const ItemValueCellComponent = ({ value, showChange, toCurrency }: ItemValueCellProps) => {
  const { priceStore } = useStore()

  return (
    <CurrencyDisplay
      value={value}
      divinePrice={priceStore.divinePrice}
      showChange={showChange}
      toCurrency={toCurrency}
      className="text-right"
    />
  )
}

const ItemValueCell = observer(ItemValueCellComponent)

type SparklineCellProps = {
  valuation?: SageValuation
  totalChange: number
}

const SparklineCell = ({ valuation, totalChange }: SparklineCellProps) => {
  const data = useMemo(() => {
    if (!valuation) return
    return valuation.history.primaryValueHourly.map((value, i) => {
      const format = formatValue(value, 'chaos')
      return [i + 1, format.value]
    })
  }, [valuation])

  const chartConfig: Highcharts.Options = useMemo(
    () => ({
      ...baseChartConfig,
      series: [
        {
          type: 'area',
          showInLegend: false,
          lineColor: 'hsl(var(--muted-foreground))',
          fillOpacity: 0.5,
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, 'hsl(var(--muted) / 1)'],
              [0.5, 'hsl(var(--muted) / 0.5)'],
              [1, 'hsl(var(--muted) / 0.2)']
            ]
          },
          marker: {
            fillColor: 'hsl(var(--muted-foreground))',
            enabled: false
          },
          states: {
            hover: {
              enabled: false
            }
          },
          animation: true,
          data: data
        }
      ],
      chart: {
        ...baseChartConfig.chart,
        height: 25, // 25,
        width: 90,
        backgroundColor: '' // Dynamic for hover effects
      },
      boost: {
        useGPUTranslations: true
      },
      title: {
        text: undefined
      },
      yAxis: {
        ...baseChartConfig.yAxis,
        height: 25,
        visible: false
      },
      xAxis: {
        ...baseChartConfig.xAxis,
        height: 90,
        visible: false
      },
      tooltip: {
        ...baseChartConfig.tooltip,
        enabled: false
      }
    }),
    [data]
  )

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <>
      {data && (
        <div className="flex flex-row justify-between items-center">
          <HighchartsReact highcharts={Highcharts} options={chartConfig} ref={chartComponentRef} />
          <div
            className={cn(
              'text-right whitespace-nowrap pl-2',
              totalChange > 0 && `font-semibold text-green-700`,
              totalChange < 0 && `font-semibold text-red-800`
            )}
          >
            {totalChange.toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}{' '}
            %
          </div>
        </div>
      )}
    </>
  )
}
