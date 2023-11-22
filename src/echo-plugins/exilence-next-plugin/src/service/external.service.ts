import { map, mergeMap } from 'rxjs'
import { context } from '../entry'
import { filterNullish } from 'ts-ratchet'
import { IStashTab } from '../interfaces/stash.interface'

export const getProfile = () => {
  const { poeAccounts } = context()
  return poeAccounts.profile.load({ key: 'profile' }).pipe(
    map((e) => {
      if (e.type === 'error') {
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

export const getLeagues = () => {
  const { poeAccounts } = context()
  return poeAccounts.leagues.load({ key: 'leagues' }).pipe(
    map((e) => {
      if (e.type === 'error') {
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

export const getCharacters = () => {
  const { poeCharacters } = context()
  return poeCharacters.cacheCharacterList.load({ key: 'character_list' }).pipe(
    map((e) => {
      if (e.type === 'error') {
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

export const getCharacter = (character: string) => {
  const { poeCharacters } = context()
  return poeCharacters.cacheCharacter.load({ key: character }).pipe(
    map((e) => {
      if (e.type === 'error') {
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

export const getStashTabs = (league: string) => {
  const { poeStash } = context()
  return poeStash.cacheStashes.load({ key: league }).pipe(
    map((e) => {
      if (e.type === 'error') {
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

export const getStashTabWithChildren = (stash: IStashTab, league: string, children?: boolean) => {
  const { poeStash } = context()
  const prefix = stash.parent && children ? `${stash.parent}/` : ''
  const id = `${prefix}${stash.id}`
  return poeStash.cacheStashContent.load({ key: `${league}_${id}` }).pipe(
    map((e) => {
      if (e.type === 'error') {
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
  getProfile,
  getLeagues,
  getCharacters,
  getCharacter,
  getStashTabs,
  getStashTabWithChildren
}
