'use client'

import { DEFAULT_VALUATION_INDEX } from '@/lib/constants'
import { listListings, listSummaries, listValuations } from '@/lib/http-util'
import { LISTING_CATEGORIES } from '@/lib/listing-categories'
import { SageItemGroupSummaryShard } from '@/types/echo-api/item-group'
import { SageValuationShard } from '@/types/echo-api/valuation'
import { SageListingType } from '@/types/sage-listing-type'
import { useQueries, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getCategory, useListingsStore } from './listingsStore'
import { calculateListingFromOfferingListing } from '@/lib/listing-util'

interface ListingsHandlerProps {}

// Tutorial: https://ui.shadcn.com/docs/components/data-table
const ListingsHandler = () => {
  const league = useListingsStore((state) => state.league)
  const categoryItem = useListingsStore(
    useShallow((state) => LISTING_CATEGORIES.find((ca) => ca.name === state.category))
  )
  const subCategoryItem = useListingsStore(
    useShallow((state) =>
      state.subCategory
        ? categoryItem?.subCategories.find((c) => c.name === state.subCategory)
        : undefined
    )
  )
  // Starts with 0
  const fetchTimeStamp = useListingsStore(
    (state) => state.fetchTimeStamps[state.league]?.[getCategory(state)]
  )
  const setFetchTimestamp = useListingsStore((state) => state.setFetchTimestamps)
  const addListings = useListingsStore((state) => state.addListings)
  const cleanupListings = useListingsStore((state) => state.cleanupListings)

  const {
    data: listings,
    isError,
    isRefetching
  } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'listings',
      league,
      categoryItem?.name || '',
      subCategoryItem?.name || '',
      fetchTimeStamp
    ],
    queryFn: () => listListings(league, categoryItem!.name, fetchTimeStamp, subCategoryItem?.name),
    // We do not save any cache - this has the effect, that the query starts directly after changing the category
    gcTime: 0,
    enabled: !!categoryItem,
    refetchOnWindowFocus: false,
    retry: true
  })

  const errorRef = useRef(isError)
  errorRef.current = isError || isRefetching

  useEffect(() => {
    const interval = setInterval(() => {
      if (errorRef.current) {
        // We do not start the next request until the first is finished
        console.warn('Skip request for next timestamp')
        return
      }
      const nextMs = dayjs.utc().valueOf()
      setFetchTimestamp(nextMs - 2000) // Request the data 2 sec ago
    }, 2000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryItem?.name])

  const { summaries, isSummaryPending, isSummaryFetching, isSummaryError } = useQueries({
    queries: categoryItem
      ? categoryItem.tags.map((tag) => {
          return {
            queryKey: ['summaries', tag],
            queryFn: () => listSummaries(tag),
            gcTime: 20 * 60 * 1000,
            staleTime: 20 * 60 * 1000,
            keepPreviousData: false,
            enabled: !!tag
          }
        })
      : [],
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

  // This is only one league
  const leagues = useMemo(() => {
    const distinctLeagues: Record<string, boolean> = {}
    listings?.forEach((l) => (distinctLeagues[l.meta.league] = true))
    return Object.keys(distinctLeagues)
  }, [listings])

  const { valuations, isValuationPending, isValuationFetching, isValuationError } = useQueries({
    queries:
      leagues.length > 0 && categoryItem
        ? leagues
            .map((league) =>
              categoryItem.tags.map((tag) => {
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
            .flatMap((x) => x)
        : [],
    combine: (valuationResults) => {
      const valuationShards = valuationResults
        .filter((x) => x.data && !x.isPending)
        .map((x) => x.data!)

      let valuations: SageValuationShard['valuations'] = {}
      valuationShards.forEach((e) => {
        // TODO: Distinct between leagues
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

  const startCalculation = !!categoryItem && valuations !== undefined && summaries !== undefined

  useEffect(() => {
    if (listings && listings.length > 0 && startCalculation) {
      const nextListings = listings.map((listing) =>
        calculateListingFromOfferingListing(listing, summaries, valuations)
      )

      // One user can have one category per league active. We delete or replace this
      const categories: Record<string, SageListingType[]> = {}
      nextListings.forEach((l) => {
        const categoryKey = l.meta.category + (!l.meta.subCategory ? '' : `_${l.meta.subCategory}`)
        if (categories[categoryKey]) {
          categories[categoryKey].push(l)
        } else {
          categories[categoryKey] = [l]
        }
      })
      Object.entries(categories).forEach(([categoryKey, listings]) => {
        const [category, subCategory] = categoryKey.split('_')
        addListings(listings, category, subCategory)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCalculation, listings])

  useEffect(() => {
    const interval = setInterval(cleanupListings, 2000)
    return () => clearInterval(interval)
  }, [cleanupListings])

  return null
}

export default memo(ListingsHandler)
