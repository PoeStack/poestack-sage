'use client'
import Axios from 'axios'
import { lowerCaseCompasses } from './compasses'
import { SageDatabaseOfferingType, SageOfferingType } from '@/types/sage-listing-type'
import { IStashTab } from '@/types/echo-api/stash'
import { SageValuationShard, SageValuationShardInternal } from '@/types/echo-api/valuation'
import {
  SageItemGroupSummaryShard,
  SageItemGroupSummaryShardInternal
} from '@/types/echo-api/item-group'
import { PoeCharacter, PoeLeague } from '@/types/poe-api-models'
import { LISTING_CATEGORIES } from './listing-categories'

const dev = false
const baseUrl = dev ? 'http://localhost:3001' : 'https://green-api.poestack.com'
const maxTimeOffset = 10000 // We use this to avoid situations, where the server and clienttime is not synced

const includeTimeOffset = (timsMs: number) => {
  if (timsMs === 0) return 0
  return timsMs - maxTimeOffset
}

export function postListing(listing: SageDatabaseOfferingType) {
  return Axios.post(`${baseUrl}/list`, listing, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    }
  })
}

export async function listSummaries(tag: string) {
  const resp = await Axios.get(
    `https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/v10/summaries/${tag}.json`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
      }
    }
  )
  return itemGroupMapInternalToExternal(resp.data)
}

export async function auth(code: string) {
  const resp = await Axios.get(`${baseUrl}/ggg/auth/${code}`)
  return resp.data
}

export async function authDiscord(code: string) {
  const resp = await Axios.get(`${baseUrl}/discord/auth/${code}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    }
  })
  return resp.data
}

export async function listMyListings() {
  const resp = await Axios.get(`${baseUrl}/my/listings`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    }
  })
  const listings = resp.data as SageDatabaseOfferingType[]

  return listings
    .map((listing): SageOfferingType => {
      return {
        ...listing,
        meta: {
          ...listing.meta,
          timestampMs: listing.meta.timestampMs - 2000, // ??? Somehow there is a difference between client & server of approx. 1-3 second
          totalPrice: listing.items.reduce((sum, item) => item.price * item.quantity + sum, 0)
        }
      }
    })
    .sort((a, b) => b.meta.timestampMs - a.meta.timestampMs)
}

export type SageDatabaseOfferingTypeExt = Awaited<ReturnType<typeof listMyListings>>[number]

export function deleteListing(league: string, category: string, subCategory: string, uuid: string) {
  const resp = Axios.post(
    `${baseUrl}/delete/listing/${league.toLowerCase()}/${category}/${subCategory}`,
    { uuid: uuid },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
      }
    }
  )
  return resp
}

export async function listListings(league: string, category: string, startTimeMs: number) {
  const resp = await Axios.get(
    `${baseUrl}/listings/${league.toLowerCase()}/${category}/${includeTimeOffset(startTimeMs)}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
      }
    }
  )
  return resp.data as SageDatabaseOfferingType[]
}

export async function listValuations(league: string, tag: string): Promise<SageValuationShard> {
  const resp = await Axios.get(
    `https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/v10/valuations/${league.toLowerCase()}/${tag.replaceAll(' ', '_')}.json`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
      }
    }
  )
  return valuationMapInternalToExternal(resp.data, league, tag)
}

export type NotificationCreate = {
  type: string
  targetId: string
  body: any
}
export async function postNotifications(notification: NotificationCreate) {
  const resp = await Axios.post(`${baseUrl}/notifications`, notification, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    }
  })
  return resp.data
}

export type Notification = {
  id: string
  timestamp: number
  type: string
  targetId: string
  senderId: string
  body: string
}
export async function listNotifications(startTimeMs: number) {
  const resp = await Axios.get(`${baseUrl}/notifications/${includeTimeOffset(startTimeMs)}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    }
  })
  return resp.data as { notifications: Notification[] }
}

//#region GGG-API

export async function listStashes(league: string) {
  const resp = await Axios.get(`${baseUrl}/stashes/${league}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    },
    timeout: 6 * 60 * 1000
  })
  return resp.data as IStashTab[]
}

export async function listStash(league: string, stashId: string) {
  const resp = await Axios.get(`${baseUrl}/stash/${league}/${stashId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    },
    timeout: 6 * 60 * 1000
  })
  return resp.data as IStashTab
}

export async function listCharacters() {
  const resp = await Axios.get(`${baseUrl}/characters`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    },
    timeout: 6 * 60 * 1000
  })
  return resp.data as PoeCharacter[]
}

export async function listLeagues() {
  const resp = await Axios.get(`${baseUrl}/leagues`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('doNotShareJwt')}`
    },
    timeout: 6 * 60 * 1000
  })
  return resp.data as PoeLeague[]
}

//#endregion

//#region Mapper

function valuationMapInternalToExternal(
  internal: SageValuationShardInternal,
  league: string,
  tag: string
): SageValuationShard {
  const out: SageValuationShard = {
    meta: { ...internal.metadata, league, tag },
    valuations: {}
  }

  const percentiles = [5, 7, 10, 12, 15, 18, 20, 25, 30, 50]
  Object.entries(internal.valuations).forEach(([key, value]) => {
    const pValues: { [k: number]: number } = {}
    value.c.forEach((e, i) => {
      pValues[percentiles[i]] = e
    })

    out.valuations[key] = {
      listings: value.l,
      primaryValue: pValues[12],
      pValues: pValues,
      history: {
        primaryValueDaily: value.d,
        primaryValueHourly: value.h
      }
    }
  })

  return out
}

function itemGroupMapInternalToExternal(
  internal: SageItemGroupSummaryShardInternal
): SageItemGroupSummaryShard {
  const out: SageItemGroupSummaryShard = {
    meta: internal.meta,
    summaries: {}
  }

  Object.entries(internal.summaries).forEach(([k, v]) => {
    const icons = v.i
    out.summaries[k] = {
      hash: k,
      key: v.k,
      icon: `https://web.poecdn.com/gen/image/${icons?.[0]}`,
      sortProperty: v.v,
      unsafeHashProperties: v.p,
      displayName: v.k,
      tag: out.meta.tag
    }

    const tag = out.meta.tag
    if (tag) {
      const parseFn = LISTING_CATEGORIES.find((cat) => cat.tags.includes(tag))?.parseName
      if (parseFn) {
        out.summaries[k]['displayName'] =
          parseFn({
            group: out.summaries[k]
          }) || ''
      }
    }
  })

  return out
}

//#endregion
