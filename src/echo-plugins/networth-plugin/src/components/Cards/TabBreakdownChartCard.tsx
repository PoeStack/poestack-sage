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

function TabBreakdownChartCard() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { accountStore, priceStore, settingStore } = useStore()
  const breakdownData = accountStore.activeAccount.activeProfile?.tabBreakdownOverTime
  const series =
    accountStore.activeAccount.activeProfile?.activeStashTabs.reduce(
      (seriesMap, tab) => {
        seriesMap[tab.id] = {
          type: 'line',
          data: [],
          name: tab.name
        }
        return seriesMap
      },
      {} as Record<string, { type: 'line'; data: any[]; name: string }>
    ) ?? {}

  breakdownData?.forEach((item) => {
    const tabSeries = series[item.stashTabId]
    if (tabSeries) {
      tabSeries.data.push([
        item.time,
        convertToCurrency({
          value: item.value,
          toCurrency: settingStore.currency,
          divinePrice: priceStore.divinePrice
        })
      ])
    }
  })

  const options: Highcharts.Options = {
    series: Object.values(series),
    credits: {
      enabled: false
    },
    chart: {
      height: 200,
      backgroundColor: 'hsl(var(--card))'
    },
    yAxis: {
      gridLineColor: 'hsl(var(--muted-foreground))',
      gridLineDashStyle: 'Dash',
      lineColor: 'hsl(var(--muted-foreground))',
      tickColor: 'hsl(var(--muted-foreground))',
      labels: {
        style: {
          font: '12px Times New Roman',
          color: 'hsl(var(--muted-foreground))'
        }
      },
      title: {
        text: undefined,
        style: {
          font: '14px Times New Roman',
          color: 'hsl(var(--muted-foreground))'
        }
      }
    },
    xAxis: {
      grid: {
        enabled: true
      },
      type: 'datetime',
      labels: {
        style: {
          font: '12px Times New Roman',
          color: 'hsl(var(--muted-foreground))'
        },
        formatter: function () {
          return Highcharts.dateFormat('%a %d %b %H:%M:%S', this.value as number)
        }
      },
      tickAmount: 5,
      title: {
        style: {
          font: '14px Times New Roman',
          color: 'hsl(var(--muted-foreground))'
        }
      },
      lineColor: 'hsl(var(--muted-foreground))',
      tickColor: 'hsl(var(--muted-foreground))',
      gridLineColor: 'var(--primary-foreground)',
      gridLineDashStyle: 'Dash'
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
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      backgroundColor: 'hsl(var(--card))',
      style: {
        fontSize: '14px',
        fontFamily: 'Times New Roman',
        color: 'hsl(var(--muted-foreground))'
      },
      pointFormat: '{series.name}: {point.y}',
      valueDecimals: 2,
      valueSuffix: settingStore.activeCurrency.short
    }
  }

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <Card.Header className="flex flex-row justify-between items-center p-3">
          <Card.Title>{t('title.tabBreakdownHistoryCard')}</Card.Title>
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
              <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
            </div>
          </Card.Content>
        </Collapsible.Content>
      </Card>
    </Collapsible>
  )
}

export default observer(TabBreakdownChartCard)
