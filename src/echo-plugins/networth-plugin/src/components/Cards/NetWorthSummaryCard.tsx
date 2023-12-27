import { useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { Button, Card, Tooltip } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'
import { cn } from 'echo-common'
import { CircleDollarSign, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { baseChartConfig } from './baseChartConfig'
import CurrencyDisplay from '../CurrencyDisplay/CurrencyDisplay'

interface NetWorthSummaryCardProps {
  className?: string
}

const NetWorthSummaryCard: React.FC<NetWorthSummaryCardProps> = ({ className }) => {
  const { t } = useTranslation()
  const { accountStore, priceStore, settingStore } = useStore()
  const activeProfile = accountStore.activeAccount.activeProfile

  const getNextCurrency = () => {
    switch (settingStore.currency) {
      case 'chaos':
        return 'Switch to chaos/divine'
      case 'both':
        return 'Switch to chaos'
    }
    return 'Switch to chaos'
  }

  const handleToggleCurrency = () => {
    if (settingStore.currency === 'chaos') {
      settingStore.updatePricingCurrency('both')
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
        data: activeProfile?.sparklineChartData
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
    <Card className={className}>
      <Card.Content className="p-3 py-1">
        <div className="flex flex-row items-center justify-between min-h-[64px]">
          <div className="flex flex-row items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
            {activeProfile?.sparklineChartData && activeProfile.sparklineChartData.length > 1 && (
              <HighchartsReact
                highcharts={Highcharts}
                options={chartConfig}
                ref={chartComponentRef}
              />
            )}
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <CurrencyDisplay
              value={activeProfile?.netWorthValue}
              valueShort={false}
              toCurrency={settingStore.currency}
              divinePrice={priceStore.divinePrice}
              iconHeight={1.5}
            />
            <Tooltip.Provider>
              <Tooltip delayDuration={50} disableHoverableContent={false}>
                <Tooltip.Trigger asChild>
                  <Button onClick={handleToggleCurrency} size="icon" variant="ghost">
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p className="font-semibold text-sm">{getNextCurrency()}</p>
                </Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="border-t p-3">
        <div className="text-sm flex flex-row grow items-center justify-between">
          <span>{t('label.netWorth')}</span>
          <CurrencyDisplay
            value={activeProfile?.lastSnapshotChange}
            valueShort={false}
            toCurrency={settingStore.currency}
            divinePrice={priceStore.divinePrice}
            showChange
          />
        </div>
      </Card.Footer>
    </Card>
  )
}

export default observer(NetWorthSummaryCard)
