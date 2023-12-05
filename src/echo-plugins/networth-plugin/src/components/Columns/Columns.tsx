import { ColumnDef } from '@tanstack/react-table'
import { rarityColors, currencyChangeColors, itemColors } from '../../assets/theme'
import { getRarity, parseTabNames } from '../../utils/item.utils'
import { ActionTooltip } from 'echo-common/components-v1'
import { cn } from 'echo-common'
import { CurrencyShort } from '../../store/settingStore'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { TableColumnHeader } from './ColumnHeader'

type PricedItem = keyof IPricedItem | 'cumulative'

export function itemIcon(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { header, accessorKey } = options

  return {
    header: ({ column }) => <TableColumnHeader column={column} title={header} align="left" />,
    accessorKey,
    minSize: 100,
    enableSorting: false,
    enableGlobalFilter: true,
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
    minSize: 120,
    accessorKey,
    enableSorting: true,
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const value = row.getValue<string>(accessorKey)
      return <ItemNameCell value={value} frameType={row.original.frameType} />
    }
  }
}

// TODO:
// export function itemProps(options: {
//     accessorKey: PricedItem
//     header: string
//   }): ColumnDef<IPricedItem> {
//     const { header, accessorKey } = options

//     return {
//       header,
//       minSize: 120,
//       accessorKey,
//       cell: ({ row }) => {
//         const value = row.getValue<string>(accessorKey)
//         const frameType = row.getValue<number>('frameType')
//         return <ItemNameCell value={value} frameType={frameType} />
//       }
//     }
//   }

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
    maxSize: 80,
    cell: ({ row }) => {
      const value = row.getValue<number>(accessorKey)
      return <ItemQuantityCell quantity={value} diff={diff} />
    }
  }
}

export function itemValue(options: {
  accessorKey: PricedItem
  header: string
  placeholder?: string
  cumulative?: boolean
  diff?: boolean
  currencyType?: CurrencyShort
  enableSorting?: boolean
}): ColumnDef<IPricedItem> {
  const { header, accessorKey, placeholder, cumulative, diff, currencyType, enableSorting } =
    options

  return {
    header: ({ column }) => (
      <TableColumnHeader
        column={column}
        title={header}
        titleParams={{ currency: 'c' }}
        align="right"
      />
    ),
    accessorKey,
    enableSorting: enableSorting ?? false,
    enableGlobalFilter: false,
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

      return (
        <ItemValueCell
          value={value}
          placeholder={placeholder}
          diff={diff}
          currencyType={currencyType}
        />
      )
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
      <ActionTooltip label={value || ''} side="bottom">
        <span className={`whitespace-nowrap overflow-hidden text-ellipsis text-[${rarityColor}]`}>
          {value}
        </span>
      </ActionTooltip>
    </div>
  )
}

type ItemTabsCellProps = {
  value: string
}

const ItemTabsCell = ({ value }: ItemTabsCellProps) => {
  return (
    <ActionTooltip label={value} side="bottom">
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
    </ActionTooltip>
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
        'font-bold text-right',
        diff && quantity > 0 && `text-[${currencyChangeColors.positive}]`,
        diff && quantity < 0 && `text-[${currencyChangeColors.negative}]`
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
  placeholder?: string
  diff?: boolean
  currencyType?: CurrencyShort
}

const ItemValueCellComponent = ({ value, placeholder, diff, currencyType }: ItemValueCellProps) => {
  const { priceStore } = useStore()

  const tryParseNumber = (value: boolean | string | number, diff?: boolean) => {
    if (typeof value === 'number') {
      let calculatedValue = value
      if (currencyType === 'd' && priceStore.divinePrice) {
        calculatedValue = calculatedValue / priceStore.divinePrice
      }
      return `${diff && calculatedValue > 0 ? '+ ' : ''}${calculatedValue.toFixed(2)}`
    } else {
      return value
    }
  }

  return (
    <div className="text-right">
      {value ? (
        <span
          style={{ color: itemColors.chaosOrb }}
          className={cn(
            `pr-1 font-bold`,
            diff && value > 0 && `text-[${currencyChangeColors.positive}]`,
            diff && value < 0 && `text-[${currencyChangeColors.negative}]`
          )}
        >
          {value ? tryParseNumber(value, diff) : placeholder}
        </span>
      ) : (
        <span className="pr-1">{placeholder}</span>
      )}
    </div>
  )
}

const ItemValueCell = observer(ItemValueCellComponent)
