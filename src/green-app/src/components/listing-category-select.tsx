import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { LISTING_CATEGORIES, ListingCategory } from '@/lib/listing-categories'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ComboboxItem, ComboboxTrigger } from './ui/combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type OnSelectProps = {
  className?: string
  selectableCategories?: ListingCategory[]
  category: string | null
  control: 'select' | 'combobox'
  onCategorySelect: (category: string | null) => void
}

export function ListingCategorySelect({
  className,
  selectableCategories,
  category,
  control,
  onCategorySelect
}: OnSelectProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const categories = useMemo(() => {
    const categories = Object.values(LISTING_CATEGORIES)
      .map((category) => {
        return {
          selectable:
            !selectableCategories || selectableCategories?.some((c) => c.name === category.name),
          ...category
        }
      })
      .sort((a, b) => {
        if (a.selectable && b.selectable) return a.name.localeCompare(b.name)
        if (!a.selectable && !b.selectable) return a.name.localeCompare(b.name)
        if (a.selectable && !b.selectable) return -1
        return 1
      })
    categories.unshift({
      name: '...',
      tags: [],
      icon: '',
      selectable: true
    })
    return categories
  }, [selectableCategories])

  const categoryItem = useMemo(() => {
    return LISTING_CATEGORIES.find((c) => c.name === category)
  }, [category])

  return (
    <div className="max-w-48 w-full">
      {control === 'select' ? (
        <Select
          value={category ?? ''}
          onValueChange={(value) => onCategorySelect(value !== '...' ? value : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className={cn(className)}>
            {categories?.map((c) => (
              <SelectItem key={c.name} value={c.name} disabled={!c.selectable}>
                {c.name === '...' ? (
                  <div>{c.name}</div>
                ) : (
                  <div className="flex flex-row gap-2">
                    <Image className="min-w-5" width={20} height={20} src={c.icon} alt={c.name} />
                    <div className="capitalize">{c.name}</div>
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <ComboboxTrigger>
              {category ? (
                <div className="flex flex-row gap-2">
                  {categoryItem && (
                    <Image
                      className="min-w-5"
                      width={20}
                      height={20}
                      src={categoryItem.icon}
                      alt={categoryItem.name}
                    />
                  )}
                  <div className="capitalize truncate">{`${category}`}</div>
                </div>
              ) : (
                <>Select a category</>
              )}
            </ComboboxTrigger>
          </PopoverTrigger>
          <PopoverContent className="p-0 max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)] overflow-hidden">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup className="max-h-[calc(var(--radix-popover-content-available-height)-7rem)] overflow-y-auto">
                {categories?.map((c) => (
                  <ComboboxItem
                    key={c.name}
                    value={c.name}
                    disabled={!c.selectable}
                    onSelect={(value) => {
                      setPopoverOpen(false)
                      onCategorySelect(value !== '...' ? value : null)
                    }}
                    selected={c.name === category}
                  >
                    {c.name === '...' ? (
                      <div>{c.name}</div>
                    ) : (
                      <div className="flex flex-row gap-2">
                        <Image
                          className="min-w-5"
                          width={20}
                          height={20}
                          src={c.icon}
                          alt={c.name}
                        />
                        <div className="capitalize truncate">{c.name}</div>
                      </div>
                    )}
                  </ComboboxItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
