import { CurrencySwitch } from '@/lib/currency'
import CurrencyDisplay from '../currency-display'

type ItemValueCellProps = {
  value: number | string
  editable?: boolean
  showChange?: boolean
  toCurrency?: CurrencySwitch
}

export const ItemValueCell = ({ value, showChange, toCurrency }: ItemValueCellProps) => {
  return (
    <div className="float-end">
      {typeof value === 'number' ? (
        <CurrencyDisplay
          value={value}
          showChange={showChange}
          toCurrency={toCurrency}
          splitIcons={false}
        />
      ) : (
        value
      )}
    </div>
  )
}
