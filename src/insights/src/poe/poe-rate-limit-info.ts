export default class PoeRateLimitInfo {
  rules: string[]
  policy: string
  limits: PoeRateLimit[]
  timestampMs: number
  retryAfterMs: number
}

export class PoeRateLimit {
  maximumHitsCount: number
  periodTestedMs: number
  potentialTimePenaltyMs: number
  currentHitsCount: number
  currentTimePenaltyMs: number
}
