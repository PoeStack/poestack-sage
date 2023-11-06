import { from, map, mergeMap, tap, toArray } from 'rxjs'
import { scanKeys } from './utils'
import Redis from 'ioredis'
import process from 'process'

const client = new Redis({
  host: process.env['REDIS_URL'],
  port: 6379,
  tls: undefined
})

scanKeys(client, 'psev6:*')
  .pipe(
    mergeMap((e) =>
      from(client.hgetall(e)).pipe(map((r) => ({ key: e, listings: Object.entries(r) })))
    ),
    map((e) => {
      const expiredListings = e.listings.filter(([k, v]) => {
        const timestampMs = parseInt(v.split(',')[0]) * 60 * 1000
        const ageMs = Date.now() - timestampMs
        return ageMs > 1000 * 60 * 60 * 48
      })
      return { key: e.key, expiredListings }
    }),
    toArray(),
    mergeMap((e) => {
      const multi = client.multi()
      let removals = 0
      e.filter((e) => e.expiredListings.length > 0).forEach((e) => {
        removals++
        multi.hdel(e.key, ...e.expiredListings.map((x) => x[0]))
      })
      console.log('removing', removals, 'listings')
      return from(multi.exec())
    })
  )
  .subscribe({
    complete: () => {
      client.disconnect(false)
    }
  })
