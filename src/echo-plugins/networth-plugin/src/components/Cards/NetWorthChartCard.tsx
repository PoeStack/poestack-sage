import { useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { LineChartIcon } from 'lucide-react'

import { Card, RadioGroup, Label, Accordion } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'
import { dateFormat } from 'highcharts'

type StartDateOption = { label: 'all-time' | 'one-month' | 'one-week' | 'one-day'; value?: number }

interface NetWorthChartCardProps {
  className?: string
}

const NetWorthChartCard: React.FC<NetWorthChartCardProps> = ({ className }) => {
  const { t } = useTranslation()
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
            [0, 'hsl(var(--muted) / 1)'],
            [0.5, 'hsl(var(--muted) / 0.5)'],
            [1, 'hsl(var(--muted) / 0.2)']
          ]
        },
        marker: {
          enabled: true,
          fillColor: 'hsl(var(--muted-foreground))',
          radius: 1,
          symbol: 'circle'
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null,
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
      height: 200,
      zooming: {
        resetButton: {
          position: {
            align: 'left',
            verticalAlign: 'top',
            x: 15
          }
        },
        type: 'x'
      }
    },
    title: {
      text: undefined
    },
    xAxis: {
      ...baseChartConfig.xAxis,
      labels: {
        ...(baseChartConfig.xAxis as Highcharts.XAxisOptions).labels,
        formatter: function () {
          return dateFormat('%d %b %H:%M', this.value as number)
        }
      }
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
    <Accordion type="single" collapsible className={className}>
      <Card className="w-full">
        <Accordion.Item value="item-1" className="border-b-0">
          <Accordion.Trigger className="pr-2 py-0">
            <Card.Header className="flex flex-row justify-between items-center p-3 space-y-0">
              <LineChartIcon className="h-5 w-5" />
              <div className="pl-2 uppercase">{t('title.netWorthHistoryCard')}</div>
            </Card.Header>
          </Accordion.Trigger>
          <Accordion.Content>
            <Card.Content className="flex flex-col p-2 border-t">
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
                    <RadioGroup.Item
                      value="one-month"
                      id="one-month"
                      className="sr-only peer w-0"
                    />
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
          </Accordion.Content>
        </Accordion.Item>
      </Card>
    </Accordion>
  )
}

export default observer(NetWorthChartCard)
