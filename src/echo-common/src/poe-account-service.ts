import { SmartCache, SmartCacheConfig } from './smart-cache'
import { PoeLeague, PoeProfile } from 'sage-common'
import { GggApi } from 'ggg-api'
import { EchoDirService } from './echo-dir-service'
import { useCache } from './smart-cache-hooks'

export class PoeAccountService {
  public cacheProfile = new SmartCache<PoeProfile>(this.echoDir, 'poe-profile')
  public cacheLeagues = new SmartCache<PoeLeague[]>(this.echoDir, 'poe-leagues')

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) {}

  public profile(config?: SmartCacheConfig) {
    return this.cacheProfile.load(
      { maxAgeMs: 10_000, maxStaleMs: 5_000, ...config, key: 'profiles' },
      () => this.gggApi.getProfile()
    )
  }

  public leagues(config?: SmartCacheConfig) {
    return this.cacheLeagues.load(
      { maxAgeMs: 10_000, maxStaleMs: 5_000, ...config, key: 'leagues' },
      () => this.gggApi.getLeagues()
    )
  }

  public useProfile() {
    return useCache(this.cacheProfile, { key: 'profiles' }, () => this.gggApi.getProfile())
  }

  public useLeagues() {
    return useCache(this.cacheLeagues, { key: 'leagues' }, () => this.gggApi.getLeagues())
  }
}
