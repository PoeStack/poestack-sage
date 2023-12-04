'use client'

import { useRef, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { Collapsible, Card } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'

function NetWorthCard() {
  const [open, setOpen] = useState(false)
  const options: Highcharts.Options = {
    series: [
      {
        type: 'area',
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
        data: [1, 2, 3, 4]
      }
    ],
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
      labels: {
        style: {
          font: '12px Times New Roman',
          color: 'hsl(var(--muted-foreground))'
        }
      },
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
      }
    }
  }
  // const [options, setOptions] = useState<Highcharts.Options>()
  const { accountStore } = useStore()
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <Card.Header className="flex flex-row justify-between items-center p-3">
          <Card.Title>Net Worth History Chart</Card.Title>
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

export default observer(NetWorthCard)
