import { HttpUtil, ItemGroupingService, PoePublicStashResponse } from 'sage-common'
import { debounceTime, from, of, Subject, throttleTime } from 'rxjs'
import process from 'process'
import Redis from 'ioredis'
import AWS from 'aws-sdk'

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


AWS.config.update({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var storeCount = 0
function storeKey(key: string) {
  if (storeCount++ < 100) {
    return
  }
  storeCount = 0

  var params = {
    TableName: 'RuntimeConfig',
    Item: {
      "key": "last-psstream-key",
      value: key
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

const itemGroupingService = new ItemGroupingService()
const resultsSubject = new Subject<PoePublicStashResponse>()

resultsSubject.pipe(debounceTime(1000)).subscribe((e) => {
  console.log('loading', e.next_change_id)
  storeKey(e.next_change_id)
  loadChanges(e.next_change_id).subscribe((e) => {
    resultsSubject.next(e)
  })
})

console.log('redis url', process.env['REDIS_URL'])
const client = new Redis({
  host: process.env['REDIS_URL'] ?? 'localhost',
  port: 6379,
  tls: undefined
})
resultsSubject.subscribe((data) => {
  try {
    if (data?.stashes) {
      const dateMs = Date.now()
      const dateTruncatedMins = Math.round(dateMs / 1000 / 60)
      let updates = 0
      const multi = client.multi()
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

        for (const [itemGroupHashString, data] of Object.entries(toWrite)) {
          updates++
          const shard = parseInt(itemGroupHashString, 16) % 5
          multi.hset(
            `psev6:${data.tag}:${shard}:${stashData.league}`,
            `${itemGroupHashString}:${stashData.accountName}`,
            `${dateTruncatedMins},${data.stackSize},${data.value},${data.currencyType}`
          )
        }
      }

      if (updates > 0) {
        multi
          .exec()
          .catch((e) => {
            console.log('error in write', e)
          })
          .finally(() => {
            console.log('finished', updates, 'updates in', Date.now() - dateMs, 'ms')
          })
      }
    }
  } catch (error) {
    console.error(error)
  }
})

resultsSubject.subscribe((e) => console.log('got', e.stashes?.length))



from(docClient.get({ TableName: "RuntimeConfig", Key: { key: "last-psstream-key" } }).promise())
  .subscribe((e) => {
    console.log("got doc response", e.Item)
    const nextKey = e.Item?.value

    resultsSubject.next({
      next_change_id: nextKey,
      stashes: []
    })
  })

