import { map, Observable, tap } from 'rxjs'
import { GGG_API_UTIL } from './http-util'
import { PoeCharacter, PoeLeague, PoePartialStashTab, PoeProfile, PoeStashTab } from 'sage-common'
import { PoeLeagueAccount } from 'sage-common/dist/cjs/ggg/poe-api-models'

export class GggApi {
  public getProfile(): Observable<PoeProfile> {
    return GGG_API_UTIL.get<PoeProfile>(`/profile`)
  }

  public getLeagues(): Observable<PoeLeague[]> {
    return GGG_API_UTIL.get<{ leagues: PoeLeague[] }>('/account/leagues').pipe(
      map((e) => e?.leagues)
    )
  }

  public getCharacters(): Observable<PoeCharacter[]> {
    return GGG_API_UTIL.get<{ characters: PoeCharacter[] }>(`/character`).pipe(
      map((e) => e?.characters)
    )
  }

  public getCharacter(name: string): Observable<PoeCharacter> {
    return GGG_API_UTIL.get<{ character: PoeCharacter }>(`/character/${name}`).pipe(
      map((e) => e?.character)
    )
  }

  public getLeagueAccount(league: string): Observable<PoeLeagueAccount> {
    return GGG_API_UTIL.get<{ league_account: PoeLeagueAccount }>(`/league-account/${league}`).pipe(
      map((e) => e.league_account)
    )
  }

  public getStashes(league: string): Observable<PoePartialStashTab[]> {
    return GGG_API_UTIL.get<{ stashes: PoePartialStashTab[] }>(`/stash/${league}`).pipe(
      map((e) => e.stashes),
      tap((e) => {
        e.forEach((t) => {
          t.children?.forEach((c) => (c.league = league))
          t.league = league
        })
      })
    )
  }

  public getStashContent(league: string, stashId: string): Observable<PoeStashTab> {
    return GGG_API_UTIL.get<{ stash: PoeStashTab }>(`/stash/${league}/${stashId}`).pipe(
      map((e) => e?.stash),
      tap((e) => {
        e.league = league
        e.loadedAtTimestamp = new Date().toString()
      })
    )
  }
}
