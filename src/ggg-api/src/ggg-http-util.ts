import { BehaviorSubject, Observable } from 'rxjs'
import axios from 'axios'
import { RateLimitError } from 'sage-common'

export class GggRateLimiter {
  policyCache: { [rateLimitKey: string]: string } = {}
  rulecache: { [policy: string]: { lookbackSeconds: number; maximumHits: number }[] } = {}
  policyRequestLog: { [policy: string]: number[] } = {}
  policyDelay: { [policy: string]: number } = {}

  public getCurrentDelay(rateLimitKey: string): number {
    const policy = this.policyCache[rateLimitKey]
    const rules = this.rulecache[policy ?? '']

    console.log('checking current delay for', rateLimitKey, policy, rules)

    if (!policy || !rules) {
      return 0
    }

    const currentDelay = (this.policyDelay[policy] ?? 0) - Date.now()
    if (currentDelay > 0) {
      return currentDelay
    }

    const requesLog = this.policyRequestLog[policy] ?? []
    for (const rule of rules) {
      const windowStart = Date.now() - (rule.lookbackSeconds + 3) * 1000
      const requestsInWindow = requesLog.filter((e) => e > windowStart)
      console.log('checking', rule.lookbackSeconds, requestsInWindow.length, rule.maximumHits)

      if (requestsInWindow.length >= rule.maximumHits - 1) {
        const oldestRequestAge = (Date.now() - Math.min(...requestsInWindow)) / 1000
        const delay = Math.max((rule.lookbackSeconds - oldestRequestAge) * 1000 + 1000, 1000)
        console.log('request would exceed maximumHits', oldestRequestAge, delay)
        return delay
      }
    }

    return 0
  }

  public recordRequestStart(rateLimitKey: string) {
    const policy = this.policyCache[rateLimitKey]
    if (policy) {
      if (!this.policyRequestLog[policy]) {
        this.policyRequestLog[policy] = []
      }
      this.policyRequestLog[policy].unshift(Date.now())
    }
  }

  public recordRequest(rateLimitKey: string, headers: { [key: string]: string }) {
    const policy: string = headers['x-rate-limit-policy']
    this.policyCache[rateLimitKey] = policy

    if (headers['retry-after']) {
      this.policyDelay[policy] = Date.now() + parseInt(headers['retry-after']) * 1000
    }

    if (!this.rulecache[policy]) {
      const ruleHeaders = headers['x-rate-limit-rules']?.split(',') ?? []
      const allRulesRaw = ruleHeaders.flatMap((ruleHeader) =>
        headers[`x-rate-limit-${ruleHeader.toLowerCase()}`].split(',')
      )
      const rules = allRulesRaw.map((raw) => {
        const splitRule = raw.split(':')
        const maximumHits = parseInt(splitRule[0])
        const lookbackSeconds = parseInt(splitRule[1])
        return { maximumHits, lookbackSeconds }
      })
      this.rulecache[policy] = rules
    }
  }
}

export class GggHttpUtil {
  public tokenSubject$ = new BehaviorSubject(process.env['GGG_TOKEN'])
  public gggApiEndpoint = process.env['GGG_API_ENDPOINT'] ?? 'https://api.pathofexile.com'

  private reatelimiter = new GggRateLimiter()
  private client = axios.create({ adapter: 'http' })

  public get<T>(rateLimitKey: string, path: string): Observable<T> {
    return new Observable((observer) => {
      const currentDelay = this.reatelimiter.getCurrentDelay(rateLimitKey)
      if (currentDelay > 0) {
        observer.error(new RateLimitError(currentDelay))
        observer.complete()
      } else {
        this.reatelimiter.recordRequestStart(rateLimitKey)
        this.client
          .get(`${this.gggApiEndpoint}${path}`, {
            headers: {
              Authorization: `Bearer ${this.tokenSubject$.value}`,
              'User-Agent': 'OAuth poestack/2.0.0 (contact: zgherridge@gmail.com)'
            }
          })
          .then((response) => {
            console.log('GGG response', path, response.status)
            console.log('ggg headers', response.headers)
            this.reatelimiter.recordRequest(rateLimitKey, response.headers as unknown as any)
            observer.next(response.data)
            observer.complete()
          })
          .catch((error) => {
            console.log('GGG response - error')
            this.reatelimiter.recordRequest(rateLimitKey, error.response.headers)

            if (error.response.status === 429) {
              observer.error(
                new RateLimitError(parseInt(error.response.headers['retry-after']) * 1000)
              )
            } else {
              observer.error(error)
            }

            observer.complete()
          })
      }
    })
  }
}
