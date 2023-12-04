'use client'

// import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { ChevronDown } from 'lucide-react'
import { Table } from '@tanstack/react-table'

import { DropdownMenu, Button } from 'echo-common/components-v1'
import { observer } from 'mobx-react'
import { useStore } from '../../hooks/useStore'

interface TableColumnToggleProps<TData> {
  table: Table<TData>
}

function TableColumnToggle<TData>({ table }: TableColumnToggleProps<TData>) {
  const { accountStore } = useStore()
  const tableState = accountStore.activeAccount.networthTableView

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <ChevronDown className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-[150px]">
        <DropdownMenu.Label>Settings</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem
          checked={tableState.showPricedItems}
          onCheckedChange={(value) => tableState.setShowPricedItems(!!value)}
        >
          Show Priced
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          checked={tableState.showUnpricedItems}
          onCheckedChange={(value) => tableState.setShowUnpricedItems(!!value)}
        >
          Show Unpriced
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
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

export default observer(TableColumnToggle)
