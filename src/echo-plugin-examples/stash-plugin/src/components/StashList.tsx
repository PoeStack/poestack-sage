import { Button, Command, Popover } from 'echo-common/components-v1'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { context } from '../context'
import { useState } from 'react'
import { cn } from 'echo-common'
import { PoePartialStashTab } from 'sage-common'

type StashListProps = {
  league: string
  selectedStash: PoePartialStashTab | undefined
  onStashSelect: (stash: PoePartialStashTab) => void
}

export function StashList({ league, selectedStash, onStashSelect }: StashListProps) {
  const [stashListOpen, setStashListOpen] = useState(false)
  const stashes = context().poeStash.useStashes(league).value ?? []
  return (
    <Popover open={stashListOpen} onOpenChange={setStashListOpen}>
      <Popover.Trigger asChild>
        {stashes.length > 0 ? (
          <Button
            className="w-full justify-between"
            variant="outline"
            role="combobox"
            aria-expanded={stashListOpen}
          >
            {selectedStash
              ? stashes.find((stashes) => stashes.id === selectedStash.id)?.name
              : 'Select stash tab...'}
            <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        ) : (
          <Button
            disabled
            className="w-full justify-between"
            variant="outline"
            role="combobox"
            aria-expanded={stashListOpen}
          >
            No stash tabs for league
            <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </Popover.Trigger>
      <Popover.Content className="w-[250px] p-0">
        {stashes.length > 0 && (
          <Command>
            <Command.Input placeholder="Search stash tab..." />
            <Command.Empty>No stash tabs found.</Command.Empty>
            <Command.List>
              <Command.Group>
                {stashes.map((stashOption) => (
                  <Command.Item
                    key={`${stashOption.name}-${stashOption.id}`}
                    value={`${stashOption.name}-${stashOption.id}`}
                    onSelect={() => {
                      onStashSelect(stashOption)
                      setStashListOpen(false)
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedStash?.id === stashOption.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {stashOption.name}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        )}
      </Popover.Content>
    </Popover>
  )
}
