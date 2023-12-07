import { Observable } from 'rxjs'
import Redis from 'ioredis'

export function twoDecimals(n: number) {
  const log10 = n ? Math.floor(Math.log10(n)) : 0,
    div = log10 < 0 ? Math.pow(10, 1 - log10) : 100

  return Math.round(n * div) / div
}

export function scanKeys(client: Redis, pattern: string): Observable<string> {
  return new Observable<string>((sub) => {
    const scan = client.scanStream({ match: pattern })
    scan.on('data', (keys) => {
      for (const key of keys) {
        sub.next(key)
      }
    })

    scan.on('error', (error) => {
      sub.error(error)
    })

    scan.on('end', () => {
      sub.complete()
    })
  })
}
