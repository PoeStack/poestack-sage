export class RateLimitError extends Error {
  retryAfterMs: number

  constructor(retryAfterMs: number) {
    super()
    this.retryAfterMs = retryAfterMs
  }
}
