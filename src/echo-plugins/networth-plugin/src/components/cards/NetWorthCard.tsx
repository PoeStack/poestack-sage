'use client'

import { useRef, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ChevronDown } from 'lucide-react'

import { DropdownMenu, Button, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'

function NetWorthCard() {
  const [options, setOptions] = useState<Highcharts.Options>({
    series: [
      {
        type: 'line',
        data: [1, 2, 3]
      }
    ],
    credits: {
      enabled: false
    },
    chart: {
      // backgroundColor: 'blue',
      className: 'bg-primary'
    },
    title: {
      text: undefined
    }
  })
  const { accountStore } = useStore()
  const tableState = accountStore.activeAccount.networthTableView
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <Card>
      <Card.Header>
        <Card.Title>Net Worth History Chart</Card.Title>
      </Card.Header>
      <Card.Content>
        <div>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </Card.Content>
    </Card>
  )
}

export default observer(NetWorthCard)
