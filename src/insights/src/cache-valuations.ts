import * as AWS from 'aws-sdk'
import Redis from 'ioredis'
import {
  catchError,
  concatMap,
  forkJoin,
  from,
  groupBy,
  last,
  map,
  mergeMap,
  Observable,
  of,
  reduce,
  tap,
  toArray
} from 'rxjs'
import * as process from 'process'
import percentile from 'percentile'
import { scanKeys, twoDecimals } from './utils'
import { HttpUtil } from 'sage-common'
import _, { Dictionary, parseInt } from 'lodash'
import { logDiscord } from './discord-log-util'

const client = new Redis(process.env['REDIS_URL'])
const logOutput = {
  itemsTracked: 0,
  lcItemsTracked: 0,
  listingEvaluated: 0,
  divValue: null
}

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
  lc?: boolean | null | undefined
  h: number[]
  d: number[]
}

type GroupValuation = {
  league: string
  tag: string
  itemGroupHash: string
  valuation: Valuation
}

let divValues: { [league: string]: Valuation } = {}
function valueListings(league: string, listings: Listing[]): Valuation {
  const divChaosValue = divValues[league]?.c[3]
  const filteredListings = listings.filter((e) => !isNaN(e.value))
  logOutput.listingEvaluated += filteredListings.length
  const convertedListings = filteredListings
    .map((e) => {
      if (e.valueCurrency === 'd' && divChaosValue > 10) {
        return { ...e, valueCurrency: 'c', value: e.value * divChaosValue }
      }
      return e
    })
    .filter((e) => !!e)
  const values = convertedListings
    .map((e) => e.value)
    .sort((a, b) => a - b)

  const out: Valuation = { l: filteredListings.length, c: [], h: [], d: [] }
  let filteredValues = values
  if (values.length > 30) {
    const filterSize = Math.floor(values.length * .03)
    filteredValues = values.slice(filterSize, -filterSize)
  } else {
    logOutput.lcItemsTracked += 1
    out.lc = true
  }

  const result = percentile([5, 7, 10, 12, 15, 18, 20, 25, 30, 50], filteredValues) as number[]
  out.c = result.map((e) => twoDecimals(e))


  logOutput.itemsTracked += 1
  return out
}

const httpUtil = new HttpUtil()
const valuationSummary = {}

function recordsToListings(r: Record<string, string>): Listing[] {
  return Object.entries(r).map(([k, v]) => {
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
  })
}

function storeListings(league: string, tag: string, listings: Dictionary<Listing[]>) {
  const out = { meta: { league, tag }, listings: {} }
  Object.entries(listings).forEach(([a, b]) => {
    out.listings[a] = b.map((listing) => ({
      p: listing.profileName,
      t: listing.timestamp,
      q: listing.quantity,
      c: listing.valueCurrency,
      v: listing.value
    }))
  })

  return from(
    s3bucket
      .putObject({
        Bucket: 'insights-public',
        Key: `v10/listings/${league}/${tag}.json`,
        Body: JSON.stringify(out),
        ContentType: 'application/json'
      })
      .promise()
  )
}

function valueTagLeague(tag: string, league: string) {
  return scanKeys(client, `psev9:${tag}:${league}:*`).pipe(
    mergeMap((key) => client.hgetall(key)),
    mergeMap((r) => recordsToListings(r)),
    toArray(),
    map((listings) => {
      const groupedListings = _.groupBy(listings, (e) => e.itemGroupHash)
      storeListings(league, tag, groupedListings).subscribe()

      const out = { meta: { league, tag, timestampMs: Date.now() }, valuations: {} }
      Object.entries(groupedListings).forEach(([groupHash, listings]) => {
        const valuation = valueListings(league, listings)
        if (valuation.c[3] > 0) {
          _.set(valuationSummary, `${groupHash}.${league}`, valuation.c[3])
        }
        out.valuations[groupHash] = valuation
      })

      return out
    }),
    mergeMap((valuations) => {
      const storageKey = `v10/valuations/${valuations.meta.league}/${valuations.meta.tag}.json`
        .replaceAll(' ', '_')
        .toLowerCase()

      return forkJoin({
        currentShard: httpUtil
          .get(`https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/${storageKey}`)
          .pipe(catchError((e) => of(null)))
      }).pipe(
        concatMap((source) => {
          const currentShard: any = source.currentShard

          const output = {
            meta: {
              divChaosValue: divValues[valuations.meta.league]?.c[3],
              ...valuations.meta
            },
            valuations: {}
          }

          const entries: [string, Valuation][] = Object.entries(valuations.valuations)
          for (const [hash, valuation] of entries) {
            const currentValuation = currentShard?.valuations[hash]
            const currentPrimaryValuation = valuation?.c?.[3] ?? null

            const hourlyHistory = currentValuation?.h ?? []
            if (process.env['UPDATE_HISTORY_HOURLY'] === 'true') {
              hourlyHistory.push(currentPrimaryValuation)
            }
            valuation.h = hourlyHistory.slice(-48)

            const dayilyHistory = currentValuation?.d ?? []
            if (new Date().getUTCHours() === 2 || new Date().getUTCHours() == 2) {
              dayilyHistory.push(currentPrimaryValuation)
            }
            valuation.d = dayilyHistory

            output.valuations[hash] = valuation
          }

          return from(
            s3bucket
              .putObject({
                Bucket: 'insights-public',
                Key: storageKey,
                Body: JSON.stringify(output),
                ContentType: 'application/json'
              })
              .promise()
          )
        })
      )
    })
  )
}

function valueTag(tag: string, leagues: string[]) {
  return from(leagues).pipe(mergeMap((league) => valueTagLeague(tag, league)))
}

function loadDivValues() {
  const divineOrbHash = 'cceb40e33d9237cb6a06037e739e40aa9a548c70'
  const divineOrbShard = parseInt(divineOrbHash, 16) % 11
  return scanKeys(client, `psev9:currency:*:${divineOrbShard}`).pipe(
    mergeMap((k) =>
      from(client.hgetall(k)).pipe(
        map((r) => {
          return {
            league: k,
            listings: recordsToListings(r).filter((e) => e.itemGroupHash === divineOrbHash)
          }
        })
      )
    ),
    toArray(),
    map((records) => {
      const out = {}
      records.forEach((r) => {
        const league = r.league.split(':')[2]
        const valuation = valueListings(league, r.listings)
        out[league] = valuation
      })
      logOutput.divValue = out
      return out
    })
  )
}

function loadTagsAndLeagues() {
  return scanKeys(client, 'psev9:*').pipe(
    reduce(
      (p, n) => {
        const [__, tag, league] = n.split(':')
        return { tags: _.uniq([...p.tags, tag]), leagues: _.uniq([...p.leagues, league]) }
      },
      { tags: [], leagues: [] }
    )
  )
}

forkJoin({
  tagsAndLeagues: loadTagsAndLeagues(),
  divineOrbValues: loadDivValues()
}).subscribe((ctx) => {
  divValues = ctx.divineOrbValues
  from(ctx.tagsAndLeagues.tags)
    .pipe(
      mergeMap((tag) => valueTag(tag, ctx.tagsAndLeagues.leagues), 10),
      last(),
      mergeMap(() =>
        from(
          s3bucket
            .putObject({
              Bucket: 'insights-public',
              Key: 'v10/valuations_summary.json',
              Body: JSON.stringify(valuationSummary),
              ContentType: 'application/json'
            })
            .promise()
        )
      )
    )
    .subscribe((e) => {
      logDiscord("Insights - Cache Valuations", JSON.stringify(logOutput, null, 2)).subscribe()
      client.disconnect(false)
    })
})
