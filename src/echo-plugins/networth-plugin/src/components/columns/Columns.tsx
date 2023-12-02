import { ColumnDef } from '@tanstack/react-table'
import { rarityColors, currencyChangeColors, itemColors } from '../../assets/theme'
import { IItem } from '../../interfaces/item.interface'
import { getRarity, parseTabNames } from '../../utils/item.utils'
import { ActionTooltip, Button } from 'echo-common/components-v1'
import { ICompactTab } from '../../interfaces/stash.interface'
import { cn } from 'echo-common'
import { CurrencyShort } from '../../store/settingStore'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { ArrowDown, ArrowUp } from 'lucide-react'

type PricedItem = keyof IPricedItem | 'comulative'

export function itemIcon(options: {
  accessorKey: PricedItem
  header: string
}): ColumnDef<IPricedItem> {
  const { header, accessorKey } = options

  return {
    header,
    accessorKey,
    minSize: 100,
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
    header,
    minSize: 120,
    accessorKey,
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
    header,
    accessorKey,
    // eslint-disable-next-line react/display-name
    cell: ({ row }) => {
      const value = row.getValue<ICompactTab[]>(accessorKey)
      return <ItemTabsCell tabs={value ? value : []} />
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
    header: () => <div className="text-right">{header}</div>,
    accessorKey,
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
      <div className="group">
        <div className="flex items-center justify-end gap-1 group whitespace-nowrap">
          {column.getCanSort() ? (
            <Button
              variant="ghost"
              size="sm"
              // className="px-2 hidden lg:flex"
              // className="px-2 invisible group-hover:visible"
              className="px-2"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {header}
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-1 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-1 h-4 w-4" />
              )}
            </Button>
          ) : (
            <>{header}</>
          )}
        </div>
      </div>
    ),
    accessorKey,
    enableSorting: enableSorting ?? false,
    cell: ({ row, table }) => {
      let value = 0
      if (cumulative) {
        value = row.original.total
        // for (let i = 0; i < data.sortedRows.length; i++) {
        //   if (data.sortedRows[i].id === row.id) {
        //     break;
        //   }
        //   value += data.sortedRows[i].original.total;
        // }
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
  tabs: ICompactTab[]
}

const ItemTabsCell = ({ tabs }: ItemTabsCellProps) => {
  const value = tabs ? parseTabNames(tabs) : ''
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
