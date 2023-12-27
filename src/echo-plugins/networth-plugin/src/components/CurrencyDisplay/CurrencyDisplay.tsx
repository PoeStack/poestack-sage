import { cn } from 'echo-common'
import { useMemo } from 'react'
import { CurrencySwitch } from '../../store/settingStore'
import { FormattedValue, formatValue } from '../../utils/currency.utils'
import { Tooltip } from 'echo-common/components-v1'

interface CurrencyDisplayProps {
  format?: FormattedValue
  value?: number
  valueShort?: boolean
  toCurrency?: CurrencySwitch
  divinePrice?: number
  showIcon?: boolean
  showChange?: boolean
  iconHeight?: number
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  format,
  value,
  valueShort = true,
  toCurrency = 'both',
  divinePrice,
  showIcon = true,
  showChange = false,
  iconHeight = 1.25
}) => {
  const {
    formattedValue,
    value: parsedValue,
    icon,
    currency
  } = useMemo(
    () => format || formatValue(value, toCurrency, divinePrice, showChange, valueShort),
    [format, value, toCurrency, divinePrice, showChange, valueShort]
  )

  const styledValue = (
    <span
      className={cn(
        showChange && parsedValue < 0 && 'font-bold text-destructive-foreground',
        showChange && parsedValue > 0 && 'font-bold text-positive-foreground'
      )}
    >
      {formattedValue}
    </span>
  )

  if (!showIcon) {
    return (
      <>
        {styledValue}
        {currency}
      </>
    )
  }

  return (
    <span style={{ grid: `1fr / 1fr ${iconHeight}rem` }} className="grid gap-1 items-center">
      {styledValue}
      <img src={typeof icon === 'string' ? icon : ''} />
    </span>
  )
}

interface CurrencyDisplayWithTooltipProps extends CurrencyDisplayProps {
  className?: string
}

const CurrencyDisplayWithTooltip: React.FC<CurrencyDisplayWithTooltipProps> = ({
  className,
  value,
  valueShort = true,
  toCurrency = 'both',
  divinePrice,
  showIcon = true,
  showChange = false,
  iconHeight = 1.25
}) => {
  const format = useMemo(
    () => formatValue(value, toCurrency, divinePrice, showChange, valueShort),
    [value, toCurrency, divinePrice, showChange, valueShort]
  )

  if (toCurrency === 'chaos' || format.currency === 'c') {
    return (
      <div className="text-right">
        <CurrencyDisplay
          format={format}
          showChange={showChange}
          showIcon={showIcon}
          iconHeight={iconHeight}
        />
      </div>
    )
  }

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={50}>
        <Tooltip.Trigger asChild>
          <div className={className}>
            <CurrencyDisplay
              format={format}
              showChange={showChange}
              showIcon={showIcon}
              iconHeight={iconHeight}
            />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="text-sm">
            <CurrencyDisplay
              value={value}
              toCurrency={'chaos'}
              divinePrice={divinePrice}
              showChange={showChange}
              showIcon={showIcon}
            />
          </p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  )
}

export default CurrencyDisplayWithTooltip
