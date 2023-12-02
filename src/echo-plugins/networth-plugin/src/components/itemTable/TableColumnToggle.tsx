'use client'

// import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { ChevronDown } from 'lucide-react'
import { Table } from '@tanstack/react-table'

import { DropdownMenu, Button } from 'echo-common/components-v1'

interface TableViewOptionsProps<TData> {
  table: Table<TData>
}

export function TableViewOptions<TData>({ table }: TableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <ChevronDown className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-[150px]">
        <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
        <DropdownMenu.Separator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenu.CheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenu.CheckboxItem>
            )
          })}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
