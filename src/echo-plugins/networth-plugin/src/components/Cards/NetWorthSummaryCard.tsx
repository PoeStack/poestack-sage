'use client'

import { useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'

function NetWorthSummaryCard() {
  const { accountStore } = useStore()
  const netWorthData = accountStore.activeAccount.activeProfile?.netWorthOverTime
  const chartData = netWorthData?.map((item) => [item.time, item.value])
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
          enabled: false
        },
        states: {
          hover: {
            enabled: false
          }
        },
        tooltip: {
          pointFormat: '{point.y}',
          valueDecimals: 2,
          valueSuffix: 'c'
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
      visible: false,
      gridLineColor: 'hsl(var(--muted-foreground))',
      gridLineDashStyle: 'Dash',
      lineColor: 'hsl(var(--muted-foreground))',
      tickColor: 'hsl(var(--muted-foreground))',
      labels: {
        enabled: false,
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
      visible: false
      // grid: {
      //   enabled: true
      // },
      // type: 'datetime',
      // labels: {
      //   enabled: false,
      //   style: {
      //     font: '12px Times New Roman',
      //     color: 'hsl(var(--muted-foreground))'
      //   },
      //   formatter: function () {
      //     return Highcharts.dateFormat('%a %d %b %H:%M:%S', this.value as number)
      //   }
      // },
      // tickAmount: 0,
      // title: {
      //   style: {
      //     font: '14px Times New Roman',
      //     color: 'hsl(var(--muted-foreground))'
      //   }
      // },
      // lineColor: 'hsl(var(--muted-foreground))',
      // tickColor: 'hsl(var(--muted-foreground))',
      // gridLineColor: 'var(--primary-foreground)',
      // gridLineDashStyle: 'Dash'
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
    <Card>
      <Card.Content className="p-3">
        <div className="flex flex-row items-center justify-between">
          <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
          <span>{(netWorthData?.length && netWorthData[-1]?.value) ?? 0}</span>
        </div>
      </Card.Content>
      <Card.Footer>
        <div className="flex flex-row items-center justify-between">
          <span>Net worth</span>
          <span className="text-destructive"></span>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default observer(NetWorthSummaryCard)
