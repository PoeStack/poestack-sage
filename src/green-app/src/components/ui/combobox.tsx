import React from 'react'
import { CommandItem } from './command'
import { cn } from '@/lib/utils'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { Slot } from '@radix-ui/react-slot'
import { Button } from './button'

export interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className
        )}
        {...props}
      >
        <span style={{ pointerEvents: 'none' }}>{children}</span>
        <CaretSortIcon className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
ComboboxTrigger.displayName = 'ComboboxTrigger'

interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandItem> {
  selected?: boolean
  disableSelection?: boolean
}

const ComboboxItem = React.forwardRef<React.ElementRef<typeof CommandItem>, CommandItemProps>(
  ({ className, selected, disableSelection, children, ...props }, ref) => {
    return (
      <CommandItem
        ref={ref}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          disableSelection ? 'pr-2' : 'pr-8',
          className
        )}
        aria-disabled={props.disabled === true ? true : undefined}
        data-disabled={props.disabled === true ? true : undefined}
        aria-selected={selected}
        data-state={selected ? 'checked' : 'unchecked'}
        {...props}
      >
        {!disableSelection && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            {selected && (
              <span>
                <CheckIcon className="h-4 w-4" />
              </span>
            )}
          </span>
        )}
        <span className="w-full">{children}</span>
      </CommandItem>
    )
  }
)
ComboboxItem.displayName = 'ComboboxItem'

export { ComboboxTrigger, ComboboxItem }
