import { Input, InputProps } from '@/components/ui/input'
import React, { useRef } from 'react'

type DebouncedInputProps = Omit<InputProps, 'onChange' | 'onBlur'> & {
  value: string | number
  onChange: (value: string | number) => void
  onBlur: (value: string | number) => void
  onInnerChange?: (event: React.ChangeEvent<HTMLInputElement>) => string | number
  debounce?: number
  startIcon?: React.ReactNode
}

// A debounced input react component
const DebouncedInput = ({
  value: initialValue,
  onChange,
  onBlur,
  onInnerChange,
  debounce = 250,
  startIcon,
  ...props
}: DebouncedInputProps) => {
  const [value, setValue] = React.useState(initialValue)
  const isMountedCount = useRef(0)

  const timeoutRef = useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    if (isMountedCount.current >= 2) {
      timeoutRef.current = setTimeout(() => {
        onChange(value)
      }, debounce)

      return () => clearTimeout(timeoutRef.current)
    } else {
      isMountedCount.current += 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (startIcon) {
    return (
      <div className="relative flex items-center">
        {startIcon && <div className="absolute left-0">{startIcon}</div>}
        <Input
          {...props}
          value={value}
          onChange={(e) => (onInnerChange ? setValue(onInnerChange(e)) : setValue(e.target.value))}
          onBlur={(e) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (onInnerChange) {
              onBlur(onInnerChange(e))
            } else {
              onBlur(e.target.value)
            }
          }}
        />
      </div>
    )
  }
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => (onInnerChange ? setValue(onInnerChange(e)) : setValue(e.target.value))}
      onBlur={(e) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (onInnerChange) {
          onBlur(onInnerChange(e))
        } else {
          onBlur(e.target.value)
        }
      }}
    />
  )
}

export default DebouncedInput
