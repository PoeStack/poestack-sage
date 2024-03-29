import CurrencyDisplay from '@/components/currency-display'
import { currentUserAtom } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  SageDatabaseOfferingTypeExt,
  deleteListing,
  listMyListings,
  listStashes
} from '@/lib/http-util'
import { LISTING_CATEGORIES } from '@/lib/listing-categories'
import { IStashTab } from '@/types/echo-api/stash'
import { SageOfferingType } from '@/types/sage-listing-type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { useAtomValue } from 'jotai'
import {
  ArrowLeftToLineIcon,
  CircleUserIcon,
  LayoutListIcon,
  MoreHorizontalIcon,
  PackageIcon,
  Trash2Icon
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
dayjs.extend(relativeTime)
dayjs.extend(utc)

type MyOfferingsCardProps = {
  league: string | null
  setCategory: (category: string | null) => void
  setStashes: (stashes: IStashTab[]) => void
}

export function MyOfferingsCard({ league, setCategory, setStashes }: MyOfferingsCardProps) {
  const queryClient = useQueryClient()
  const currentUser = useAtomValue(currentUserAtom)
  const [listings, setListings] = useState<SageOfferingType[]>()

  const { data: stashes } = useQuery({
    queryKey: ['stashes', league],
    queryFn: () => {
      if (!league) return [] as IStashTab[]
      return listStashes(league)
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser?.profile?.uuid && !!league
  })

  const { data: allListings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listMyListings().then((res) => res.filter((l) => !l.deleted))
  })

  useEffect(() => {
    let now = dayjs.utc().valueOf()
    setListings(allListings?.filter((l) => now - l.meta.timestampMs < 30 * 60 * 1000))
    const interval = setInterval(() => {
      now = dayjs.utc().valueOf()
      setListings(allListings?.filter((l) => now - l.meta.timestampMs < 30 * 60 * 1000))
    }, 5000)

    return () => clearInterval(interval)
  }, [allListings])

  const shownListings = useMemo(
    () => listings?.filter((l) => l.meta.league === league),
    [listings, league]
  )

  // Optimistic delete; See: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates
  const deleteMutation = useMutation({
    mutationFn: ({ league, category, uuid }: { league: string; category: string; uuid: string }) =>
      deleteListing(league, category, "test", uuid),
    onMutate: async (deleted) => {
      await queryClient.cancelQueries({ queryKey: ['my-listings'] })
      const previousListings = queryClient.getQueryData(['my-listings'])
      queryClient.setQueryData(['my-listings'], (old: SageDatabaseOfferingTypeExt[]) =>
        old.filter(
          (x) => !(x.meta.league === deleted.league && x.meta.category === deleted.category)
        )
      )
      return { previousListings }
    },
    onError: (err, deletedListing, context) => {
      queryClient.setQueryData(['my-listings'], context?.previousListings)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    }
  })

  return (
    <div className="flex flex-col border w-full bg-card text-card-foreground shadow rounded-md relative divide-y">
      <h3 className="p-2">My Offerings</h3>
      <div className="overflow-y-auto overflow-x-hidden max-h-[630px] h-[630px]">
        <div className="p-1">
          {(shownListings?.length || 0) > 0 ? (
            shownListings?.map((listing) => {
              const meta = listing.meta

              const category = LISTING_CATEGORIES.find((cat) => cat.name === meta.category)

              return (
                <div
                  key={`${meta.league}:${meta.category}`}
                  className="flex flex-col p-1 gap-2 text-sm cursor-default rounded-sm select-none outline-none hover:bg-accent/50 hover:text-accent-foreground "
                >
                  <div className="flex flex-row justify-between items-center gap-2 h-9">
                    <div className="flex flex-row gap-1 items-center text-sm">
                      {category && (
                        <Image
                          className="w-6 h-6"
                          width={24}
                          height={24}
                          src={category.icon}
                          alt={category.name}
                        />
                      )}
                      <div className="capitalize">{meta.category}</div>
                    </div>
                    <div className="flex flex-row items-center ">
                      <CurrencyDisplay
                        className="text-sm"
                        iconRect={{ width: 20, height: 20 }}
                        value={meta.totalPrice}
                        splitIcons
                      />
                    </div>
                  </div>
                  <div className="flex flex-row justify-between items-center gap-2">
                    <div className="flex flex-row items-center gap-1">
                      {meta.listingMode === 'bulk' ? (
                        <>
                          <PackageIcon className="w-4 h-4" />
                          Whole Offering
                        </>
                      ) : (
                        <>
                          <LayoutListIcon className="w-4 h-4" />
                          Individual
                        </>
                      )}
                      {/* {meta.tabs.map((tab, i) => (
                      <span key={`${i}_${tab}`}>{tab}</span>
                    ))} */}
                    </div>
                    <div>{dayjs.utc(meta.timestampMs).fromNow()}</div>
                  </div>
                  <div className="flex flex-row justify-between items-center gap-2">
                    {/* <div className="flex flow-row items-center gap-2 "> */}
                    <div className="flex flex-row items-center gap-1">
                      <CircleUserIcon className="w-4 h-4 shrink-0" />
                      {meta.ign}
                      {/* {' - '} */}
                      {/* <span className="capitalize">{meta.league}</span> */}
                    </div>
                    <div className="flex flew-row items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={!stashes}
                              onClick={() => {
                                const stashesToSelect = stashes
                                  ?.map((x) => x.children || x)
                                  .flatMap((x) => x)
                                  ?.filter((x) => meta.tabs.some((y) => x.id === y))
                                if (stashesToSelect) {
                                  setCategory(meta.category)
                                  setStashes(stashesToSelect)
                                }
                              }}
                            >
                              <ArrowLeftToLineIcon className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            This selects <b>only</b> the stashtabs and category.
                            <br />
                            All other settings are still applied:
                            <ul className="list-disc pl-4">
                              <li>Multiplier per category</li>
                              <li>Overrides/Overprices</li>
                              <li>Unselected items</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isLoading}
                          onClick={() =>
                            deleteMutation.mutate({
                              league: meta.league,
                              category: meta.category,
                              uuid: listing.uuid
                            })
                          }
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                        {/* <Separator orientation="vertical" className="h-6" />
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </Button> */}
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex justify-center items-center h-20 text-sm">No offerings.</div>
          )}
        </div>
      </div>
    </div>
  )
}
