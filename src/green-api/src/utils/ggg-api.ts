import { map, Observable, tap } from 'rxjs'
import { PoeCharacter, PoeLeague, PoeLeagueAccount, PoePartialStashTab, PoeProfile, PoeStashTab } from './ggg-models'
import { GggHttpUtil } from './ggg-api-util'

export class GggApi {
  constructor(private httpUtil: GggHttpUtil) { }

  public getProfile(token: string): Observable<PoeProfile> {
    return this.httpUtil.get<PoeProfile>('getProfile', token, `/profile`)
  }

  public getLeagues(token: string): Observable<PoeLeague[]> {
    return this.httpUtil
      .get<{ leagues: PoeLeague[] }>('getLeagues', token, '/account/leagues')
      .pipe(map((e) => e?.leagues))
  }

  public getCharacters(token: string): Observable<PoeCharacter[]> {
    return this.httpUtil
      .get<{ characters: PoeCharacter[] }>('getCharacters', token, `/character`)
      .pipe(map((e) => e?.characters))
  }

  public getCharacter(token: string, name: string): Observable<PoeCharacter> {
    return this.httpUtil
      .get<{ character: PoeCharacter }>('getCharacter', token, `/character/${name}`)
      .pipe(map((e) => e?.character))
  }

  public getLeagueAccount(token: string, league: string): Observable<PoeLeagueAccount> {
    return this.httpUtil
      .get<{ league_account: PoeLeagueAccount }>('getLeagueAccount', token, `/league-account/${league}`)
      .pipe(map((e) => e.league_account))
  }

  public getStashes(token: string, league: string): Observable<PoePartialStashTab[]> {
    return this.httpUtil
      .get<{ stashes: PoePartialStashTab[] }>('getStashes', token, `/stash/${league}`)
      .pipe(
        map((e) => e.stashes),
        tap((e) => {
          e.forEach((t) => {
            t.children?.forEach((c) => (c.league = league))
            t.league = league
          })
        })
      )
  }

  public getStashContent(token: string, league: string, stashId: string): Observable<PoeStashTab> {
    return this.httpUtil
      .get<{ stash: PoeStashTab }>('getStashContent', token, `/stash/${league}/${stashId}`)
      .pipe(
        map((e) => e?.stash),
        tap((e) => {
          e.league = league
          e.loadedAtTimestamp = new Date().toString()
        })
      )
  }
}
