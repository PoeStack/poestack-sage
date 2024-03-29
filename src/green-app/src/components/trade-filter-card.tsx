'use client'

import { listSummaries } from '@/lib/http-util'
import { CaretSortIcon } from '@radix-ui/react-icons'
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import { BasicSelect } from '@/components/poe/BasicSelect'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LISTING_CATEGORIES } from '@/lib/listing-categories'
import { cn } from '@/lib/utils'
import { SageListingItemType } from '@/types/sage-listing-type'
import { SquarePenIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useQueries } from '@tanstack/react-query'
import { SageItemGroupSummary, SageItemGroupSummaryShard } from '@/types/echo-api/item-group'

export type FilterOption = {
  hash: string
  key: string
  icon: string
  displayName: string
  unsafeHashProperties: {
    [key: string]: any
  }
}

export type ListingFilter = {
  option: FilterOption | null
  selected: boolean
  minimumQuantity: number | undefined
}

export type ListingFilterGroupModes = 'AND' | 'NOT' | 'COUNT'

export type ListingFilterGroup = {
  mode: ListingFilterGroupModes
  selected: boolean
  filters: ListingFilter[]
}

type ListingFilterCardProps = {
  className?: string
  category: string | null
  filterGroups: ListingFilterGroup[]
  onFilterGroupsChange: (filterGroups: ListingFilterGroup[]) => void
}

const ListingFilterCard = ({
  className,
  category,
  filterGroups,
  onFilterGroupsChange
}: ListingFilterCardProps) => {
  const [options, setOptions] = useState<FilterOption[]>([])
  const [summaries, setSummaries] = useState<Record<string, SageListingItemType['summary']>>({})
  const [addGroupPreviewOpen, setAddGroupPreviewOpen] = useState(false)

  const updateGroup = useMemo(() => {
    return filterGroups.map((_, i) => (group: ListingFilterGroup) => {
      const nextGroup = [...filterGroups]
      nextGroup[i] = group
      onFilterGroupsChange(nextGroup)
    })
  }, [filterGroups, onFilterGroupsChange])

  const removeGroup = useMemo(() => {
    return filterGroups.map((_, i) => () => {
      const nextGroup = [...filterGroups]
      nextGroup.splice(i, 1)
      onFilterGroupsChange(nextGroup)
    })
  }, [filterGroups, onFilterGroupsChange])

  function addGroup(mode: ListingFilterGroupModes) {
    onFilterGroupsChange([...filterGroups, { mode, filters: [], selected: true }])
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <MemorizedSummariesQueries
        category={category}
        setOptions={setOptions}
        setSummaries={setSummaries}
      />
      {filterGroups.map((group, i) => (
        <MemorizedListingFilterGroupCard
          key={i}
          options={options}
          summaries={summaries}
          group={group}
          onGroupChange={updateGroup[i]}
          removeGroup={removeGroup[i]}
        />
      ))}
      {!addGroupPreviewOpen ? (
        <Button className="self-end" variant="outline" onClick={() => setAddGroupPreviewOpen(true)}>
          Add Group
        </Button>
      ) : (
        <div className="self-end w-32">
          <BasicSelect
            options={['AND', 'NOT', 'COUNT'] as ListingFilterGroupModes[]}
            onSelect={(m) => {
              addGroup(m as ListingFilterGroupModes)
            }}
            open={addGroupPreviewOpen}
            onOpenChange={(open) => {
              setTimeout(() => setAddGroupPreviewOpen(open), 0)
            }}
          />
        </div>
      )}
    </div>
  )
}

type ListingFilterGroupCardProps = {
  options: FilterOption[]
  summaries: Record<string, SageListingItemType['summary']>
  group: ListingFilterGroup
  onGroupChange: (f: ListingFilterGroup) => void
  removeGroup: () => void
}

const ListingFilterGroupCard = ({
  options,
  summaries,
  group,
  onGroupChange,
  removeGroup
}: ListingFilterGroupCardProps) => {
  const [editMode, setEditMode] = useState(false)
  const [groupSelectOpen, setGroupSelectOpen] = useState(false)

  function toggleSelected() {
    onGroupChange({
      ...group,
      selected: !group.selected
    })
  }

  function setMode(mode: ListingFilterGroupModes) {
    onGroupChange({
      ...group,
      mode: mode
    })
  }

  const removeFilter = useCallback(
    (index: number) => {
      onGroupChange({
        ...group,
        filters: group.filters.filter((e, i) => i !== index)
      })
    },
    [group, onGroupChange]
  )

  const updateFilter = useCallback(
    (index: number, filter: ListingFilter) => {
      const nextFilters = [...group.filters]
      nextFilters[index] = filter
      onGroupChange({
        ...group,
        filters: nextFilters
      })
    },
    [group, onGroupChange]
  )

  return (
    <div className="flex flex-col gap-1 px-2">
      <div className="flex flex-row items-center px-1 gap-4">
        <Checkbox checked={group.selected} onClick={() => toggleSelected()} />
        {!editMode && (
          <Button
            className="flex flex-1 justify-start hover:bg-inherit border-b rounded-none"
            variant="ghost"
            onClick={() => toggleSelected()}
          >
            {group.mode}
          </Button>
        )}
        {editMode && (
          <div className="flex flex-1 justify-start hover:bg-inherit">
            <BasicSelect
              options={['AND', 'NOT', 'COUNT'] as ListingFilterGroupModes[]}
              onSelect={(m) => {
                setEditMode(false)
                setMode(m as ListingFilterGroupModes)
              }}
              defaultOption={group.mode}
              open={groupSelectOpen}
              onOpenChange={(open) => {
                setGroupSelectOpen(open)
                if (!open) setTimeout(() => setEditMode(false), 0)
              }}
            />
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setEditMode(true)
            setGroupSelectOpen(true)
          }}
        >
          <SquarePenIcon className="w-4 h-4" />
        </Button>
        <Button className="w-9 h-9" size="icon" variant="ghost" onClick={() => removeGroup()}>
          <XIcon className="w-4 h-4" />
        </Button>
      </div>
      {group.selected && (
        <>
          {group.filters.map((filter, i) => {
            return (
              <MemorizedListingGroupFilterSelect
                key={i}
                options={options}
                summaries={summaries}
                isNextFilter={false}
                filter={filter}
                index={i}
                updateFilter={updateFilter}
                removeFilter={removeFilter}
              />
            )
          })}
          <MemorizedListingGroupFilterSelect
            options={options}
            summaries={summaries}
            isNextFilter={true}
            filter={{ option: null, selected: true, minimumQuantity: undefined }}
            index={group.filters.length}
            updateFilter={updateFilter}
            removeFilter={removeFilter}
          />
          {/* <div className="flex flex-row px-1 gap-2">
            <Button variant="outline" onClick={() => addFilter()}>
              Add Filter
            </Button>
            <Button variant="outline" onClick={() => clearFilters()}>
              Clear Filters
            </Button>
          </div> */}
        </>
      )}
    </div>
  )
}

const MemorizedListingFilterGroupCard = memo(ListingFilterGroupCard)

type ListingGroupFilterSelectProps = {
  removeFilter: (i: number) => void
  updateFilter: (index: number, filter: ListingFilter) => void
  options: FilterOption[]
  summaries: Record<string, SageListingItemType['summary']>
  filter: ListingFilter
  index: number
  isNextFilter: boolean
}

function ListingGroupFilterSelect({
  options,
  summaries,
  filter,
  index,
  updateFilter,
  removeFilter,
  isNextFilter
}: ListingGroupFilterSelectProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [minQuantity, setMinQuantity] = useState<number | string>(filter.minimumQuantity || '')

  const selectedOption = useMemo(
    () => options?.find((option) => option.hash === filter.option?.hash),
    [filter.option?.hash, options]
  )

  const handleMinQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (Number.isNaN(newValue) || newValue < 0) {
      setMinQuantity('')
      updateFilter(index, { ...filter, minimumQuantity: undefined })
    } else {
      setMinQuantity(newValue)
      updateFilter(index, { ...filter, minimumQuantity: newValue })
    }
  }

  return (
    <div className="flex flex-row items-center px-1 gap-4">
      {!isNextFilter ? (
        <Checkbox
          checked={filter.selected}
          onClick={() => {
            updateFilter(index, { ...filter, selected: !filter.selected })
          }}
        />
      ) : (
        <div className="w-4 h-4 shrink-0" />
      )}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="flex justify-between w-full">
            {selectedOption ? (
              <>
                <div className="flex flex-row gap-2">
                  <Image
                    className="min-w-5"
                    width={20}
                    height={20}
                    src={selectedOption.icon}
                    alt="d"
                  />
                  <div className="truncate">{selectedOption.displayName}</div>
                </div>
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            ) : (
              <>
                Select ...
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 max-h-[var(--radix-popover-content-available-height)] w-full min-w-[var(--radix-popover-trigger-width)] overflow-hidden">
          <Command
            filter={(hash, search) => {
              if (summaries[hash]?.displayName?.toLowerCase().includes(search.toLowerCase()))
                return 1
              return 0
            }}
          >
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup className="max-h-[calc(var(--radix-popover-content-available-height)-7rem)] overflow-y-auto">
              {options.map((c) => (
                <CommandItem
                  key={c.hash}
                  value={c.hash}
                  onSelect={(hash) => {
                    const selectedOption = options.find((s) => s.hash === hash)
                    updateFilter(index, { ...filter, option: selectedOption ?? null })
                    setPopoverOpen(false)
                  }}
                >
                  <div className="flex flex-row gap-2 items-center w-full">
                    <Image className="min-w-5" width={20} height={20} src={c.icon} alt="d" />
                    <div className="flex flex-1">{c.displayName}</div>
                    {c.unsafeHashProperties.uses && (
                      <div>{`${c.unsafeHashProperties.uses} Uses`}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {!isNextFilter ? (
        <>
          <Input
            type="number"
            className="max-w-20 text-center remove-arrow"
            placeholder="MIN"
            min={0}
            value={minQuantity}
            onChange={handleMinQuantityChange}
          />
          <Button
            className="w-9 h-9 min-w-9"
            size="icon"
            variant="ghost"
            onClick={() => removeFilter(index)}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <div className="max-w-20 w-full" />
          <div className="min-w-9" />
        </>
      )}
    </div>
  )
}

const MemorizedListingGroupFilterSelect = memo(ListingGroupFilterSelect)

type SummariesQueriesType = {
  category: string | null
  setSummaries: Dispatch<SetStateAction<Record<string, SageItemGroupSummary>>>
  setOptions: Dispatch<SetStateAction<FilterOption[]>>
}

const SummariesQueries = ({ category, setSummaries, setOptions }: SummariesQueriesType) => {
  const categoryTagItem = useMemo(
    () => LISTING_CATEGORIES.find((ca) => ca.name === category),
    [category]
  )

  const { summaries, options, isSummaryPending, isSummaryLoading, isSummaryError } = useQueries({
    queries: categoryTagItem
      ? categoryTagItem.tags.map((tag) => {
          return {
            queryKey: ['summaries', tag],
            queryFn: () => listSummaries(tag),
            gcTime: 20 * 60 * 1000,
            staleTime: 20 * 60 * 1000,
            enabled: !!tag
          }
        })
      : [],
    combine: (summaryResults) => {
      const isSummaryError = summaryResults.some((result) => result.isError)
      const isSummaryLoading = summaryResults.some((result) => result.isLoading)

      let summaries: SageItemGroupSummaryShard['summaries'] = {}
      let options: FilterOption[] = []
      if (!(isSummaryError || isSummaryLoading)) {
        const summaryShards = summaryResults
          .filter((x) => x.data && !x.isPending)
          .map((x) => x.data!)
        summaryShards.forEach((e) => {
          Object.entries(e.summaries).filter(([key, value]) => {
            if (categoryTagItem?.filter?.({ group: value }) === false) {
              delete e.summaries[key]
            }
          })

          summaries = { ...summaries, ...e.summaries }
        })

        options = Object.entries(summaries).map(([key, value]): FilterOption => {
          return {
            hash: key,
            key: value.key,
            displayName: value.displayName.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
              letter.toUpperCase()
            ),
            icon: value.icon,
            unsafeHashProperties: value.unsafeHashProperties
          }
        })
      }

      return {
        summaries: isSummaryError || isSummaryLoading ? {} : summaries,
        options: isSummaryError || isSummaryLoading ? [] : options,
        isSummaryPending: summaryResults.some((result) => result.isPending),
        isSummaryLoading: isSummaryLoading,
        isSummaryError: isSummaryError
      }
    }
  })

  useEffect(() => {
    setSummaries(summaries)
    setOptions(options)
  }, [setSummaries, summaries, setOptions, options])

  return null
}

const MemorizedSummariesQueries = memo(SummariesQueries)

export default memo(ListingFilterCard)
