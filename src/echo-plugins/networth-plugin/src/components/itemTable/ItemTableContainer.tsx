import { useEffect, useMemo, useState } from 'react'
import { itemTableColumns } from './itemTableColumns'
import { DataTable } from './ItemTable'
import { IPricedItem } from '../../interfaces/priced-item.interface'

function getData(): IPricedItem[] {
  // Fetch data from your API here.
  return [
    // {
    //   id: '728ed52f',
    //   amount: 100,
    //   status: 'pending',
    //   email: 'm@example.com'
    // }
  ]
}

export default function DemoPage() {
  const [data] = useState(() => getData())

  const columns = useMemo(() => {
    return itemTableColumns()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
