import { cn } from '../lib/utils'
import { useMemo } from 'react'
import { CurrencySwitch, FormattedValue, chaosIcon, formatValue } from '../lib/currency'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { divineIcon } from '../lib/currency'
import Image from 'next/image'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { currentDivinePriceAtom } from './providers'
import { useAtomValue } from 'jotai'

interface CurrencyDisplayProps {
  format?: FormattedValue
  value?: number
  valueShort?: boolean
  toCurrency?: CurrencySwitch
  divinePrice?: number
  splitIcons?: boolean
  showIcon?: boolean
  showChange?: boolean
  iconRect?: { width?: number; height?: number }
  className?: string
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  format,
  value,
  valueShort = true,
  toCurrency = 'both',
  divinePrice,
  splitIcons = true,
  showIcon = true,
  showChange = false,
  iconRect,
  className
}) => {
  const {
    formattedValue,
    formattedPrimaryValue,
    value: parsedValue,
    icon,
    currency
  } = useMemo(
    () => format || formatValue(value, toCurrency, divinePrice, splitIcons, showChange, valueShort),
    [format, value, toCurrency, divinePrice, splitIcons, showChange, valueShort]
  )

  const styledPrimaryValue = !!formattedPrimaryValue && (
    <div
      className={cn(
        showChange && 'font-semibold',
        showChange && parsedValue > 0 && `text-green-400`,
        showChange && parsedValue < 0 && `text-red-400`,
        'min-w-fit'
      )}
    >
      {formattedPrimaryValue}
    </div>
  )

  const styledValue = (
    <div
      className={cn(
        showChange && 'font-semibold',
        showChange && parsedValue > 0 && `text-green-400`,
        showChange && parsedValue < 0 && `text-red-400`,
        'min-w-fit'
      )}
    >
      {formattedValue}
    </div>
  )

  if (!showIcon) {
    return (
      <>
        {styledPrimaryValue && <>{styledPrimaryValue}d</>}
        {styledValue}
        {currency}
      </>
    )
  }

  return (
    <div className={cn('flex flex-row flex-grow-0 gap-1 flex-wrap justify-end', className)}>
      {styledPrimaryValue && (
        <div className="flex flex-row gap-1 items-center">
          {styledPrimaryValue}
          <Image
            width={iconRect?.width || 20}
            height={iconRect?.height || 20}
            className="min-w-5"
            src={divineIcon}
            alt="d"
          />
        </div>
      )}
      <div className="flex flex-row gap-1 items-center">
        {styledValue}
        <Image
          width={iconRect?.width || 20}
          height={iconRect?.height || 20}
          className="min-w-5"
          src={typeof icon === 'string' ? icon : ''}
          alt="c"
        />
      </div>
    </div>

    // return (
    //   <div className={cn('flex flex-row flex-grow-0 gap-1', className)}>
    //     {styledPrimaryValue && (
    //       <div style={{ grid: `1fr / 1fr ${iconHeight}rem` }} className="grid gap-1 items-center">
    //         {styledPrimaryValue}
    //         <Image width={20} height={20} className="min-w-5" src={divineIcon} alt="d" />
    //       </div>
    //     )}
    //     <div style={{ grid: `1fr / 1fr ${iconHeight}rem` }} className="grid gap-1 items-center">
    //       {styledValue}
    //       <Image
    //         width={20}
    //         height={20}
    //         className="min-w-5"
    //         src={typeof icon === 'string' ? icon : ''}
    //         alt="c"
    //       />
    //     </div>
    //   </div>
  )
}

interface CurrencyDisplayWithTooltipProps extends Omit<CurrencyDisplayProps, 'divinePrice'> {
  className?: string
}

const CurrencyDisplayWithTooltip: React.FC<CurrencyDisplayWithTooltipProps> = ({
  className,
  value,
  valueShort = true,
  toCurrency = 'both',
  splitIcons = true,
  showIcon = true,
  showChange = false,
  iconRect
}) => {
  const divinePrice = useAtomValue(currentDivinePriceAtom)

  const format = useMemo(
    () => formatValue(value, toCurrency, divinePrice, splitIcons, showChange, valueShort),
    [value, toCurrency, divinePrice, splitIcons, showChange, valueShort]
  )

  if (toCurrency === 'chaos' || format.currency === 'c') {
    return (
      <div className="text-right">
        <CurrencyDisplay
          format={format}
          showChange={showChange}
          showIcon={showIcon}
          iconRect={iconRect}
        />
      </div>
    )
  }

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          <div className={className}>
            {
              <CurrencyDisplay
                format={format}
                showChange={showChange}
                showIcon={showIcon}
                iconRect={iconRect}
              />
            }
          </div>
        </TooltipTrigger>
        <TooltipContent className="space-y-1">
          <Label>OTHER CALCULATIONS</Label>
          <Separator orientation="horizontal" />
          <div className="flex flex-row flex-grow-0 gap-1 justify-end">
            <div className="flex flex-row gap-1 items-center">
              1
              <Image width={20} height={20} className="min-w-5" src={divineIcon} alt="d" />
            </div>
            <div className="flex flex-row gap-1 items-center">
              {'= '}
              {divinePrice}
              <Image width={20} height={20} className="min-w-5" src={chaosIcon} alt="c" />
            </div>
          </div>
          {/* <div className="flex flex-row flex-grow-0 gap-1 justify-end">
            <div style={{ grid: `1fr / 1fr 1.25rem` }} className="grid gap-1 items-center">
              1
              <Image width={20} height={20} className="min-w-5" src={divineIcon} alt="d" />
            </div>
            <div style={{ grid: `1fr / 1fr 1.25rem` }} className="grid gap-1 items-center">
              {'= '}
              {divinePrice}
              <Image width={20} height={20} className="min-w-5" src={chaosIcon} alt="c" />
            </div>
          </div> */}
          <Separator orientation="horizontal" />
          <CurrencyDisplay
            value={value}
            toCurrency={'chaos'}
            divinePrice={divinePrice}
            splitIcons={false}
            valueShort={false}
            showChange={showChange}
            showIcon={showIcon}
            className={'justify-end'}
          />
          <CurrencyDisplay
            value={value}
            toCurrency={'both'}
            divinePrice={divinePrice}
            splitIcons={false}
            valueShort={false}
            showChange={showChange}
            showIcon={showIcon}
            className={'justify-end'}
          />
          <CurrencyDisplay
            value={value}
            toCurrency={'both'}
            divinePrice={divinePrice}
            splitIcons
            valueShort={false}
            showChange={showChange}
            showIcon={showIcon}
            className={'justify-end'}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CurrencyDisplayWithTooltip
