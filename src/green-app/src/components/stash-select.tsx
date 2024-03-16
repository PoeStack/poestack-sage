import { listStashes } from '@/lib/http-util'
import { cn } from '@/lib/utils'
import { IStashTab } from '@/types/echo-api/stash'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAtomValue } from 'jotai'
import { Loader2Icon, MoreHorizontalIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import { memo, useMemo, useState } from 'react'
import { STASH_TAB_ICON_MAP } from '../lib/constants'
import { currentUserAtom } from './providers'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { TimeTracker } from './time-tracker'
import { UserInfo } from '@/types/userInfo'
import { useTranslation } from 'react-i18next'
dayjs.extend(relativeTime)

// Inspiration:
// https://cmdk.paco.me/
// https://github.com/pacocoursey/cmdk/blob/main/website/components/cmdk/raycast.tsx
// https://github.com/pacocoursey/cmdk/blob/main/website/styles/cmdk/raycast.scss

type StashSelectProps = {
  className?: string
  league: string | null
  selected: IStashTab[]
  isStashListItemsFetching?: boolean
  onSelect: (stashes: IStashTab[]) => void
  onLoadStashTabsClicked: (() => void) | undefined
}

const StashSelect = ({
  className,
  league,
  selected,
  isStashListItemsFetching,
  onSelect,
  onLoadStashTabsClicked
}: StashSelectProps) => {
  const { t } = useTranslation()
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: stashes,
    isFetching: isStashListFetching,
    isLoading: isStashListLoading,
    refetch
  } = useQuery({
    queryKey: [currentUser?.profile?.uuid, 'stashes', league],
    queryFn: () => {
      if (!league) return [] as IStashTab[]
      return listStashes(league)
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser?.profile?.uuid && !!league
  })

  const stashesMap = useMemo(() => {
    if (!stashes) return {}
    const flatStashes: IStashTab[] = stashes.flatMap((s: IStashTab) =>
      s.children?.length ? s.children : [s]
    )
    const stashesMap: Record<string, IStashTab> = {}
    flatStashes.map((stash) => {
      stashesMap[stash.id] = stash
    })
    return stashesMap
  }, [stashes])

  const handleUnselectStashtabsClicked = () => {
    onSelect([])
  }

  return (
    <Command
      className={cn('border relative', className)}
      filter={(id, search) => {
        if (stashesMap[id]?.name?.toLowerCase().includes(search.toLowerCase())) return 1
        return 0
      }}
    >
      <div className="flex flex-row gap-1 relative">
        <CommandInput className="pr-8" placeholder={t('label.searchPh')} />
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-none rounded-tr absolute right-0 shrink-0"
          onClick={() => refetch()}
          disabled={isStashListFetching || !currentUser?.profile?.uuid || !league}
        >
          <RefreshCwIcon
            className={cn(isStashListFetching && 'animate-spin', 'w-4 h-w shrink-0')}
          />
        </Button>
      </div>
      <CommandEmpty>{t('label.noResults')}</CommandEmpty>

      <CommandList className="max-h-max mb-10">
        <CommandGroup>
          {isStashListLoading
            ? Array.from(Array(14)).map((_, i) => (
                <CommandItem key={i}>
                  <div className="flex items-center space-x-4 w-full">
                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                    <Skeleton className="h-4 flex flex-1" />
                  </div>
                </CommandItem>
              ))
            : stashes?.map((stash) => {
                if (stash.children) {
                  return (
                    <CommandGroup key={stash.id} heading={stash.name}>
                      {stash.children.map((subStash) => {
                        return (
                          <StashItem
                            key={subStash.id}
                            currentUser={currentUser}
                            league={league}
                            stash={subStash}
                            selected={selected}
                            onSelect={onSelect}
                          />
                        )
                      })}
                    </CommandGroup>
                  )
                }
                return (
                  <StashItem
                    key={stash.id}
                    currentUser={currentUser}
                    league={league}
                    stash={stash}
                    selected={selected}
                    onSelect={onSelect}
                  />
                )
              })}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center gap-1 justify-end w-full border-t h-10 p-2 text-xs absolute bottom-0">
        <Button
          onClick={onLoadStashTabsClicked}
          className="flex flex-row gap-2 h-7 text-muted-foreground"
          variant="ghost"
          size="sm"
          disabled={isStashListItemsFetching || !currentUser?.profile?.uuid || !league}
        >
          <RefreshCwIcon className={cn(isStashListItemsFetching && 'animate-spin', 'w-4 h-w')} />
          {t('action.loadTabs', {
            selected: selected.length,
            total: Object.keys(stashesMap).length
          })}
        </Button>
        <div className="flex flex-1" />
        {/* <div className="flex-1 text-xs text-muted-foreground truncate">
          {selected.length} of {Object.keys(stashesMap).length}
        </div> */}
        {/* <Button className="flex flex-row gap-2 h-7 text-muted-foreground" variant="ghost" size="sm">
          Load {selected.length} Tabs
          <RefreshCwIcon className="w-4 h-w" />
        </Button> */}
        <Separator orientation="vertical" />
        <SubCommand
          isStashListFetching={isStashListFetching}
          onRefreshStashtabsClicked={() => {
            refetch()
          }}
          onUnselectStashtabsClicked={handleUnselectStashtabsClicked}
        />
      </div>
    </Command>
  )
}

type StashItemProps = {
  currentUser: UserInfo | null
  league: string | null
  stash: IStashTab
  selected: IStashTab[]
  onSelect: (stashes: IStashTab[]) => void
}

const StashItem = ({ currentUser, league, stash, selected, onSelect }: StashItemProps) => {
  const { t } = useTranslation()
  const isSelected = useMemo(() => selected.some((x) => x.id === stash.id), [selected, stash.id])
  const [open, setOpen] = useState(false)

  const { isSuccess, isError, isFetching, dataUpdatedAt } = useQuery({
    queryKey: [currentUser?.profile?.uuid, 'stash', league, stash.id],
    enabled: false
  })

  const isUnsupported = ['UniqueStash'].includes(stash.type)

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip
        delayDuration={500}
        open={open}
        onOpenChange={(open) => {
          setOpen(open)
        }}
      >
        <CommandItem
          key={stash.id}
          value={stash.id}
          className={cn(
            "hover:!bg-accent hover:!text-accent-foreground aria-[selected='true']:bg-inherit aria-[selected='true']:text-inherit px-0 py-0",
            isFetching ? 'cursor-progress' : 'cursor-pointer'
          )}
          disabled={isFetching || isUnsupported}
          onSelect={() => {
            onSelect(
              isSelected ? selected.filter((item) => item.id !== stash.id) : [...selected, stash]
            )
          }}
        >
          <TooltipTrigger asChild>
            <div className="flex flex-row gap-2 items-center w-full px-2 py-1.5">
              {isSuccess ? (
                <Checkbox
                  checked={isSelected}
                  icon="doubleChecked"
                  disabled={isFetching || isUnsupported}
                />
              ) : isError ? (
                <Checkbox
                  checked={isSelected}
                  icon="xChecked"
                  disabled={isFetching || isUnsupported}
                />
              ) : (
                <Checkbox checked={isSelected} disabled={isFetching || isUnsupported} />
              )}
              <div className="flex flex-1">{stash.name}</div>
              {!!STASH_TAB_ICON_MAP[stash.type] && (
                <Image
                  className="w-7 h-7 shrink-0"
                  width={28}
                  height={28}
                  src={STASH_TAB_ICON_MAP[stash.type]}
                  alt={''}
                />
              )}
            </div>
          </TooltipTrigger>
          {!isUnsupported && (
            <TooltipContent side="top">
              <Label>
                {dataUpdatedAt === 0 ? (
                  t('label.notLoadedTT')
                ) : (
                  <span className="flex flex-row gap-1">
                    {t('label.updatedTT')}
                    <TimeTracker createdAt={dataUpdatedAt} />
                  </span>
                )}
              </Label>
            </TooltipContent>
          )}
          {isFetching && (
            <div className="absolute w-full h-full backdrop-blur-lg supports-[backdrop-filter]:backdrop-opacity-50">
              <div
                role="status"
                className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
              >
                <Loader2Icon className="w-4 h-w shrink-0 animate-spin" />
              </div>
            </div>
          )}
        </CommandItem>
      </Tooltip>
    </TooltipProvider>
  )
}

type SubCommandProps = {
  isStashListFetching?: boolean
  onRefreshStashtabsClicked: () => void
  onUnselectStashtabsClicked: () => void
}

function SubCommand({
  isStashListFetching,
  onRefreshStashtabsClicked,
  onUnselectStashtabsClicked
}: SubCommandProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          className="flex flex-row gap-2 h-7 w-7 px-0 text-muted-foreground"
          variant="ghost"
          size="sm"
        >
          <MoreHorizontalIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 min-w-[100px] max-w-[210px]"
        side="top"
        align="end"
        sideOffset={16}
        alignOffset={0}
      >
        <Command>
          <CommandList>
            <CommandGroup heading={t('title.actions')}>
              <CommandItem
                onSelect={() => {
                  onRefreshStashtabsClicked()
                  setOpen(false)
                }}
                className={cn(
                  "hover:!bg-accent hover:!text-accent-foreground aria-[selected='true']:bg-inherit aria-[selected='true']:text-inherit cursor-pointer",
                  isStashListFetching && 'cursor-not-allowed'
                )}
                disabled={isStashListFetching}
              >
                <div className="flex flex-row gap-2 items-center w-full">
                  <RefreshCwIcon className={cn(isStashListFetching && 'animate-spin', 'w-4 h-w')} />
                  {t('action.refreshStashTabs')}
                </div>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onUnselectStashtabsClicked()
                  setOpen(false)
                }}
                className="hover:!bg-accent hover:!text-accent-foreground aria-[selected='true']:bg-inherit aria-[selected='true']:text-inherit cursor-pointer"
              >
                <div className="flex flex-row gap-2 items-center w-full">
                  <Trash2Icon className="w-4 h-w" />
                  {t('action.unselectStashTabs')}
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          {/* <CommandInput placeholder="Search for actions..." /> */}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default memo(StashSelect)
