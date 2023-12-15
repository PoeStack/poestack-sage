import Redis from "ioredis"
import { forkJoin, from, last, mergeMap, of, tap } from "rxjs"
import { scanKeys } from "./utils"
import AWS from "aws-sdk"
import { HttpUtil } from "sage-common"

const client = new Redis(process.env['REDIS_URL'])

const s3bucket = new AWS.S3({
  endpoint: `https://ba6907efee089553d98ee287a30bd17a.r2.cloudflarestorage.com`,
  accessKeyId: process.env['R2_ACCESS_KEY_ID'],
  secretAccessKey: process.env['R2_SECRET'],
  signatureVersion: 'v4'
})


const outOverview = { shards: [] }

scanKeys(client, 'gss:*').pipe(
  mergeMap((key) => {
    const splitKey = key.split(":")
    const mappedKey = `${splitKey[1].replaceAll(" ", "_")}_${splitKey[2]}`
    outOverview.shards.push(mappedKey)
    return forkJoin({
      groups: client.hgetall(key),
      key: of(mappedKey),
    })
  }, 5),
  mergeMap((summary) => {
    const out = {}
    Object.entries(summary.groups).forEach(([k, v]) => {
      out[k] = JSON.parse(v)
    })
    return from(
      s3bucket
        .putObject({
          Bucket: 'insights-public',
          Key: `v7/summaries/${summary.key}.json`,
          Body: JSON.stringify(out),
          ContentType: 'application/json'
        })
        .promise()
    )
  }),
  last(),
  mergeMap(() => {
    return from(
      s3bucket
        .putObject({
          Bucket: 'insights-public',
          Key: `v7/summary.json`,
          Body: JSON.stringify(outOverview),
          ContentType: 'application/json'
        })
        .promise()
    )
  })
).subscribe((r) => {
  console.log("done")
  client.disconnect(false)
})
