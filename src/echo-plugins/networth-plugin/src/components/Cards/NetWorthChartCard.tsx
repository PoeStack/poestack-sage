'use client'

import { useRef, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { Collapsible, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { convertToCurrency } from '../../utils/currency.utils'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'

function NetWorthChartCard() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { accountStore, priceStore, settingStore } = useStore()
  const netWorthData = accountStore.activeAccount.activeProfile?.netWorthOverTime
  const chartData = netWorthData?.map((item) => [
    item.time,
    convertToCurrency({
      value: item.value,
      toCurrency: settingStore.currency,
      divinePrice: priceStore.divinePrice
    })
  ])

  const chartConfig: Highcharts.Options = {
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
            [0, 'hsla(var(--muted), 1)'],
            [0.5, 'hsla(var(--muted), 0.5)'],
            [1, 'hsla(var(--muted), 0.2)']
          ]
        },
        marker: {
          fillColor: 'hsl(var(--muted-foreground))'
        },
        tooltip: {
          pointFormat: '{point.y}',
          valueDecimals: 2,
          valueSuffix: settingStore.activeCurrency.short
        },
        data: chartData
      }
    ],
    chart: {
      ...baseChartConfig.chart,
      height: 200
    },
    title: {
      text: undefined
    },
    yAxis: {
      ...baseChartConfig.yAxis,
      title: {
        ...(baseChartConfig.yAxis as Highcharts.YAxisOptions).title,
        text: undefined
      }
    }
  }

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="grow">
        <Card.Header className="flex flex-row justify-between items-center p-3">
          <Card.Title>{t('title.netWorthHistoryCard')}</Card.Title>
          <Collapsible.Trigger className="!mt-0" asChild>
            {open ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Collapsible.Trigger>
        </Card.Header>
        <Collapsible.Content>
          <Card.Content className="p-2">
            <div className="px-2">
              <HighchartsReact
                highcharts={Highcharts}
                options={chartConfig}
                ref={chartComponentRef}
              />
            </div>
          </Card.Content>
        </Collapsible.Content>
      </Card>
    </Collapsible>
  )
}

export default observer(NetWorthChartCard)
