import { PoeItem, PoeItemProperty } from 'sage-common'
import { Rarity } from '../assets/theme'
import {
  IChildStashTab,
  ICompactTab,
  IStashTab,
  IStashTabNode
} from '../interfaces/stash.interface'
import { v4 as uuidv4 } from 'uuid'
import { IPricedItem } from '../interfaces/priced-item.interface'
import { IItem } from '../interfaces/item.interface'
import { IValuatedItem, IValuatedStash } from '../interfaces/snapshot.interface'
import { StashTab } from '../store/domains/stashtab'
import { SageValuation } from 'echo-common'

const rarities: (keyof Rarity)[] = [
  'normal', //0
  'magic', //1
  'rare', //2
  'unique', //3
  'gem', //4
  'currency', //5
  'divination', //6
  'quest', //7
  'unknown', //8
  'legacy' //9
]

export const getRarity = (identifier: number): keyof Rarity => {
  if (identifier < rarities.length) {
    return rarities[identifier]
  } else {
    return rarities[0]
  }
}

export const getRarityIdentifier = (name: string): number => {
  return rarities.indexOf(name as keyof Rarity)
}

export const parseTabNames = (tabs: ICompactTab[]) => {
  return tabs.map((t) => t.name).join(', ')
}

export const getItemName = (name?: string, typeline?: string) => {
  let itemName = name || ''
  if (typeline) {
    itemName += ' ' + typeline
  }
  return itemName.replace('<<set:MS>><<set:M>><<set:S>>', '').trim()
}

export const getPropertyValue = (props: PoeItemProperty[], key: string) => {
  const prop = props.find((t) => t.name === key)
  const quality = prop && prop.values ? prop.values[0][0] : '0'
  return parseInt(quality, 10)
}

export const getQuality = (props?: PoeItemProperty[]) => {
  if (!props) return 0
  return getPropertyValue(props, 'Quality')
}

export const getLevel = (props?: PoeItemProperty[]) => {
  if (!props) return 0
  return getPropertyValue(props, 'Level')
}

export const getMapTier = (props?: PoeItemProperty[]) => {
  if (!props) return 0
  return getPropertyValue(props, 'Map Tier')
}

export function getLinks(array: any[]) {
  const numMapping: any = {}
  let greatestFreq = 0
  array.forEach((number) => {
    numMapping[number] = (numMapping[number] || 0) + 1

    if (greatestFreq < numMapping[number]) {
      greatestFreq = numMapping[number]
    }
  })
  return greatestFreq
}

const specialMapImplicitsToMapName: { [key: string]: string } = {
  "Map contains Al-Hezmin's Citadel\nItem Quantity increases amount of Rewards Al-Hezmin drops by 20% of its value":
    "Al-Hezmin's Map",
  "Map contains Veritania's Citadel\nItem Quantity increases amount of Rewards Veritania drops by 20% of its value":
    "Veritania's Map",
  "Map contains Baran's Citadel\nItem Quantity increases amount of Rewards Baran drops by 20% of its value":
    "Baran's Map",
  "Map contains Drox's Citadel\nItem Quantity increases amount of Rewards Drox drops by 20% of its value":
    "Drox's Map",
  'Map is occupied by The Purifier': "Purifier's Map",
  'Map is occupied by The Constrictor': "Constrictor's Map",
  'Map is occupied by The Enslaver': "Enslaver's Map",
  'Map is occupied by The Eradicator': "Eradicator's Map"
}

const mapStashSpecialMapsToImplicits: { [key: string]: string } = {
  'Al-Hezmin, The Hunter':
    "Map contains Al-Hezmin's Citadel\nItem Quantity increases amount of Rewards Al-Hezmin drops by 20% of its value",
  'Veritania, The Redeemer':
    "Map contains Veritania's Citadel\nItem Quantity increases amount of Rewards Veritania drops by 20% of its value",
  'Baran, The Crusader':
    "Map contains Baran's Citadel\nItem Quantity increases amount of Rewards Baran drops by 20% of its value",
  'Drox, The Warlord':
    "Map contains Drox's Citadel\nItem Quantity increases amount of Rewards Drox drops by 20% of its value",
  'The Purifier': 'Map is occupied by The Purifier',
  'The Constrictor': 'Map is occupied by The Constrictor',
  'The Enslaver': 'Map is occupied by The Enslaver',
  'The Eradicator': 'Map is occupied by The Eradicator'
}

const getSpecialMapFromImplicits = (implicitMods?: string[]) => {
  if (!implicitMods) return undefined
  const entry = Object.entries(specialMapImplicitsToMapName).find(([key]) =>
    implicitMods.some((implicit) => implicit.includes(key))
  )
  if (entry) {
    return entry[1]
  }
  return undefined
}
const getImplicitMods = (name: string) => {
  const entry = Object.entries(mapStashSpecialMapsToImplicits).find(([key]) => name.includes(key))
  if (entry) {
    return [entry[1]]
  }
  return undefined
}

export function mapMapStashItemToPoeItem(tab: IStashTab, league: string): PoeItem[] {
  const items = (tab.children as unknown as IChildStashTab[])?.map((st): PoeItem => {
    const specialMap = st.metadata.map.section === 'special'
    const uniqueMap = st.metadata.map.section === 'unique'
    const normalMap = !specialMap && !uniqueMap

    const mapTier = specialMap ? 16 : st.metadata.map.tier!
    const ilvl = specialMap ? 83 : 67 + st.metadata.map.tier!
    return {
      verified: false,
      w: 1,
      h: 1,
      icon: st.metadata.map.image,
      league: league,
      id: uuidv4(),
      name: st.metadata.map.name,
      typeLine: normalMap ? st.metadata.map.name : '',
      baseType: normalMap ? st.metadata.map.name : '',
      identified: true,
      ilvl: ilvl,
      properties: [
        {
          name: 'Map Tier',
          // @ts-ignore
          values: [[mapTier.toString(), 0]]
        }
      ],
      implicitMods: specialMap ? getImplicitMods(st.metadata.map.name) : [],
      explicitMods: [],
      descrText: '',
      frameType: uniqueMap ? 3 : 0,
      x: -1,
      y: -1,
      inventoryId: tab.name,
      stackSize: st.metadata.items
    }
  })
  return items || []
}

export const createCompactTab = (stashTab: IStashTabNode | string): ICompactTab => {
  if (typeof stashTab !== 'string') {
    return {
      id: stashTab.id,
      name: stashTab.name,
      index: stashTab.index,
      color: stashTab.metadata.data.colour || ''
    }
  }
  return {
    id: uuidv4(),
    name: stashTab,
    index: -1,
    color: ''
  }
}

export function mapItemsToPricedItems(
  valuation: IValuatedItem[],
  stashTab: ICompactTab
): IPricedItem[] {
  return valuation.map((valuatedItem) => {
    const item = valuatedItem.data
    const valuation = valuatedItem.valuation

    const mapTier = getMapTier(item.properties)
    const mappedItem: IPricedItem = {
      uuid: uuidv4(),
      tag: valuatedItem.group?.tag,
      key: valuatedItem.group?.key,
      hash: valuatedItem.group?.hash,
      itemId: item.id!,
      name:
        mapTier && item.frameType !== 3
          ? getSpecialMapFromImplicits(item.implicitMods) || item.baseType!
          : getItemName(item.name, item.frameType !== 3 ? item.typeLine : undefined),
      typeLine: item.typeLine!,
      frameType: item.frameType!,
      identified: item.identified!,
      calculated: valuation === null ? undefined : valuation,
      total: undefined,
      icon: item.icon!,
      ilvl: item.ilvl!,
      tier: mapTier,
      corrupted: item.corrupted || false,
      links:
        item.sockets !== undefined && item.sockets !== null
          ? getLinks(item.sockets.map((t) => t.group))
          : 0,
      sockets: item.sockets !== undefined && item.sockets !== null ? item.sockets.length : 0,
      quality: getQuality(item.properties),
      level: getLevel(item.properties),
      stackSize: item.stackSize || 1,
      totalStacksize: item.maxStackSize || 1,
      tab: [stashTab]
    }
    return mappedItem
  })
}

const calculateTotalPvsValue = (
  stackSize: number,
  calculated?: SageValuation
): SageValuation | undefined => {
  if (!calculated) return undefined
  const totalPvs = calculated.pvs.map((percentile) => percentile * stackSize)
  return { l: calculated.l, pvs: totalPvs }
}

export function mergeItemStacks(items: IPricedItem[]) {
  const mergedItems: IPricedItem[] = []

  items.forEach((item) => {
    const foundItem = mergedItems.find((x) => x.hash === item.hash)
    if (!foundItem) {
      mergedItems.push({ ...item })
    } else {
      const foundIdx = mergedItems.indexOf(foundItem)
      mergedItems[foundIdx].stackSize += item.stackSize
      mergedItems[foundIdx].total = calculateTotalPvsValue(
        mergedItems[foundIdx].stackSize,
        mergedItems[foundIdx].calculated
      )
      if (mergedItems[foundIdx].tab !== undefined && item.tab !== undefined) {
        mergedItems[foundIdx].tab = [...mergedItems[foundIdx].tab, ...item.tab]
        mergedItems[foundIdx].tab = mergedItems[foundIdx].tab.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        )
      }
    }
  })

  return mergedItems
}
