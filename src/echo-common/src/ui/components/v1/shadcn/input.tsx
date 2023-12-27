import * as React from 'react'

import { cn } from '../../../lib/utils'
import { useRect } from '../hooks/use-rect'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const InputWithIcons = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null)
    const outerRef = React.useRef<HTMLDivElement | null>(null)
    const innerBoundry = useRect(innerRef)
    const outerBoundry = useRect(outerRef)

    const input = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          startIcon && 'pl-10',
          endIcon && 'pr-10',
          className
        )}
        ref={(el) => {
          if (ref) {
            typeof ref === 'function' ? ref(el) : (ref.current = el)
          }
          innerRef.current = el
        }}
        {...props}
      />
    )

    if (startIcon || endIcon) {
      return (
        <div className={cn('relative flex items-center')} ref={outerRef}>
          {startIcon && <div className="absolute left-0">{startIcon}</div>}
          {input}
          {endIcon && (
            <div style={{ right: outerBoundry.width - innerBoundry.width }} className="absolute">
              {endIcon}
            </div>
          )}
        </div>
      )
    }

    return input
  }
)
InputWithIcons.displayName = 'InputWithIcons'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <InputWithIcons
          className={className}
          type={type}
          startIcon={startIcon}
          endIcon={endIcon}
          {...props}
        />
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          startIcon && 'pl-10',
          endIcon && 'pr-10',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
