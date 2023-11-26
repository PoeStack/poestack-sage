import { HttpUtil, ItemGroupingService, PoePublicStashResponse } from 'sage-common'
import objectHash from 'object-hash'
import { debounceTime, from, Subject } from 'rxjs'
import process from 'process'
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { listings } from './consume-schema';
import fs from "fs"
import AWS from 'aws-sdk';
import { SQLiteInsertBase } from 'drizzle-orm/sqlite-core';

const sqlClient = createClient({ url: "file:psstream-3.db" })
const listingsDb = drizzle(sqlClient)
migrate(listingsDb, { migrationsFolder: 'src/insights/test.sql' })

const divineTypes = new Set(['d', 'div', 'divine'])
const chaosTypes = new Set(['c', 'chaos'])
const extractCurrencyType = (currencyTypeRaw: string): string | null => {
  const formattedType = currencyTypeRaw?.trim()?.toLowerCase()

  if (!formattedType?.length) return null
  if (chaosTypes.has(formattedType)) return 'c'
  if (divineTypes.has(formattedType)) return 'd'

  return null
}

function twoDecimals(n) {
  const log10 = n ? Math.floor(Math.log10(n)) : 0,
    div = log10 < 0 ? Math.pow(10, 1 - log10) : 100

  return Math.round(n * div) / div
}

const extractCurrencyValue = (currencyValueRaw: string): string | null => {
  try {
    let numericValue: number
    if (currencyValueRaw.includes('/')) {
      const split = currencyValueRaw.split('/')
      numericValue = parseFloat(split[0]) / parseFloat(split[1])
    } else {
      numericValue = parseFloat(currencyValueRaw)
    }

    if (numericValue) {
      return twoDecimals(numericValue).toString()
    }
  } catch (e) {
    // @ts-ignore
  }
  return null
}

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
function uploadDbToS3() {
  try {

    const fileStream = fs.createReadStream("psstream-3.db");

    // Upload the file to a specified bucket
    const uploadParams = {
      Bucket: "sage-insights-cache",
      Key: `test-${Date.now()}.db`,
      Body: fileStream,
    };

    s3.upload(uploadParams, function(err, data) {
      if (err) {
        console.log("s3 upload error", err);
      } if (data) {
        console.log("s3 upload success", data.Location);
      }
    });
  } catch (error) {
    console.log("s3 upload error 2", error);
  }
}



const httpUtil = new HttpUtil()

function loadChanges(paginationCode: string) {
  return httpUtil.get<PoePublicStashResponse>(
    `https://api.pathofexile.com/public-stash-tabs?id=${paginationCode}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GGG_SERVICE_AUTH_TOKEN}`,
        'User-Agent': 'OAuth poestack/1.0.0 (contact: zgherridge@gmail.com)'
      }
    }
  )
}

const itemGroupingService = new ItemGroupingService()
const resultsSubject = new Subject<PoePublicStashResponse>()
resultsSubject.pipe(debounceTime(3000)).subscribe((e) => {
  console.log('loading', e.next_change_id)
  loadChanges(e.next_change_id).subscribe((e) => {
    resultsSubject.next(e)
  })
})

resultsSubject.subscribe((data) => {
  try {
    if (data?.stashes) {
      const dateMs = Date.now()
      const dateTruncatedMins = Math.round(dateMs / 1000 / 60)
      let updates = 0
      for (const stashData of data.stashes) {
        if (
          !stashData.league ||
          stashData.league.includes('(PL') ||
          stashData.league.includes('SSF ') ||
          stashData.league.includes('Ruthless ')
        ) {
          continue
        }

        const toWrite: Record<
          string,
          {
            stackSize: number
            value: string
            currencyType: string
            tag: string
          }
        > = {}
        for (const item of stashData.items) {
          const note = item.note ?? item.forum_note ?? stashData.stash
          if (note.length > 3 && (note.includes('~b/o ') || note.includes('~price '))) {
            const group = itemGroupingService.group(item)
            if (group) {
              if (!toWrite[group.hash]) {
                toWrite[group.hash] = {
                  stackSize: 0,
                  value: '',
                  currencyType: '',
                  tag: group.tag
                }
              }

              const noteSplit = note.trim().split(' ')
              const valueString = extractCurrencyValue(noteSplit[1])
              const currencyType = extractCurrencyType(noteSplit[2])

              if (valueString?.length && currencyType?.length) {
                const doc = toWrite[group.hash]

                doc.stackSize = toWrite[group.hash].stackSize + (item.stackSize ?? 1)
                doc.value = valueString
                doc.currencyType = currencyType
              }
            }
          }
        }

        const batch = Object.entries(toWrite).map(([itemGroupHashString, data]) => {
          updates++
          const shard = parseInt(itemGroupHashString, 16) % 5

          const id = objectHash({
            l: stashData.league,
            a: stashData.accountName,
            g: itemGroupHashString
          })

          const insert = listingsDb.insert(listings).values({
            id: id,
            listedAtTimestamp: Date.now(),
            shard: `${data.tag}-${shard}`,
            itemGroupHashString: itemGroupHashString,
            value: data.value,
            valueType: data.currencyType,
            quantity: data.stackSize
          }).onConflictDoUpdate({
            target: listings.id,
            set: {
              listedAtTimestamp: Date.now(),
              value: data.value,
              valueType: data.currencyType,
              quantity: data.stackSize
            }
          })

          return insert
        })
        from(listingsDb.batch(batch as unknown as any)).subscribe()
      }
    }
  } catch (error) {
    console.error(error)
  }
})


var resultCounter = 0
resultsSubject.subscribe((e) => {
  console.log("got result", resultCounter)
  if (resultCounter++ > 20) {
    resultCounter = 0
    console.info("starting s3 write")
    uploadDbToS3()
  }
})

resultsSubject.next({
  next_change_id: '2169196834-2160857942-2091476413-2321414968-2254238271',
  stashes: []
})
