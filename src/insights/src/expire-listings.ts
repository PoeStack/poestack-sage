import {from, map, mergeMap, tap, toArray} from 'rxjs'
import {scanKeys} from './utils'
import Redis from 'ioredis'
import process from 'process'
import {keys} from "lodash";

const client = new Redis({
  host: process.env['REDIS_URL'],
  port: 6379,
  tls: undefined
})

scanKeys(client, 'psev6:*')
  .pipe(
    mergeMap((e) =>
      from(client.hgetall(e)).pipe(map((r) => ({key: e, listings: Object.entries(r)})))
    ),
    map((e) => {
      const mappedListings = e.listings.map(([k, v]) => {
        const timestampMs = parseInt(v.split(',')[0]) * 60 * 1000
        const ageMs = Date.now() - timestampMs
        return {key: k, ageMs: ageMs}
      })
      mappedListings.sort((a, b) => b.ageMs - a.ageMs)

      const expiredListings: string [] = []
      const validListings = mappedListings
        .filter((l) => {
          if (l.ageMs < 1000 * 60 * 60 * 48) {
            return true;
          } else {
            expiredListings.push(l.key);
            return false
          }
        })

      expiredListings.push(...validListings.slice(30).map((l) => l.key))

      return {key: e.key, expiredListings}
    }),
    toArray(),
    mergeMap((e) => {
      const multi = client.multi()
      let removals = 0
      e.filter((e) => e.expiredListings.length > 0).forEach((e) => {
        removals++
        multi.hdel(e.key, ...e.expiredListings.map((x) => x))
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
