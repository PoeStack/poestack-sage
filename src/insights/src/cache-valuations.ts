import * as AWS from 'aws-sdk'
import Redis from 'ioredis'
import { catchError, concatMap, forkJoin, from, groupBy, map, mergeMap, Observable, of, tap, toArray } from 'rxjs'
import * as process from 'process'
import percentile from 'percentile'
import { scanKeys, twoDecimals } from './utils'
import { HttpUtil } from 'sage-common'

const client = new Redis(process.env['REDIS_URL'])

const s3bucket = new AWS.S3({
  endpoint: `https://ba6907efee089553d98ee287a30bd17a.r2.cloudflarestorage.com`,
  accessKeyId: process.env['R2_ACCESS_KEY_ID'],
  secretAccessKey: process.env['R2_SECRET'],
  signatureVersion: 'v4'
})

type Listing = {
  itemGroupHash: string
  profileName: string
  timestamp: number
  quantity: number
  value: number
  valueCurrency: string
}

type Valuation = {
  c: number[]
  l: number
  h: number[]
  d: number[]
  s?: any | undefined
}

type GroupValuation = {
  league: string
  tag: string
  itemGroupHash: string
  valuation: Valuation
}

var divChaosValue = 240
function valueListings(listings: Listing[]): Observable<Valuation> {
  const filteredListings = listings.filter((e) => !isNaN(e.value))
  const convertedListings = filteredListings.map((e) => {
    if (e.valueCurrency === 'd') {
      return { ...e, valueCurrency: 'c', value: e.value * divChaosValue }
    }
    return e
  })
  const values = convertedListings.map((e) => e.value).sort((a, b) => a - b)
  const result = percentile(
    [5, 7, 10, 12, 15, 18, 20, 25, 30, 50],
    values
  ) as number[]
  const mappedResults = result.map((e) => twoDecimals(e))

  return of({ l: filteredListings.length, c: mappedResults, h: [], d: [] })
}

function valueShard(shardKey: string): Observable<{ key: string; valuations: GroupValuation[] }> {
  const [version, tag, shard, league] = shardKey.split(':')

  return from(client.hgetall(shardKey)).pipe(
    mergeMap((e) => Object.entries(e)),
    map(([k, v]): Listing => {
      const [hash, profileName] = k.split(':')
      const [timestamp, quantity, value, valueCurrency] = v.split(',')

      return {
        itemGroupHash: hash,
        profileName: profileName,
        quantity: parseInt(quantity),
        timestamp: parseInt(timestamp),
        value: parseFloat(value),
        valueCurrency: valueCurrency
      }
    }),
    groupBy((e) => e.itemGroupHash),
    mergeMap((e) =>
      e.pipe(
        toArray(),
        mergeMap((listings) => valueListings(listings)),
        map(
          (v): GroupValuation => ({
            league: league,
            itemGroupHash: e.key,
            tag: tag,
            valuation: v
          })
        )
      )
    ),
    toArray(),
    map((e) => ({ key: `${tag}_${shard}_${league}`, valuations: e }))
  )
}

const httpUtil = new HttpUtil()
function writeShard(e: { key: string; valuations: GroupValuation[] }) {
  const [tag, shard, league] = e.key.split("_")
  const shardKey = `v6/${e.key.replaceAll(' ', '_')}.json`

  return forkJoin({
    currentShard: httpUtil.get(`https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/${shardKey}`).pipe(catchError((e) => of(null))),
    shardSummary: from(client.hgetall(`gss:${tag}:${shard}`)).pipe(catchError((e) => of(null)))
  }).pipe(
    concatMap((source) => {
      const currentShard: any = source.currentShard

      const output = {
        metadata: {
          divineChaosValue: divChaosValue,
          timestampMs: Date.now(),
        },
        valuations: {},
      }

      for (const valuation of e.valuations) {
        const currentValuation = currentShard?.valuations[valuation.itemGroupHash]
        if (process.env['UPDATE_HISTORY_HOURLY'] === "true") {
          const history = currentValuation?.h ?? []
          history.push(valuation.valuation.c[3])
          valuation.valuation.h = history.slice(-48)
        }

        if (process.env['UPDATE_HISTORY_DAILY'] === "true") {
          const history = currentValuation?.d ?? []
          history.push(valuation.valuation.c[3])
          valuation.valuation.d = history
        }

        const summary = source.shardSummary[valuation.itemGroupHash]
        if (summary) {
          valuation.valuation.s = JSON.parse(summary)
        }

        output.valuations[valuation.itemGroupHash] = valuation.valuation
      }

      return from(
        s3bucket
          .putObject({
            Bucket: 'insights-public',
            Key: shardKey,
            Body: JSON.stringify(output),
            ContentType: 'application/json'
          })
          .promise()
      )
    })
  )
}

scanKeys(client, 'psev6:*')
  .pipe(
    tap((e) => console.log('starting', e)),
    mergeMap((e) => valueShard(e), 5),
    tap((e) => console.log('writing', e.key, e.valuations.length)),
    mergeMap((e) => writeShard(e), 5)
  )
  .subscribe({
    complete: () => {
      client.disconnect(false)
    }
  })
