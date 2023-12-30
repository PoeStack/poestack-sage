import { Options, dateFormat } from 'highcharts'

export const baseChartConfig: Options = {
  credits: {
    enabled: false
  },
  chart: {
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
      style: {
        font: '14px Times New Roman',
        color: 'hsl(var(--muted-foreground))'
      }
    }
  },
  xAxis: {
    type: 'datetime',
    labels: {
      style: {
        font: '12px Times New Roman',
        color: 'hsl(var(--muted-foreground))'
      },
      formatter: function () {
        return dateFormat('%d %b %H:%M:%S', this.value as number)
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
  legend: {
    itemStyle: {
      font: '12px Times New Roman',
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
  },
  time: {
    useUTC: false
  }
}
