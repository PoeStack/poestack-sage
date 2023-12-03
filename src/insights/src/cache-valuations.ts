import * as AWS from 'aws-sdk'
import Redis from 'ioredis'
import { from, groupBy, map, mergeMap, Observable, of, tap, toArray } from 'rxjs'
import * as process from 'process'
import percentile from 'percentile'
import { scanKeys } from './utils'

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
  pvs: number[]
  l: number
}

type GroupValuation = {
  league: string
  tag: string
  itemGroupHash: string
  valuation: Valuation
}

function valueListings(listings: Listing[]): Observable<Valuation> {
  const filteredListings = listings.filter((e) => !isNaN(e.value))
  const convertedListings = filteredListings.map((e) => {
    if (e.valueCurrency === 'd') {
      return { ...e, valueCurrency: 'c', value: e.value * 240 }
    }
    return e
  })
  const values = convertedListings.map((e) => e.value).sort((a, b) => a - b)
  const result = percentile(
    [1, 5, 7, 10, 12, 15, 18, 20, 25, 30, 40, 50, 70, 95, 99],
    values
  ) as number[]

  return of({ l: filteredListings.length, pvs: result })
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

function writeShard(e: { key: string; valuations: GroupValuation[] }) {
  const output = {
    timestampMs: Date.now(),
    valuations: {}
  }

  for (const valuation of e.valuations) {
    output.valuations[valuation.itemGroupHash] = valuation.valuation
  }

  return from(
    s3bucket
      .putObject({
        Bucket: 'insights-public',
        Key: `v4/${e.key.replaceAll(' ', '_')}.json`,
        Body: JSON.stringify(output),
        ContentType: 'application/json'
      })
      .promise()
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
