'use client'

import { useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { Button, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { cn } from 'echo-common'
import { CircleDollarSign, RefreshCcw } from 'lucide-react'
import { convertToCurrency } from '../../utils/currency.utils'

function NetWorthSummaryCard() {
  const { accountStore, priceStore, settingStore } = useStore()
  const netWorthData = accountStore.activeAccount.activeProfile?.netWorthOverTime ?? []
  const latestNetWorth = accountStore.activeAccount.activeProfile?.netWorthChange()

  const chartData = netWorthData.map((item) => [
    item.time,
    convertToCurrency({
      value: item.value,
      toCurrency: settingStore.currency,
      divinePrice: priceStore.divinePrice
    })
  ])

  const currentNetWorth = chartData.length > 0 ? chartData[chartData.length - 1][1].toFixed(2) : '0'

  const handleToggleCurrency = () => {
    if (settingStore.currency === 'chaos') {
      settingStore.updatePricingCurrency('divine')
    } else {
      settingStore.updatePricingCurrency('chaos')
    }
  }

  const options: Highcharts.Options = {
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
            [0, 'hsla(var(--muted), 1)'],
            [0.5, 'hsla(var(--muted), 0.5)'],
            [1, 'hsla(var(--muted), 0.2)']
          ]
        },
        marker: {
          fillColor: 'hsl(var(--muted-foreground))',
          enabled: chartData.length < 1
        },
        states: {
          hover: {
            enabled: false
          }
        },
        data: chartData
      }
    ],
    credits: {
      enabled: false
    },
    chart: {
      height: 60,
      width: 100,
      backgroundColor: 'hsl(var(--card))'
    },
    yAxis: {
      visible: false
    },
    xAxis: {
      visible: false
    },
    title: {
      text: undefined
    },
    legend: {
      itemStyle: {
        font: '14px Times New Roman',
        color: 'hsl(var(--muted-foreground))'
      },
      itemHoverStyle: {
        color: 'hsl(var(--foreground))'
      }
    },
    tooltip: {
      enabled: false,
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      backgroundColor: 'hsl(var(--card))',
      style: {
        fontSize: '14px',
        fontFamily: 'Times New Roman',
        color: 'hsl(var(--muted-foreground))'
      }
    }
  }

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <Card className="min-w-[300px] grow">
      <Card.Content className="p-3 py-1">
        <div className="flex flex-row items-center justify-between min-h-[64px]">
          <div className="flex flex-row items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <span>{`${currentNetWorth} ${settingStore.activeCurrency.short}`}</span>
            <Button onClick={handleToggleCurrency} size="icon" variant="ghost">
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="border-t p-3">
        <div className="text-sm flex flex-row grow items-center justify-between">
          <span>Net worth</span>
          <span className={cn((latestNetWorth ?? 0) < 0 && 'text-destructive')}>
            {`${latestNetWorth} ${settingStore.activeCurrency.short}`}
          </span>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default observer(NetWorthSummaryCard)
