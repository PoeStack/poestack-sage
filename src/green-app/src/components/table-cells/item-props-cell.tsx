import { useMemo } from 'react'
import { Badge } from '../ui/badge'

type ItemPropsCellProps = {
  value: string
}

export const ItemPropsCell = ({ value }: ItemPropsCellProps) => {
  const hashProps = useMemo(() => {
    if (!value) return []
    return value.split(';;;').map((v) => {
      const keyVal = v.split(';;')
      return { name: keyVal[0], value: keyVal[1] }
    })
  }, [value])

  return (
    <div
      className="space-x-1 truncate hover:overflow-x-auto hover:text-clip no-scrollbar"
      onMouseLeave={(e) => (e.currentTarget.scrollLeft = 0)}
    >
      {hashProps.map(({ name, value }) => (
        <Badge key={name} variant="secondary" className="capitalize">
          {value}
        </Badge>
      ))}
    </div>
  )
}
