'use client'

import { currentUserAtom } from '@/components/providers'
import { NotificationBody, NotificationItem } from '@/hooks/useWhisperHashCopied'
import {
  listMyListings,
  listNotifications,
  listSummaries,
  listValuations,
  Notification
} from '@/lib/http-util'
import { LISTING_CATEGORIES } from '@/lib/listing-categories'
import { SageItemGroupSummaryShard } from '@/types/echo-api/item-group'
import { SageValuationShard } from '@/types/echo-api/valuation'
import { SageNotificationListingType, SageOfferingType } from '@/types/sage-listing-type'
import { useQueries, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type ParsedNotification = Omit<Notification, 'body'> & {
  body: string | SageOfferingType
  requestedItems?: NotificationItem[]
}

interface NotificationHandlerProps {}

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const Notifier = () => {
  const [fetchTimeStamp, setFetchTimestamp] = useState(0)
  const currentUser = useAtomValue(currentUserAtom)
  const listedNotifications = useRef<Record<string, boolean>>({})

  const { data: notifications, isError } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['notifications', fetchTimeStamp],
    queryFn: () => listNotifications(fetchTimeStamp),
    // We do not save any cache - this has the effect, that the query starts directly after changing the category
    gcTime: 0,
    enabled: !!currentUser,
    refetchOnWindowFocus: false,
    retry: true
  })

  const { data: allListings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listMyListings().then((res) => res.filter((l) => !l.deleted))
  })

  const enabled = useRef(isError)
  enabled.current = isError || !currentUser

  useEffect(() => {
    const interval = setInterval(() => {
      if (enabled.current) {
        // We do not start the next request until the first is finished
        console.warn('Skip request for next timestamp')
        return
      }
      const nextMs = dayjs.utc().valueOf()
      setFetchTimestamp(nextMs - 2000) // Request the data 2 sec ago
    }, 2000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const parsedNotifications = useMemo(() => {
    return notifications?.notifications.map((n): ParsedNotification => {
      console.log('Notification received: ', n)
      if (n.type === 'offering-buy') {
        try {
          const body: NotificationBody = JSON.parse(n.body)
          const listing = allListings?.find((l) => l.uuid === body.uuid)
          if (listing) {
            return { ...n, body: listing, requestedItems: body.items }
          }
        } catch (error) {
          console.error('Notification body could not be parsed', error)
        }
      }
      return n
    })
  }, [allListings, notifications?.notifications])

  const [tags, leagues] = useMemo(() => {
    const tags: Record<string, boolean> = {}
    const leagues: Record<string, boolean> = {}
    parsedNotifications?.forEach((n) => {
      if (typeof n.body === 'object') {
        const category = n.body.meta.category
        const categoryTagItem = LISTING_CATEGORIES.find((ca) => ca.name === category)
        categoryTagItem?.tags.forEach((t) => (tags[t] = true))

        leagues[n.body.meta.league] = true
      }
    })
    return [Object.keys(tags), Object.keys(leagues)]
  }, [parsedNotifications])

  const { summaries, isSummaryPending, isSummaryFetching, isSummaryError } = useQueries({
    queries: tags.map((tag) => {
      return {
        queryKey: ['summaries', tag],
        queryFn: () => listSummaries(tag),
        gcTime: 20 * 60 * 1000,
        staleTime: 20 * 60 * 1000,
        keepPreviousData: false,
        enabled: !!tag
      }
    }),
    combine: (summaryResults) => {
      const summaryShards = summaryResults.filter((x) => x.data && !x.isPending).map((x) => x.data!)

      let summaries: SageItemGroupSummaryShard['summaries'] = {}
      summaryShards.forEach((e) => {
        summaries = { ...summaries, ...e.summaries }
      })

      const isSummaryError = summaryResults.some((result) => result.isError)
      const isSummaryFetching = summaryResults.some((result) => result.isFetching)

      return {
        summaries: isSummaryError || isSummaryFetching ? undefined : summaries,
        isSummaryPending: summaryResults.some((result) => result.isPending),
        isSummaryFetching: isSummaryFetching,
        isSummaryError: isSummaryError
      }
    }
  })

  const { valuations, isValuationPending, isValuationFetching, isValuationError } = useQueries({
    queries: leagues
      .map((league) =>
        tags.map((tag) => {
          return {
            queryKey: ['valuations', league, tag],
            queryFn: () => listValuations(league, tag),
            gcTime: 20 * 60 * 1000,
            staleTime: 20 * 60 * 1000,
            keepPreviousData: false,
            enabled: !!league && !!tag
          }
        })
      )
      .flatMap((x) => x),
    combine: (valuationResults) => {
      // TODO: How to handle multiple leagues???
      const valuationShards = valuationResults
        .filter((x) => x.data && !x.isPending)
        .map((x) => x.data!)

      let valuations: SageValuationShard['valuations'] = {}
      valuationShards.forEach((e) => {
        // TODO: Distinct between leagues
        // e.meta.league
        valuations = { ...valuations, ...e.valuations }
      })

      const isValuationError = valuationResults.some((result) => result.isError)
      const isValuationFetching = valuationResults.some((result) => result.isFetching)

      return {
        valuations:
          isValuationError || isValuationFetching || leagues.length === 0 ? undefined : valuations,
        isValuationPending: valuationResults.some((result) => result.isPending),
        isValuationFetching,
        isValuationError
      }
    }
  })

  useEffect(() => {
    // TODO:
    parsedNotifications?.forEach((n) => {
      if (listedNotifications.current[n.id]) return
      listedNotifications.current[n.id] = true

      if (n.type !== 'offering-buy') {
        console.warn('Notification type not supported', n)
        return
      }
      if (typeof n.body !== 'object' || !n.requestedItems) {
        console.warn('Notification listing not found', n)
        return
      }
      console.log('Notification received: ', n)

      let validNotification = true
      const offering = n.body
      const requestedItems = n.requestedItems

      // TODO: Rebuild the listing
      let listing: SageNotificationListingType

      if (n.body.items.length > 0) {
        // Single items
        const reqItems = requestedItems.map(([hash, selectedQuantity]) => {
          const item = offering?.items.find((item) => item.hash === hash)
          if (!item) {
            validNotification = false
          }
          return {
            ...item,
            selectedQuantity: selectedQuantity
          }
        })
      } else {
        // All items
      }

      // TODO: Generate a short whisper message. Username - Category - Total Value -> Button to show the details
      if (validNotification) {
        toast.info('', {
          toastId: n.id,
          autoClose: 10000
        })
      } else {
        console.warn('The received notification body is invalid. Not all items found')
      }

      // TODO: List username + vouchrank + short message what he wants to buy
    })
  }, [parsedNotifications])

  return null
}

export default memo(Notifier)
