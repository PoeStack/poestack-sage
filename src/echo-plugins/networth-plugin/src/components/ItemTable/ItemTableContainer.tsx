import { useEffect, useMemo, useState } from 'react'
import { itemTableColumns } from './itemTableColumns'
import ItemTable from './ItemTable'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { FilterFn, filterFns } from '@tanstack/react-table'
import { getRarityIdentifier } from '../../utils/item.utils'

const ItemTableContainer: React.FC = () => {
  const { accountStore } = useStore()
  const activeProfile = accountStore.activeAccount.activeProfile

  const data = useMemo(() => {
    return activeProfile?.items ?? []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile, activeProfile?.items])

  const columns = useMemo(() => {
    return itemTableColumns()
  }, [])

  const fuzzyFilter: FilterFn<IPricedItem> = (row, columnId, filterValue, addMeta) => {
    if (columnId === 'icon') {
      const rarity = getRarityIdentifier(filterValue?.toString()?.toLowerCase())
      return rarity >= 0 && row.original.frameType === rarity
    }

    if (columnId === 'name') {
      let itemNameRegex = new RegExp('', 'i')
      try {
        // try/catch required because of filtering being an onChange event, example: typing only [ would lead to a SyntaxError
        itemNameRegex = new RegExp(filterValue === '' ? undefined : filterValue, 'i')
      } catch (error) {
        console.error(error)
      }
      return (
        filterFns.includesString(row, columnId, filterValue, addMeta) ||
        itemNameRegex.test(row.getValue(columnId))
      )
    }

    return filterFns.includesString(row, columnId, filterValue, addMeta)
  }

  return (
    <div className="w-full px-8 py-4 border rounded-md">
      <ItemTable columns={columns} data={data} globalFilterFn={fuzzyFilter} />
    </div>
  )
}

export default observer(ItemTableContainer)
