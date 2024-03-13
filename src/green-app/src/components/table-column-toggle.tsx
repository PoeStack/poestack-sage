// import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { ChevronDown, ChevronDownIcon, ChevronUpIcon, ListRestartIcon } from 'lucide-react'
import { Column, ColumnDef, ColumnOrderState, VisibilityState } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { useMemo } from 'react'
import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface TableColumnToggleProps<TData> {
  columns: ColumnDef<TData>[]
  columnVisibility: VisibilityState
  columnOrder: ColumnOrderState
  onColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
  onColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>
  resetTable: () => void
}

function TableColumnToggle<TData>({
  columns,
  columnVisibility,
  columnOrder,
  onColumnVisibility,
  onColumnOrder,
  resetTable
}: TableColumnToggleProps<TData>) {
  // const { t } = useTranslation()

  const columnsValid = useMemo(() => columns.every((c) => c.id), [columns])
  const sortedColumns = useMemo(() => {
    if (columnOrder.length > 0) {
      const sortedColumns = columnOrder.map((co) => columns.find((c) => c.id === co))
      if (sortedColumns.every((c) => c)) {
        return sortedColumns as ColumnDef<TData>[]
      }
      return columns
    }
    return columns
  }, [columnOrder, columns])

  if (!columnsValid) return null

  const handleColumnOrderChange = (columnId: string, up: boolean) => {
    const columnList = columnOrder.length > 0 ? [...columnOrder] : columns.map((c) => c.id!)
    if (columnList.length < 2) return
    const prevIdx = columnList.indexOf(columnId)
    if (prevIdx === -1) return
    const nextIdx = up ? prevIdx + 1 : prevIdx - 1
    if (!columnList[nextIdx]) return

    const temp = columnList[nextIdx]
    columnList[nextIdx] = columnList[prevIdx]
    columnList[prevIdx] = temp

    onColumnOrder(columnList)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <ChevronDown className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex justify-between items-center py-0 pr-0">
          Column settings
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={resetTable}>
                  <ListRestartIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortedColumns.map((column, i) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="flex justify-between capitalize gap-2 py-0 focus:bg-accent/50"
              checked={columnVisibility[column.id!] ?? true}
              onCheckedChange={(value) => {
                onColumnVisibility((state) => ({ ...state, [column.id!]: !!value }))
              }}
            >
              <span className="truncate">{column.meta?.headerWording}</span>
              <div className="flex flex-row gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={i === 0}
                  onClick={(e) => {
                    e.preventDefault()
                    handleColumnOrderChange(column.id!, false)
                  }}
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={sortedColumns.length - 1 === i}
                  onClick={(e) => {
                    e.preventDefault()
                    handleColumnOrderChange(column.id!, true)
                  }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              </div>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableColumnToggle
