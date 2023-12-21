import Redis from 'ioredis'
import { forkJoin, from, last, mergeMap, of, tap } from 'rxjs'
import { scanKeys } from './utils'
import AWS from 'aws-sdk'
import { HttpUtil } from 'sage-common'
import _ from 'lodash'

const client = new Redis(process.env['REDIS_URL'])

const s3bucket = new AWS.S3({
  endpoint: `https://ba6907efee089553d98ee287a30bd17a.r2.cloudflarestorage.com`,
  accessKeyId: process.env['R2_ACCESS_KEY_ID'],
  secretAccessKey: process.env['R2_SECRET'],
  signatureVersion: 'v4'
})

const outOverview = { tags: [] }
const httpUtil = new HttpUtil()
httpUtil
  .get<{ [key: string]: { [league: string]: number } }>(
    'https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/v10/valuations_summary.json'
  )
  .subscribe({
    error(err) {
      console.log(err)
    },
    next: (valuationSummary) => {
      scanKeys(client, 'igs:*')
        .pipe(
          mergeMap((key) => {
            const splitKey = key.split(':')
            const tag = splitKey[1].replaceAll(' ', '_')
            outOverview.tags.push(tag)
            return forkJoin({
              groups: client.hgetall(key),
              tag: of(tag)
            })
          }, 5),
          mergeMap((summary) => {
            const out = { meta: { tag: summary.tag, timestampMs: Date.now() }, summaries: {} }
            Object.entries(summary.groups).forEach(([k, v]) => {
              console.log('vs', valuationSummary[k])
              out.summaries[k] = { ...JSON.parse(v), v: valuationSummary[k] }
            })
            return from(
              s3bucket
                .putObject({
                  Bucket: 'insights-public',
                  Key: `v10/summaries/${summary.tag}.json`,
                  Body: JSON.stringify(out),
                  ContentType: 'application/json'
                })
                .promise()
            )
          })
        )
        .subscribe({
          error(err) {
            console.log(err)
          },
          complete() {
            outOverview.tags = _.uniq(outOverview.tags)
            from(
              s3bucket
                .putObject({
                  Bucket: 'insights-public',
                  Key: `v10/meta.json`,
                  Body: JSON.stringify(outOverview),
                  ContentType: 'application/json'
                })
                .promise()
            ).subscribe(() => {
              console.log('done')
              client.disconnect(false)
            })
          }
        })
    }
  })
