import { useEffect, useMemo, useState } from 'react'
import { itemTableColumns } from './itemTableColumns'
import { ItemTable } from './ItemTable'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'

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

  return (
    <div className="container mx-auto py-10">
      <ItemTable columns={columns} data={data} />
    </div>
  )
}

export default observer(ItemTableContainer)
