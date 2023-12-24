import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from 'echo-common'
import { Badge, Button, Command, Form, Popover } from 'echo-common/components-v1'
import { StashTab } from '../../store/domains/stashtab'
import { useTranslation } from 'react-i18next'

export type OptionType = StashTab

interface MultiSelectProps {
  options: StashTab[]
  selected: StashTab[]
  onChange: React.Dispatch<React.SetStateAction<StashTab[]>>
  className?: string
  placeholder?: string
}

const StashTabMultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, className, ...props }, ref) => {
    const { t } = useTranslation()
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (item: StashTab) => {
      onChange(selected.filter((i) => i.hash !== item.hash))
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
        <Form.Control>
          <Popover.Trigger asChild className={className}>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`group w-full justify-between ${selected.length > 1 ? 'h-full' : 'h-10'}`}
            >
              <div className="flex flex-wrap items-center gap-1">
                {selected.map((item) => (
                  <Badge
                    variant="outline"
                    key={item.hash}
                    className="flex items-center gap-1 group-hover:bg-background"
                    onClick={() => handleUnselect(item)}
                  >
                    {item.name}
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="border-none"
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
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </Badge>
                ))}
                {selected.length === 0 && (
                  <span>{props.placeholder ?? t('label.selectPlaceholder')}</span>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </Popover.Trigger>
        </Form.Control>
        <Popover.Content className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command className={className}>
            <Command.Input placeholder={t('label.searchPlaceholder')} />
            <Command.Empty>No item found.</Command.Empty>
            <Command.List>
              <Command.Group>
                {options.map((option) => {
                  const isSelected = selected.some((item) => item.hash === option.hash)
                  return (
                    <Command.Item
                      key={option.hash}
                      onSelect={() => {
                        onChange(
                          isSelected
                            ? selected.filter((item) => item.hash !== option.hash)
                            : [...selected, option]
                        )
                        setOpen(true)
                      }}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      {option.name}
                      <span className="hidden">{option.hash}</span>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
    )
  }
)

StashTabMultiSelect.displayName = 'StashTabMultiSelect'

export { StashTabMultiSelect }
