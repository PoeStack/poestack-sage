import { listCharacters } from '@/lib/http-util'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { currentUserAtom } from './providers'
import { memo, useEffect, useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command'
import { PoeCharacter } from '@/types/poe-api-models'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { RefreshCwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type CharacterSelectProps = {
  selectedLeague: string | null
  onIgnSelect: (ign: string | null) => void
}

const CharacterSelect = ({ selectedLeague, onIgnSelect }: CharacterSelectProps) => {
  const currentUser = useAtomValue(currentUserAtom)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<PoeCharacter>()

  const [dataCounter, setDataCounter] = useState(0)
  const {
    data: characters,
    isFetching: isCharactersFetching,
    refetch: refetchCharacters
  } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      const data = await listCharacters()
      // We want to reset the character but the query data is stable if the http request data is the same
      setDataCounter((prev) => prev + 1)
      // data.forEach((x) => (x.current = false))
      // data[Math.trunc(Math.random() * data.length)].current = true
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser?.profile?.uuid && !!selectedLeague
  })

  const selectableCharacters = useMemo(() => {
    return characters?.filter((char) => selectedLeague === char.league.toLowerCase())
  }, [selectedLeague, characters])

  useEffect(() => {
    const defaultCharacter =
      selectableCharacters?.find((x) => x.current) || selectableCharacters?.[0]
    setSelectedCharacter(defaultCharacter)
    onIgnSelect(defaultCharacter?.name || null)
  }, [selectableCharacters, dataCounter, onIgnSelect])

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="flex justify-between w-full"
          disabled={!currentUser?.profile?.uuid}
        >
          {selectedCharacter ? (
            <>
              <div className="truncate">{`${selectedCharacter.name}`}</div>
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          ) : (
            <>
              <div>Select ...</div>
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 max-h-[var(--radix-popover-content-available-height)] w-full min-w-[var(--radix-popover-trigger-width)] overflow-hidden">
        <Command
          filter={(id, search) => {
            const found = selectableCharacters?.some((char) => {
              if (char.id !== id) return false
              const lcSearch = search.toLowerCase()
              const isNumber = !Number.isNaN(parseFloat(search))
              return (
                char.name.toLowerCase().includes(lcSearch) ||
                char.class.toLowerCase().includes(lcSearch) ||
                char.league.toLowerCase().includes(lcSearch) ||
                (isNumber && char.level === parseFloat(search))
              )
            })
            return found ? 1 : 0
          }}
        >
          <div className="flex flex-row gap-1 relative">
            <CommandInput className="pr-8" placeholder="Search..." />
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-none rounded-tr absolute right-0 shrink-0"
              onClick={() => {
                refetchCharacters()
              }}
              disabled={isCharactersFetching}
            >
              <RefreshCwIcon
                className={cn(isCharactersFetching && 'animate-spin', 'w-4 h-w shrink-0')}
              />
            </Button>
          </div>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup className="max-h-[calc(var(--radix-popover-content-available-height)-7rem)] overflow-y-auto">
            {selectableCharacters?.map((c) => (
              <CommandItem
                key={c.id}
                value={c.id}
                onSelect={(id) => {
                  const selectedCharacter = selectableCharacters.find((s) => s.id === id)
                  setSelectedCharacter(selectedCharacter)
                  onIgnSelect(selectedCharacter?.name || null)
                  setPopoverOpen(false)
                }}
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{c.name}</div>
                  <div className="flex flex-row gap-2 uppercase justify-between">
                    <div>{`Level ${c.level} ${c.class}`}</div>
                    <div>{`${c.league} League`}</div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default memo(CharacterSelect)
