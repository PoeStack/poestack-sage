import { useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { Button, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { cn } from 'echo-common'
import { CircleDollarSign, RefreshCcw } from 'lucide-react'
import { convertToCurrency } from '../../utils/currency.utils'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'

function NetWorthSummaryCard() {
  const { t } = useTranslation()
  const { accountStore, priceStore, settingStore } = useStore()
  const netWorthData = accountStore.activeAccount.activeProfile?.netWorthOverTime() ?? []
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
          fillColor: 'hsl(var(--muted-foreground))',
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        data: chartData
      }
    ],
    chart: {
      ...baseChartConfig.chart,
      height: 60,
      width: 100
    },
    title: {
      text: undefined
    },
    yAxis: {
      ...baseChartConfig.yAxis,
      visible: false
    },
    xAxis: {
      ...baseChartConfig.xAxis,
      visible: false
    },
    tooltip: {
      ...baseChartConfig.tooltip,
      enabled: false
    }
  }

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <Card className="min-w-[300px] grow">
      <Card.Content className="p-3 py-1">
        <div className="flex flex-row items-center justify-between min-h-[64px]">
          <div className="flex flex-row items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
            {chartData.length > 1 && (
              <HighchartsReact
                highcharts={Highcharts}
                options={chartConfig}
                ref={chartComponentRef}
              />
            )}
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
          <span>{t('label.netWorth')}</span>
          <span className={cn((latestNetWorth ?? 0) < 0 && 'text-destructive')}>
            {`${latestNetWorth} ${settingStore.activeCurrency.short}`}
          </span>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default observer(NetWorthSummaryCard)
