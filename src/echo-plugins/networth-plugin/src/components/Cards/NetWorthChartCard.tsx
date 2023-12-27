import { useRef, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ChevronDownIcon, ChevronRightIcon, LineChartIcon } from 'lucide-react'

import { Collapsible, Card, RadioGroup, Label } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'

type StartDateOption = { label: 'all-time' | 'one-month' | 'one-week' | 'one-day'; value?: number }

interface NetWorthChartCardProps {
  className?: string
}

const NetWorthChartCard: React.FC<NetWorthChartCardProps> = ({ className }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { accountStore, settingStore, uiStateStore } = useStore()
  const activeProfile = accountStore.activeAccount.activeProfile

  const handleStartDateSelect = (option: StartDateOption['label']) => {
    const nextOption: StartDateOption = { label: option }
    uiStateStore.setChartTimeSpan(nextOption.label)
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
          fillColor: 'hsl(var(--muted-foreground))'
        },
        tooltip: {
          pointFormat: '{point.y}',
          valueDecimals: 2,
          valueSuffix: settingStore.activeCurrency.short
        },
        data: activeProfile?.chartData
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
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <Card className="w-full">
        <Collapsible.Trigger className="!mt-0 cursor-pointer" asChild>
          <Card.Header className="flex flex-row justify-between items-center p-3">
            <div className="flex flex-row items-center">
              <LineChartIcon />
              <Card.Title className="text-base pl-2 uppercase">
                {t('title.netWorthHistoryCard')}
              </Card.Title>
            </div>

            {open ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Card.Header>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Card.Content className="flex flex-col p-2">
            <div className="px-2">
              <HighchartsReact
                highcharts={Highcharts}
                options={chartConfig}
                ref={chartComponentRef}
              />
            </div>
            <RadioGroup
              defaultValue={uiStateStore.chartTimeSpan}
              onValueChange={handleStartDateSelect}
            >
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
