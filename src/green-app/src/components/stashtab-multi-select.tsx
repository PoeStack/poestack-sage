import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { IStashTab } from '@/types/echo-api/stash'
import { useTranslation } from 'react-i18next'

export type OptionType = IStashTab

interface MultiSelectProps {
  options: IStashTab[]
  selected: IStashTab[]
  onChange: (stashes: IStashTab[]) => void
  className?: string
  placeholder?: string
}

const StashTabMultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, className, ...props }, ref) => {
    const { t } = useTranslation()
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (item: IStashTab) => {
      onChange(selected.filter((i) => i.id !== item.id))
    }

    // on delete key press, remove last selected item
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (open && e.key === 'Backspace' && selected.length > 0) {
          onChange(selected.filter((_, index) => index !== selected.length - 1))
        }

        // close on escape
        if (e.key === 'Escape') {
          setOpen(false)
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [onChange, open, selected])

    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild className={className}>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`group w-full justify-between ${selected.length > 1 ? 'h-fit' : 'h-10'}`}
          >
            <div className="flex flex-wrap items-center gap-1">
              {selected.map((item) => (
                <Badge
                  variant="outline"
                  key={item.id}
                  className="flex items-center gap-1 group-hover:bg-inherit"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(item)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnselect(item)
                  }}
                >
                  {item.name}
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </Badge>
              ))}
              {selected.length === 0 && <span>{props.placeholder ?? 'Select...'}</span>}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command className={className}>
            <CommandInput placeholder={t('label.searchPh')} />
            <CommandEmpty>{t('label.noResults')}</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.some((item) => item.id === option.id)
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => {
                        onChange(
                          isSelected
                            ? selected.filter((item) => item.id !== option.id)
                            : [...selected, option]
                        )
                        setOpen(true)
                      }}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      {option.name}
                      <span className="hidden">{option.id}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

StashTabMultiSelect.displayName = 'StashTabMultiSelect'

export { StashTabMultiSelect }
