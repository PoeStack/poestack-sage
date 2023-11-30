import { map, Observable, tap } from 'rxjs'
import { PoeCharacter, PoeLeague, PoePartialStashTab, PoeProfile, PoeStashTab } from 'sage-common'
import { PoeLeagueAccount } from 'sage-common/dist/cjs/ggg/poe-api-models'
import { GggHttpUtil } from './ggg-http-util'
export class GggApi {
  constructor(private httpUtil: GggHttpUtil) { }

  public getProfile(): Observable<PoeProfile> {
    return this.httpUtil.get<PoeProfile>("getProfile", `/profile`)
  }

  public getLeagues(): Observable<PoeLeague[]> {
    return this.httpUtil
      .get<{ leagues: PoeLeague[] }>("getLeagues", '/account/leagues')
      .pipe(map((e) => e?.leagues))
  }

  public getCharacters(): Observable<PoeCharacter[]> {
    return this.httpUtil
      .get<{ characters: PoeCharacter[] }>("getCharacters", `/character`)
      .pipe(map((e) => e?.characters))
  }

  public getCharacter(name: string): Observable<PoeCharacter> {
    return this.httpUtil
      .get<{ character: PoeCharacter }>("getCharacter", `/character/${name}`)
      .pipe(map((e) => e?.character))
  }

  public getLeagueAccount(league: string): Observable<PoeLeagueAccount> {
    return this.httpUtil
      .get<{ league_account: PoeLeagueAccount }>("getLeagueAccount", `/league-account/${league}`)
      .pipe(map((e) => e.league_account))
  }

  public getStashes(league: string): Observable<PoePartialStashTab[]> {
    return this.httpUtil.get<{ stashes: PoePartialStashTab[] }>("getStashes", `/stash/${league}`).pipe(
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
    return this.httpUtil.get<{ stash: PoeStashTab }>("getStashContent", `/stash/${league}/${stashId}`).pipe(
      map((e) => e?.stash),
      tap((e) => {
        e.league = league
        e.loadedAtTimestamp = new Date().toString()
      })
    )
  }
}
