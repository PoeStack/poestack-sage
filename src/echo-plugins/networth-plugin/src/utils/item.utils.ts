import { PoeItem, PoeItemProperty, PoeItemSocket } from 'sage-common'
import { Rarity } from '../assets/theme'
import {
  IChildStashTab,
  ICompactTab,
  IStashTab,
  IStashTabNode
} from '../interfaces/stash.interface'
import { v4 as uuidv4 } from 'uuid'
import { IDisplayedItem, IPricedItem } from '../interfaces/priced-item.interface'
import { EchoPoeItem } from 'echo-common'

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

export const parseUnsafeHashProps = (item: IDisplayedItem) => {
  const hashProps = Object.entries(item.group?.unsafeHashProperties || {})
    .filter(([name, value]) => {
      const excludeNameByIncludes = (name: string) =>
        !['mods', 'Mods'].some((key) => name.includes(key))

      const excludeFalseValues = (value: any) => {
        if (!value || value === '0') return false
        return true
      }
      return excludeNameByIncludes(name) && excludeFalseValues(value)
    })
    .map(([name, value]) => {
      let displayValue = `${name}: ${value}`
      // Name only
      if (value === true) {
        displayValue = name
      }
      return { name, value, displayValue }
    })

  if (item.group?.key && item.displayName.toLowerCase() !== item.group.key?.toLowerCase()) {
    // Used for contract or cluster jewels
    hashProps.push({ name: item.displayName, value: item.group.key, displayValue: item.group.key })
  }

  hashProps.sort((a, b) => a.displayValue.length - b.displayValue.length)
  // Filterfn does not work, when an object is returned
  return hashProps.map((p) => `${p.name};;${p.displayValue}`).join(';;;')
}

export const getItemName = (name?: string, typeline?: string) => {
  let itemName = name || ''
  if (typeline) {
    itemName += ' ' + typeline
  }
  return itemName.replace('<<set:MS>><<set:M>><<set:S>>', '').trim()
}

export const getItemDisplayName = (item: PoeItem) => {
  return getMapTier(item.properties) && item.frameType !== 3
    ? getSpecialMapFromImplicits(item.implicitMods) || item.baseType!
    : getItemName(item.name, item.frameType !== 3 ? item.typeLine : undefined)
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

export const getStackSize = (item: PoeItem) => {
  return item.stackSize || 1
}

export const getTotalStackSize = (item: PoeItem) => {
  return item.maxStackSize || 1
}

export const getSockets = (item: PoeItem) => {
  return item.sockets !== undefined && item.sockets !== null ? item.sockets.length : 0
}

export function getLinks(sockets?: PoeItemSocket[]) {
  if (sockets === undefined || sockets === null) return 0

  const numMapping: any = {}
  let greatestFreq = 0
  sockets
    .map((t) => t.group!)
    .forEach((number) => {
      numMapping[number] = (numMapping[number] || 0) + 1

      if (greatestFreq < numMapping[number]) {
        greatestFreq = numMapping[number]
      }
    })
  return greatestFreq
}

export function findItem<T extends IDisplayedItem>(array: T[], toFind: T) {
  return array.find((x) => {
    if (toFind.group?.hash) {
      return x.group?.hash === toFind.group?.hash
    }
    if (!x.group && toFind.totalStacksize > 1) {
      return x.displayName === toFind.displayName
    }
    return false
  })
}

export function findPricedItem<T extends IPricedItem>(array: T[], toFind: T) {
  return array.find((x) => {
    if (toFind.group?.hash) {
      return x.group?.hash === toFind.group?.hash
    }
    if (!x.group && getTotalStackSize(toFind.items[0]) > 1) {
      return getItemDisplayName(x.items[0]) === getItemDisplayName(toFind.items[0])
    }
    return false
  })
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
      typeLine: normalMap
        ? st.metadata.map.name
        : specialMap
          ? `${st.metadata.map.name} Map`
          : st.metadata.map.name,
      baseType: normalMap
        ? st.metadata.map.name
        : specialMap
          ? `${st.metadata.map.name} Map`
          : st.metadata.map.name,
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

export const mapItemsToPricedItems = (
  valuation: EchoPoeItem[],
  stashTab: ICompactTab,
  percentile: number
): IPricedItem[] => {
  return valuation.map((valuatedItem) => {
    const pricedItem: IPricedItem = {
      uuid: uuidv4(),
      percentile: percentile,
      group: valuatedItem.group?.primaryGroup,
      valuation: valuatedItem.valuation || undefined,
      items: [valuatedItem.data],
      tab: [stashTab]
    }
    return pricedItem
  })
}

export const mapItemsToDisplayedItems = (pricedItems: IPricedItem[]): IDisplayedItem[] => {
  return pricedItems.map((pItem) => {
    const item = pItem.items[0]
    const valuation = pItem.valuation

    const stackSize = getStackSize(item)

    const mappedItem: IDisplayedItem = {
      displayName: getItemDisplayName(item),
      total: valuation ? valuation.pValues[pItem.percentile] * stackSize : 0,
      calculated: valuation ? valuation.pValues[pItem.percentile] : 0,
      stackSize: stackSize,
      totalStacksize: getTotalStackSize(item),
      icon: item.icon!,
      frameType: item.frameType!,
      ...pItem
    }

    if (mappedItem.displayName === 'Chaos Orb') {
      mappedItem.calculated = 1
      mappedItem.total = stackSize
    }
    return mappedItem
  })
}

export function mergeItemStacks(items: IDisplayedItem[]) {
  const mergedItems: IDisplayedItem[] = []

  items.forEach((dItem) => {
    const foundItem = findItem(mergedItems, dItem)
    if (!foundItem) {
      mergedItems.push({
        ...dItem
      })
    } else {
      const idx = mergedItems.indexOf(foundItem)
      mergedItems[idx].stackSize += dItem.stackSize
      mergedItems[idx].total = mergedItems[idx].stackSize * mergedItems[idx].calculated
      if (dItem.tab !== undefined) {
        mergedItems[idx].tab = [...(mergedItems[idx].tab || []), ...dItem.tab]
        mergedItems[idx].tab = mergedItems[idx].tab.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        )
      }
    }
  })

  return mergedItems
}

export function mergeItems(items: IPricedItem[]) {
  const mergedItems: IPricedItem[] = []

  items.forEach((pItem) => {
    const foundItem = findPricedItem(mergedItems, pItem)
    if (!foundItem) {
      mergedItems.push({
        ...pItem
      })
    } else {
      const idx = mergedItems.indexOf(foundItem)
      mergedItems[idx].items = [...(mergedItems[idx].items || []), ...(pItem.items || [])]
      if (pItem.tab !== undefined) {
        mergedItems[idx].tab = [...(mergedItems[idx].tab || []), ...pItem.tab]
        mergedItems[idx].tab = mergedItems[idx].tab.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        )
      }
    }
  })

  return mergedItems
}
