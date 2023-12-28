import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Table } from '@tanstack/react-table'

import { Select, Button } from 'echo-common/components-v1'
import { useTranslation } from 'react-i18next'
import React from 'react'

interface TablePaginationProps<TData> {
  table: Table<TData>
  showSelected?: boolean
}

export function TablePagination<TData>({ table, showSelected }: TablePaginationProps<TData>) {
  const { t } = useTranslation()

  // on delete key press, remove last selected item
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.nodeName !== 'BODY') return
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
  }, [table])

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {showSelected ? (
        <div className="flex-1 text-sm text-muted-foreground">
          {t('body.rowsSelected', {
            current: table.getFilteredSelectedRowModel().rows.length,
            of: table.getFilteredRowModel().rows.length
          })}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t('label.pageRows')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <Select.Trigger className="h-8 w-[70px]">
              <Select.Value placeholder={table.getState().pagination.pageSize} />
            </Select.Trigger>
            <Select.Content side="top">
              {[10, 25, 50, 75, 100].map((pageSize) => (
                <Select.Item key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('body.pageOf', {
            current: table.getState().pagination.pageIndex + 1,
            of: table.getPageCount()
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('action.firstPage')}</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('action.prevPage')}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('action.nextPage')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('action.lastpage')}</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
