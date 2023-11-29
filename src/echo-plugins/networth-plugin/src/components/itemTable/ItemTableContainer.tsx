import { useEffect, useMemo, useState } from 'react'
import { itemTableColumns } from './itemTableColumns'
import { ItemTable } from './ItemTable'
import { IPricedItem } from '../../interfaces/priced-item.interface'

function getData(): IPricedItem[] {
  // Fetch data from your API here.
  return [
    {
      uuid: '728ed52f',
      blighted: false,
      calculated: 10,
      corrupted: false,
      elder: false,
      frameType: 3,
      icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9HbG92ZXMvVmFhbFJhZ2VHbG92ZXMiLCJ3IjoyLCJoIjoyLCJzY2FsZSI6MX1d/fbc53ac89d/VaalRageGloves.png',
      identified: true,
      ilvl: 80,
      itemId: '',
      level: 75,
      links: 4,
      max: 7,
      mean: 5,
      median: 6,
      min: 3,
      mode: 7,
      name: 'Hateforge',
      quality: 20,
      shaper: false,
      sockets: 4,
      stackSize: 1,
      tab: [{ id: '5', name: 'P1', color: '', index: 1 }],
      tier: 83,
      total: 10,
      totalStacksize: 1,
      typeLine: '',
      variant: '',
      detailsUrl: ''
    }
  ]
}

export default function DemoPage() {
  const data = useMemo(() => getData(), [])

  const columns = useMemo(() => {
    return itemTableColumns()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <ItemTable columns={columns} data={data} />
    </div>
  )
}
