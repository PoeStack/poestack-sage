import { map } from 'rxjs'
import { CachedTask } from './cached-task'
import { PoeLeague, PoeProfile } from 'sage-common'
import { GggApi } from 'ggg-api'
import { EchoDirService } from './echo-dir-service'

export class PoeAccountService {

  public profile = new CachedTask<PoeProfile>(this.echoDir, () => this.gggApi.getProfile())
  public leagues = new CachedTask<PoeLeague[]>(this.echoDir, () => this.gggApi.getLeagues())

  constructor(private echoDir: EchoDirService, private gggApi: GggApi) {
  }

  public poeProfile() {
    const result = this.profile.cache$.pipe(map((e) => Object.values(e)?.[0]?.result))
    return result
  }

  public poeLeagues() {
    const result = this.leagues.cache$.pipe(map((e) => Object.values(e)?.[0]?.result))
    return result
  }
}

