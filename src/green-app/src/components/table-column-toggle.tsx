// import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { ColumnDef, ColumnOrderState, VisibilityState } from '@tanstack/react-table'
import { ChevronDown, ChevronDownIcon, ChevronUpIcon, ListRestartIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const columnsValid = useMemo(() => columns.every((c) => c.id), [columns])
  const sortedColumns = useMemo(() => {
    if (columnOrder.length > 0) {
      const clonedColumns = [...columns]
      const sortedColumns = columnOrder.map((co) => {
        const idx = clonedColumns.findIndex((c) => c.id === co)
        if (idx > -1) {
          return clonedColumns.splice(idx, 1)[0]
        }
      })
      sortedColumns.push(...clonedColumns)

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <ChevronDown className="mr-2 h-4 w-4" />
          {t('action.view')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex justify-between items-center py-0 pr-0">
          {t('label.columnSettings')}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    resetTable()
                    setOpen(false)
                  }}
                >
                  <ListRestartIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('label.columnSettingsResetTT')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortedColumns.map((column, i) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="flex justify-between capitalize gap-2 pr-0 py-0 focus:bg-accent/50"
              checked={columnVisibility[column.id!] ?? true}
              onCheckedChange={(value) => {
                onColumnVisibility((state) => ({ ...state, [column.id!]: !!value }))
              }}
            >
              <span className="truncate">
                {t(`columnTitle.${column.meta?.headerWording}` as any)}
              </span>
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
