import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { LISTING_CATEGORIES, ListingCategory, ListingSubCategory } from '@/lib/listing-categories'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ComboboxItem, ComboboxTrigger } from './ui/combobox'
import { Command, CommandEmpty, CommandGroup, CommandInput } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type SelectableCategory = ListingSubCategory & {
  selectable: boolean
}

type OnSelectProps = {
  className?: string
  selectableCategories?: ListingCategory[]
  selectableSubCategories?: ListingSubCategory[]
  category: string | null
  subCategory: string | null
  isSubCategory: boolean
  control: 'select' | 'combobox'
  onCategorySelect: (category: string | null) => void
  onSubCategorySelect: (category: string | null) => void
}

export function ListingCategorySelect({
  className,
  selectableCategories,
  selectableSubCategories,
  isSubCategory,
  category,
  subCategory,
  control,
  onCategorySelect,
  onSubCategorySelect
}: OnSelectProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const categoryItem = useMemo(() => {
    return LISTING_CATEGORIES.find((c) => c.name === category)
  }, [category])

  const categories = useMemo(() => {
    let extSelectableCategories: SelectableCategory[] = []
    if (isSubCategory) {
      if (categoryItem) {
        extSelectableCategories = categoryItem.subCategories
          .map((subCat) => {
            return {
              selectable:
                !selectableSubCategories ||
                selectableSubCategories?.some((selsubCat) => selsubCat.name === subCat.name),
              ...subCat
            }
          })
          .sort((a, b) => {
            if (a.selectable && b.selectable) return a.name.localeCompare(b.name)
            if (!a.selectable && !b.selectable) return a.name.localeCompare(b.name)
            if (a.selectable && !b.selectable) return -1
            return 1
          })
      }
    } else {
      extSelectableCategories = LISTING_CATEGORIES.map((category) => {
        return {
          selectable:
            !selectableCategories || selectableCategories?.some((c) => c.name === category.name),
          ...category
        }
      }).sort((a, b) => {
        if (a.selectable && b.selectable) return a.name.localeCompare(b.name)
        if (!a.selectable && !b.selectable) return a.name.localeCompare(b.name)
        if (a.selectable && !b.selectable) return -1
        return 1
      })
    }
    extSelectableCategories.unshift({
      name: '...',
      tags: [],
      icon: '',
      selectable: true
    })
    return extSelectableCategories
  }, [isSubCategory, categoryItem, selectableCategories, selectableSubCategories])

  const selectedCategory = isSubCategory ? subCategory : category
  const selectedCategoryItem = useMemo(() => {
    return isSubCategory
      ? categoryItem?.subCategories.find((c) => c.name === subCategory)
      : categoryItem
  }, [categoryItem, isSubCategory, subCategory])

  const handleCategorySelect = (value: string | null) => {
    if (isSubCategory ? value === subCategory : value === category) return
    if (isSubCategory) {
      onSubCategorySelect(value)
    } else {
      onCategorySelect(value)
      onSubCategorySelect(null)
    }
  }

  if (isSubCategory && categories.length === 1) {
    return null
  }

  return (
    <div className="max-w-48 w-full">
      {control === 'select' ? (
        <Select
          value={selectedCategory ?? ''}
          onValueChange={(value) => handleCategorySelect(value !== '...' ? value : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isSubCategory ? 'Select subcategory' : 'Select category'} />
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
              {selectedCategory ? (
                <div className="flex flex-row gap-2">
                  {selectedCategoryItem && (
                    <Image
                      className="min-w-5"
                      width={20}
                      height={20}
                      src={selectedCategoryItem.icon}
                      alt={selectedCategoryItem.name}
                    />
                  )}
                  <div className="capitalize truncate">{`${selectedCategory}`}</div>
                </div>
              ) : (
                <>{isSubCategory ? 'Select subcategory' : 'Select category'}</>
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
                      handleCategorySelect(value !== '...' ? value : null)
                    }}
                    selected={c.name === selectedCategory}
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
