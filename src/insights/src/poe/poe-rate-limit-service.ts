import _ from 'lodash'

import type PoeRateLimitInfo from './poe-rate-limit-info'
import { singleton } from 'tsyringe'
import { Logger } from '../services/logger'

@singleton()
export default class PoeRateLimitService {
  policyCache = {}
  cache = {}

  public getRateLimiMs(token: string, variblePath: string): number {
    const cacheKey = this.computeCacheKey(token, variblePath)
    const cacheInfo: CacheInfo = this.cache[cacheKey] || new CacheInfo()
    const nowMs = Date.now()

    const gggRetryAfterMs = cacheInfo.lastRequestRateLimitInfo?.retryAfterMs
    if (gggRetryAfterMs) {
      const gggRetryMsRemaining =
        cacheInfo.lastRequestRateLimitInfo.timestampMs + gggRetryAfterMs - nowMs
      if (gggRetryMsRemaining > 0) {
        Logger.info(`GGG Rate limiting for ${gggRetryMsRemaining}.`)
        return gggRetryMsRemaining
      }
    }

    const sortedLimits = cacheInfo.lastRequestRateLimitInfo?.limits.sort(
      (a, b) => b.periodTestedMs - a.periodTestedMs
    )
    for (const limit of sortedLimits || []) {
      const hitsWithinPeriod = cacheInfo.requestTimestampsMs.filter(
        (timestampMs) => timestampMs > nowMs - limit.periodTestedMs
      )
      const hitsWithinPeriodCount = hitsWithinPeriod.length

      if (hitsWithinPeriodCount >= limit.maximumHitsCount) {
        const minHitTimestampMs = _.min(hitsWithinPeriod)
        const msRemainingUntilHitOutsideWindow = minHitTimestampMs - (nowMs - limit.periodTestedMs)
        return msRemainingUntilHitOutsideWindow
      }
    }

    if (cacheInfo.requestTimestampsMs.length > 300) {
      cacheInfo.requestTimestampsMs.shift()
    }

    return 0
  }

  public recordResponse(token: string, variblePath: string, rateLimitInfo: PoeRateLimitInfo) {
    this.policyCache[variblePath] = rateLimitInfo?.policy

    const nowMs = Date.now()
    const cacheKey = this.computeCacheKey(token, variblePath)
    const cacheInfo: CacheInfo = this.cache[cacheKey] || new CacheInfo()
    this.cache[cacheKey] = cacheInfo
    cacheInfo.requestTimestampsMs.push(nowMs)
    cacheInfo.lastRequestRateLimitInfo = rateLimitInfo
  }

  private computeCacheKey(token: string, variblePath: string): string {
    const policy = this.policyCache[variblePath]
    const cacheKey = `${token}/${policy}`
    return cacheKey
  }
}

class CacheInfo {
  requestTimestampsMs: number[] = []
  lastRequestRateLimitInfo: PoeRateLimitInfo = null
}
