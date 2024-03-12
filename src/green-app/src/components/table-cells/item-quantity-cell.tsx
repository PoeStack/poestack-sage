import { cn } from '@/lib/utils'

type ItemQuantityCellProps = {
  quantity: number
  diff?: boolean
}

export const ItemQuantityCell = ({ quantity, diff }: ItemQuantityCellProps) => {
  return (
    <div
      className={cn(
        'text-right',
        diff && 'font-semibold',
        diff && quantity > 0 && `text-green-400`,
        diff && quantity < 0 && `text-red-400`
      )}
    >
      {diff && quantity > 0 ? '+ ' : ''}
      {quantity}
    </div>
  )
}
