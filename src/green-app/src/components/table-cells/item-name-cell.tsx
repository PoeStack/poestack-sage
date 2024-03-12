type ItemNameCellProps = {
  value: string
}

export const ItemNameCell = ({ value }: ItemNameCellProps) => {
  return (
    <div
      className={`truncate hover:overflow-x-auto hover:text-clip no-scrollbar capitalize self-center`}
      onMouseOut={(e) => {
        e.currentTarget.scrollLeft = 0
      }}
    >
      {value}
    </div>
  )
}
