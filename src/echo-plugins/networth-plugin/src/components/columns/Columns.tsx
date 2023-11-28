import { ColumnDef } from '@tanstack/react-table'
import { rarityColors, currencyChangeColors, itemColors } from '../../assets/theme'
import { IItem } from '../../interfaces/item.interface'
import { getRarity, parseTabNames } from '../../utils/item.utils'
import { ActionTooltip } from 'echo-common/components-v1'
import { ICompactTab } from '../../interfaces/stash.interface'
import { cn } from 'echo-common'
import { CurrencyShort } from '../../store/settingStore'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { observer } from 'mobx-react'

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
      const frameType = row.getValue<number>('frameType')
      return <ItemIconCell value={value} frameType={frameType}></ItemIconCell>
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
      const frameType = row.getValue<number>('frameType')
      return <ItemNameCell value={value} frameType={frameType} />
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
}): ColumnDef<IPricedItem> {
  const { header, accessorKey, placeholder, cumulative, diff, currencyType } = options

  return {
    header: () => <div className="text-right">{header}</div>,
    accessorKey,
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
      <div className="flex justify-center items-center relative">
        <img className="h-6 min-h-6" src={typeof value === 'string' ? value : ''} />
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
    <span
      className={cn(
        'font-bold',
        diff && quantity > 0 && `text-[${currencyChangeColors.positive}]`,
        diff && quantity < 0 && `text-[${currencyChangeColors.negative}]`
      )}
    >
      {diff && quantity > 0 ? '+ ' : ''}
      {quantity}
    </span>
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
  const { priceStore } = useStores()

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
    <>
      {value ? (
        <span
          className={cn(
            `text-[${itemColors.chaosOrb}] pr-1 font-bold`,
            diff && value > 0 && `text-[${currencyChangeColors.positive}]`,
            diff && value < 0 && `text-[${currencyChangeColors.negative}]`
          )}
        >
          {value ? tryParseNumber(value, diff) : placeholder}
        </span>
      ) : (
        <span className="pr-1">{placeholder}</span>
      )}
    </>
  )
}

const ItemValueCell = observer(ItemValueCellComponent)

function useStores(): { uiStateStore: any; customPriceStore: any; priceStore: any } {
  throw new Error('Function not implemented.')
}
