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
import { useMemo } from 'react'

type OnSelectProps = {
  className?: string
  selectableCategories?: ListingCategory[]
  category: string | null
  onCategorySelect: (category: string | null) => void
}

export function ListingCategorySelect({
  className,
  selectableCategories,
  category,
  onCategorySelect
}: OnSelectProps) {
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

  return (
    <div className="max-w-48 w-full">
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
    </div>
  )
}
