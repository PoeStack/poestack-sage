import { useRef, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { Collapsible, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'

interface TabBreakdownChartCardProps {
  className?: string
}

const TabBreakdownChartCard: React.FC<TabBreakdownChartCardProps> = ({ className }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
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
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <Card className="w-full">
        <Collapsible.Trigger className="!mt-0 cursor-pointer" asChild>
          <Card.Header className="flex flex-row justify-between items-center p-3">
            <Card.Title className="text-base">{t('title.tabBreakdownHistoryCard')}</Card.Title>
            {open ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Card.Header>
        </Collapsible.Trigger>
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

export default observer(TabBreakdownChartCard)
