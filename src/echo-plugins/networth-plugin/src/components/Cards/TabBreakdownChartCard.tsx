import { useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { LineChartIcon } from 'lucide-react'

import { Card, Accordion } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'

interface TabBreakdownChartCardProps {
  className?: string
}

const TabBreakdownChartCard: React.FC<TabBreakdownChartCardProps> = ({ className }) => {
  const { t } = useTranslation()
  const { accountStore, settingStore } = useStore()

  const chartConfig: Highcharts.Options = {
    ...baseChartConfig,
    series: accountStore.activeAccount.activeProfile?.tabChartData,
    chart: {
      ...baseChartConfig.chart,
      height: 234
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
    },
    tooltip: {
      ...baseChartConfig.tooltip,
      pointFormat: '{series.name}: {point.y}',
      valueDecimals: 2,
      valueSuffix: settingStore.activeCurrency.short
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
              <div className="pl-2 uppercase">{t('title.tabBreakdownHistoryCard')}</div>
            </Card.Header>
          </Accordion.Trigger>
          <Accordion.Content>
            <Card.Content className="p-2 border-t">
              <div className="px-2">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={chartConfig}
                  ref={chartComponentRef}
                />
              </div>
            </Card.Content>
          </Accordion.Content>
        </Accordion.Item>
      </Card>
    </Accordion>
  )
}

export default observer(TabBreakdownChartCard)
