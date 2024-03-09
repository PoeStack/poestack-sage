import CurrencyDisplay from '@/components/currency-display'
import { currentUserAtom } from '@/components/providers'
import { TimeTracker } from '@/components/time-tracker'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  SageDatabaseOfferingTypeExt,
  deleteListing,
  listMyListings,
  listStashes
} from '@/lib/http-util'
import { LISTING_CATEGORIES, ListingSubCategory } from '@/lib/listing-categories'
import { IStashTab } from '@/types/echo-api/stash'
import { ListingMode, SageOfferingType } from '@/types/sage-listing-type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import {
  ArrowLeftToLineIcon,
  CircleUserIcon,
  LayoutListIcon,
  PackageIcon,
  Trash2Icon
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
dayjs.extend(relativeTime)
dayjs.extend(utc)

const variants = {
  item: {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  }
}

type MyOfferingsCardProps = {
  league: string | null
  setCategory: (category: string | null) => void
  setSubCategory: (subCategory: string | null) => void
  setStashes: (stashes: IStashTab[]) => void
  setListingMode: (listingMode: ListingMode, category?: string | null) => void
}

export function MyOfferingsCard({
  league,
  setCategory,
  setSubCategory,
  setStashes,
  setListingMode
}: MyOfferingsCardProps) {
  const queryClient = useQueryClient()
  const currentUser = useAtomValue(currentUserAtom)
  const [listings, setListings] = useState<SageOfferingType[]>()

  const { data: stashes } = useQuery({
    queryKey: [currentUser?.profile?.uuid, 'stashes', league],
    queryFn: () => {
      if (!league) return [] as IStashTab[]
      return listStashes(league)
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser?.profile?.uuid && !!league
  })

  const { data: allListings, isLoading } = useQuery({
    queryKey: [currentUser?.profile?.uuid, 'my-listings'],
    queryFn: () => listMyListings().then((res) => res.filter((l) => !l.deleted)),
    enabled: !!currentUser?.profile?.uuid
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
    mutationFn: ({
      league,
      category,
      subCategory,
      uuid
    }: {
      league: string
      category: string
      subCategory: string
      uuid: string
    }) => deleteListing(league, category, subCategory, uuid),
    onMutate: async (deleted) => {
      await queryClient.cancelQueries({ queryKey: [currentUser?.profile?.uuid, 'my-listings'] })
      const previousListings = queryClient.getQueryData([currentUser?.profile?.uuid, 'my-listings'])
      queryClient.setQueryData(
        [currentUser?.profile?.uuid, 'my-listings'],
        (old: SageDatabaseOfferingTypeExt[]) =>
          old.filter(
            (x) => !(x.meta.league === deleted.league && x.meta.category === deleted.category)
          )
      )
      return { previousListings }
    },
    onError: (err, deletedListing, context) => {
      queryClient.setQueryData(
        [currentUser?.profile?.uuid, 'my-listings'],
        context?.previousListings
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [currentUser?.profile?.uuid, 'my-listings'] })
    }
  })

  return (
    <div className="flex flex-col border w-full bg-card text-card-foreground shadow rounded-md relative divide-y">
      <h3 className="p-2">My Offerings</h3>
      <div className="overflow-y-auto overflow-x-hidden max-h-[630px] h-[630px]">
        <div className="p-1">
          <AnimatePresence>
            {(shownListings?.length || 0) > 0 ? (
              shownListings?.map((listing) => {
                const meta = listing.meta
                const categoryItem = LISTING_CATEGORIES.find((cat) => cat.name === meta.category)
                const selectedCategory = meta.subCategory
                  ? categoryItem?.subCategories.find((cat) => cat.name === meta.subCategory)
                  : categoryItem

                return (
                  <motion.div
                    key={`${meta.league}:${meta.category}:${meta.subCategory}`}
                    className="flex flex-col p-1 gap-2 text-sm cursor-default rounded-sm select-none outline-none hover:bg-accent/50 hover:text-accent-foreground "
                    layout
                    initial={{ scale: 0.4, opacity: 0, y: 50 }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                      transition: { duration: 0.2 }
                    }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                  >
                    <motion.article variants={variants.item}>
                      <div className="flex flex-row justify-between items-center gap-2 h-9">
                        <div className="flex flex-row gap-1 items-center text-sm">
                          {selectedCategory && (
                            <Image
                              className="w-6 h-6"
                              width={24}
                              height={24}
                              src={selectedCategory.icon}
                              alt={selectedCategory.name}
                            />
                          )}
                          <div className="capitalize">{selectedCategory?.name || ''}</div>
                        </div>
                        <div className="flex flex-row items-center ">
                          <CurrencyDisplay
                            className="text-sm"
                            ttContentClassName="z-[60]"
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
                        <TimeTracker createdAt={dayjs.utc(meta.timestampMs)} />
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
                                      setSubCategory(!meta.subCategory ? null : meta.subCategory)
                                      setStashes(stashesToSelect)
                                      setListingMode(
                                        meta.listingMode,
                                        meta.category + (!meta.subCategory ? '' : meta.subCategory)
                                      )
                                    }
                                  }}
                                >
                                  <ArrowLeftToLineIcon className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                This selects <b>only</b> the stashtabs, category, subcategory and
                                sellmode.
                                <br />
                                All other settings are still applied:
                                <ul className="list-disc pl-4">
                                  <li>Multiplier per (sub-)category</li>
                                  <li>Overrides/Overprices</li>
                                  <li>Unselected items</li>
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={isLoading || !currentUser?.profile?.uuid}
                              onClick={() => {
                                deleteMutation.mutate({
                                  league: meta.league,
                                  category: meta.category,
                                  subCategory: meta.subCategory,
                                  uuid: listing.uuid
                                })
                              }}
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
                    </motion.article>
                  </motion.div>
                )
              })
            ) : (
              <div className="flex justify-center items-center h-20 text-sm">No offerings.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
