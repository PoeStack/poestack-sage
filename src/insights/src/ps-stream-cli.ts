import 'reflect-metadata'

require('dotenv').config()

import { container } from 'tsyringe'

import {
  GGGStashStreamProvider,
  PublicStashStreamProvider
} from './services/public-stash-stream-providers'
import ItemGroupingService from './services/item-grouping-service'
import Redis from 'ioredis'
import { PoeApiPublicStashResponse } from './gql/__generated__/resolvers-types'
import * as process from 'process'

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

;(async () => {
  const streamProvider: PublicStashStreamProvider = container.resolve(GGGStashStreamProvider)
  await streamProvider.init()

  const itemGroupingService = container.resolve(ItemGroupingService)

  console.log('redis url', process.env['REDIS_URL'])
  const client = new Redis({
    host: process.env['REDIS_URL'],
    port: 6379,
    tls: undefined
  })

  for (;;) {
    try {
      const data: PoeApiPublicStashResponse = await streamProvider.nextUpdate()
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
              const group = itemGroupingService.findOrCreateItemGroup(item)
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
  }
})()
