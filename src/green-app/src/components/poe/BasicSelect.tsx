import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type BasicSelectProps<TData, TValue> = {
  options: TData[] | ReactNode
  onSelect: (select: TValue) => void
  defaultOption?: string | undefined
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  value?: string
  itemClassName?: string
}

export function BasicSelect<TData, TValue>({
  open,
  value,
  onSelect,
  options,
  defaultOption,
  defaultOpen,
  onOpenChange,
  itemClassName
}: BasicSelectProps<TData, TValue>) {
  return (
    <Select
      open={open}
      onValueChange={(value) => onSelect(value as unknown as any)}
      defaultValue={defaultOption}
      value={value}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {Array.isArray(options) ? (
          options.map((c) => (
            <SelectItem key={`${c}`} value={`${c}`}>
              <div className={cn(itemClassName, 'flex flex-row gap-2')}>
                <div>{`${c}`}</div>
              </div>
            </SelectItem>
          ))
        ) : (
          <>{options}</>
        )}
      </SelectContent>
    </Select>
  )
}
