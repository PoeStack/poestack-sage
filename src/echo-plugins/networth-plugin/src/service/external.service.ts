import { map, tap } from 'rxjs'
import { filterNullish } from 'ts-ratchet'
import { IStashTab } from '../interfaces/stash.interface'
import { PoeItem } from 'sage-common'
import { context } from '../context'
import { RateLimitStore } from '../store/rateLimitStore'

export const valuateItems = (league: string, items: PoeItem[], rateLimitStore: RateLimitStore) => {
  const { poeValuations } = context()
  return poeValuations.withValuations(league, items).pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'valuateItems', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}

export const getProfile = (rateLimitStore: RateLimitStore) => {
  const { poeAccounts } = context()
  return poeAccounts.profile().pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'getProfile', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}

export const getLeagues = (rateLimitStore: RateLimitStore) => {
  const { poeAccounts } = context()
  return poeAccounts.leagues().pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'getLeagues', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}

export const getCharacters = (rateLimitStore: RateLimitStore) => {
  const { poeCharacters } = context()
  return poeCharacters.characterList().pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'getCharacters', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}

export const getCharacter = (character: string, rateLimitStore: RateLimitStore) => {
  const { poeCharacters } = context()
  return poeCharacters.character(character).pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'getCharacter', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}

export const getStashTabs = (league: string, rateLimitStore: RateLimitStore) => {
  const { poeStash } = context()
  return poeStash.stashes(league).pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'getStashTabs', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}
export const getStashTabWithChildren = (
  stash: IStashTab,
  league: string,
  rateLimitStore: RateLimitStore,
  children?: boolean
) => {
  const { poeStash } = context()
  const prefix = stash.parent && children ? `${stash.parent}/` : ''
  const stashId = `${prefix}${stash.id}`

  return poeStash.stashTab(league, stashId).pipe(
    tap((e) => {
      if (e.type === 'rate-limit') {
        console.warn('Set ratelimiting', 'getStashTabWithChildren', e.limitExpiresMs)
        rateLimitStore.setRetryAfter(e.limitExpiresMs)
      }
    }),
    map((e) => {
      if (e.type === 'error') {
        console.log(e.error.stack)
        throw new Error(e.error)
      }
      if (e.type === 'result') {
        return e.result
      }
      return null
    }),
    filterNullish()
  )
}

export default {
  valuateItems,
  getProfile,
  getLeagues,
  getCharacters,
  getCharacter,
  getStashTabs,
  getStashTabWithChildren
}
