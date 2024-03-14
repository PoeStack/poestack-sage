import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface TablePaginationProps<TData> {
  className?: string
  table: Table<TData>
  showSelected?: boolean
  pageSizes?: number[]
  enableHotkeyNavigation?: boolean
}

export function TablePagination<TData>({
  className,
  table,
  showSelected,
  pageSizes,
  enableHotkeyNavigation
}: TablePaginationProps<TData>) {
  const { t } = useTranslation()
  // on delete key press, remove last selected item
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !enableHotkeyNavigation ||
        (document.activeElement && document.activeElement.nodeName === 'INPUT')
      )
        return
      if (e.key === 'ArrowLeft' && table.getCanPreviousPage()) {
        table.previousPage()
      } else if (e.key === 'ArrowRight' && table.getCanNextPage()) {
        table.nextPage()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableHotkeyNavigation, table])

  return (
    <div className={cn('flex items-center justify-between px-2 pt-4', className)}>
      {showSelected ? (
        <div className="flex-1 text-sm text-muted-foreground">
          {t('label.rowsSelectedOf', {
            current: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length
          })}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t('label.rowsPerPage')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {(pageSizes || [10, 25, 50, 75, 100]).map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('label.pageOf', {
            current: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount()
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('label.firstPage')}</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('label.prevPage')}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('label.nextPage')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('label.lastPage')}</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
