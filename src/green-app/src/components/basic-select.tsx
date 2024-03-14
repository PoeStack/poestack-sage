import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type BasicSelectProps<TData extends { value: string; t: string } | string, TValue> = {
  options: TData[] | ReactNode
  onSelect: (select: TValue) => void
  defaultOption?: string | undefined
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  value?: string
  itemClassName?: string
  translate?: boolean
}

export function BasicSelect<TData extends { value: string; t: string } | string, TValue>({
  open,
  value,
  onSelect,
  options,
  defaultOption,
  defaultOpen,
  onOpenChange,
  itemClassName,
  translate
}: BasicSelectProps<TData, TValue>) {
  const { t } = useTranslation()
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
        <SelectValue placeholder={t('label.searchPh')} />
      </SelectTrigger>
      <SelectContent>
        {Array.isArray(options) ? (
          options.map((c) => {
            const value = typeof c === 'object' ? c.value : c
            const tValue = typeof c === 'object' || translate ? t(`option.${c}` as any) : c
            return (
              <SelectItem key={`${value}`} value={`${value}`}>
                <div className={cn(itemClassName, 'flex flex-row gap-2')}>
                  <div>{tValue}</div>
                </div>
              </SelectItem>
            )
          })
        ) : (
          <>{options}</>
        )}
      </SelectContent>
    </Select>
  )
}
