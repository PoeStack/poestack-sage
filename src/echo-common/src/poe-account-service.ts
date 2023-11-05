import { map } from 'rxjs'
import { CachedTask } from './cached-task'
import { bind } from '@react-rxjs/core'
import { GGG_API } from './echo-context'
import { PoeLeague, PoeProfile } from 'sage-common'

export class PoeAccountService {
  public profile = new CachedTask<PoeProfile>((key) => GGG_API.getProfile())

  public leagues = new CachedTask<PoeLeague[]>((key) => GGG_API.getLeagues())
}

export const POE_ACCOUNT_SERVICE = new PoeAccountService()

export const [usePoeProfile] = bind(
  POE_ACCOUNT_SERVICE.profile.cache$.pipe(map((e) => Object.values(e)?.[0]?.result)),
  null
)
export const [usePoeLeagues] = bind(
  POE_ACCOUNT_SERVICE.leagues.cache$.pipe(map((e) => Object.values(e)?.[0]?.result)),
  null
)
