import { formatValue } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { SageValuation } from '@/types/echo-api/valuation'
import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

type SparklineCellProps = {
  valuation?: SageValuation
  totalChange: number | string
  mode: '2 days' | '7 days'
  animation?: boolean
}

export const SparklineCell = ({ valuation, totalChange, mode, animation }: SparklineCellProps) => {
  const data = useMemo(() => {
    if (!valuation) return

    const history =
      mode === '2 days' ? valuation.history.primaryValueHourly : valuation.history.primaryValueDaily

    if (history.length < 2) return []

    return history.map((value) => {
      const format = formatValue(value, 'chaos')
      return {
        name: 'history',
        value: format.value
      }
    })
  }, [mode, valuation])

  return (
    <>
      {data && (
        <div className="flex flex-row justify-between items-center">
          <ResponsiveContainer width={'100%'} height={35}>
            <AreaChart height={35} data={data}>
              <defs>
                <linearGradient id="history" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={0.6}
                fill="url(#history)"
                isAnimationActive={animation ?? true}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div
            className={cn(
              'shrink-0 text-right whitespace-nowrap pl-1 -mr-1 min-w-12',
              typeof totalChange === 'number' && totalChange > 0 && ` text-green-400`,
              typeof totalChange === 'number' && totalChange < 0 && ` text-red-400`
            )}
          >
            {typeof totalChange === 'number'
              ? totalChange.toLocaleString(undefined, {
                  maximumFractionDigits: 1
                }) + ' '
              : totalChange}
            %
          </div>
        </div>
      )}
    </>
  )
}
