import { map } from 'rxjs'
import { SmartCache } from './smart-cache'
import { PoeLeague, PoeProfile } from 'sage-common'
import { GggApi } from 'ggg-api'
import { EchoDirService } from './echo-dir-service'

export class PoeAccountService {
  public profile = new SmartCache<PoeProfile>(this.echoDir, () => this.gggApi.getProfile())
  public leagues = new SmartCache<PoeLeague[]>(this.echoDir, () => this.gggApi.getLeagues())

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) {}

  public poeProfile() {
    const result = this.profile.memoryCache$.pipe(
      map((e) => Object.values(e)?.[0]?.lastResultEvent?.result)
    )
    return result
  }

  public poeLeagues() {
    const result = this.leagues.memoryCache$.pipe(
      map((e) => Object.values(e)?.[0]?.lastResultEvent?.result)
    )
    return result
  }
}
