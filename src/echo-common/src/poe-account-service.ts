import { SmartCache } from './smart-cache'
import { PoeLeague, PoeProfile } from 'sage-common'
import { GggApi } from 'ggg-api'
import { EchoDirService } from './echo-dir-service'
import { useCache } from './smart-cache-hooks'

export class PoeAccountService {
  public profile = new SmartCache<PoeProfile>(this.echoDir, "poe-profile")
  public leagues = new SmartCache<PoeLeague[]>(this.echoDir, "poe-leagues")

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) { }

  public useProfile() {
    return useCache(
      this.profile,
      { key: "profiles" },
      () => this.gggApi.getProfile()
    )
  }

  public useLeagues() {
    return useCache(
      this.leagues,
      { key: "leagues" },
      () => this.gggApi.getLeagues()
    )
  }

}
