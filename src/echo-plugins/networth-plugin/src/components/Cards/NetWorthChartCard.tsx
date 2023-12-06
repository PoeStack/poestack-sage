import { useRef, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { Collapsible, Card, RadioGroup, Label } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { convertToCurrency } from '../../utils/currency.utils'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'
import dayjs from 'dayjs'

type StartDateOption = { label: 'all-time' | 'one-month' | 'one-week' | 'one-day'; value?: number }

function NetWorthChartCard() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [startingDate, setStartingDate] = useState<StartDateOption>({ label: 'all-time' })
  const { accountStore, priceStore, settingStore } = useStore()
  const netWorthData = accountStore.activeAccount.activeProfile?.netWorthOverTime(
    startingDate.value
  )

  const handleStartDateSelect = (option: StartDateOption['label']) => {
    const nextOption: StartDateOption = { label: option }
    switch (option) {
      case 'one-month':
        nextOption.value = dayjs().subtract(1, 'month').utc().valueOf()
        return
      case 'one-week':
        nextOption.value = dayjs().subtract(1, 'week').utc().valueOf()
        return
      case 'one-day':
        nextOption.value = dayjs().subtract(1, 'day').utc().valueOf()
        return
      case 'all-time':
      default:
    }
    setStartingDate(nextOption)
  }

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
          <Card.Content className="flex flex-col p-2">
            <div className="px-2">
              <HighchartsReact
                highcharts={Highcharts}
                options={chartConfig}
                ref={chartComponentRef}
              />
            </div>
            <RadioGroup defaultValue={startingDate.label} onValueChange={handleStartDateSelect}>
              <div className="flex flex-row border rounded-md">
                <div className="grow">
                  <RadioGroup.Item value="one-day" id="one-day" className="sr-only peer w-0" />
                  <Label
                    htmlFor="one-day"
                    className="flex flex-row items-center justify-center grow rounded-l-md border border-muted p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-accent-foreground"
                  >
                    Last day
                  </Label>
                </div>
                <div className="flex flex-row items-center justify-center grow">
                  <RadioGroup.Item value="one-week" id="one-week" className="sr-only peer w-0" />
                  <Label
                    htmlFor="one-week"
                    className="flex flex-row items-center justify-center grow border border-muted p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-accent-foreground"
                  >
                    Last week
                  </Label>
                </div>
                <div className="flex flex-row items-center justify-center grow">
                  <RadioGroup.Item value="one-month" id="one-month" className="sr-only peer w-0" />
                  <Label
                    htmlFor="one-month"
                    className="flex flex-row items-center justify-center grow border border-muted p-2 hover:bg-accent hover:text-accent-foreground text-muted-foreground peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-accent-foreground"
                  >
                    Last month
                  </Label>
                </div>
                <div className="flex flex-row items-center justify-center grow">
                  <RadioGroup.Item value="all-time" id="all-time" className="sr-only peer" />
                  <Label
                    htmlFor="all-time"
                    className="flex flex-row items-center justify-center grow rounded-r-md border border-muted bg-popover p-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-accent-foreground"
                  >
                    All-time
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </Card.Content>
        </Collapsible.Content>
      </Card>
    </Collapsible>
  )
}

export default observer(NetWorthChartCard)
