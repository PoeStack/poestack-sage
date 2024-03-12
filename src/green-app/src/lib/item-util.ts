import { IDisplayedItem, IPricedItem } from '@/types/echo-api/priced-item'
import { IChildStashTab, ICompactTab, IStashTab } from '@/types/echo-api/stash'
import { ValuatedItem } from '@/types/item'
import { PoeItem, PoeItemProperty, PoeItemSocket } from '@/types/poe-api-models'
import { v4 as uuidv4 } from 'uuid'
import { round } from './currency'
import { LISTING_CATEGORIES } from './listing-categories'

export const rarityColors = {
  normal: '#c0c0c0',
  magic: '#8888FF',
  rare: '#EBEB57',
  unique: '#da7a36',
  gem: '#1ba29b',
  currency: '#AD904B',
  divination: '#c0c0c0',
  quest: '#6eb930',
  unknown: '#fff',
  legacy: '#82ad6a'
}

type Rarity = typeof rarityColors

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

export const parseUnsafeHashProps = (unsafeHashProperties: any) => {
  const hashProps = Object.entries(unsafeHashProperties || {})
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

export const getItemDisplayName = (pItem: IPricedItem) => {
  if (pItem.group) {
    if (pItem.group.tag) {
      // 1. Get custom names
      const displayName =
        LISTING_CATEGORIES.find((x) => x.tags.includes(pItem.group!.tag))?.parseName?.(pItem) || ''
      if (displayName) return displayName
    }
    // 2. Get key as name with capitalization
    return pItem.group.key.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase())
  }

  // 3. Ungrouped - try to parse poe api
  const item = pItem.items[0]
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

export const getStackSize = (items: PoeItem[]) => {
  return items.reduce((stackSize, item) => (item.stackSize || 1) + stackSize, 1)
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
    // if (!x.group && toFind.totalStacksize > 1) {
    return x.displayName === toFind.displayName
  })
}

export function findPricedItem<T extends IPricedItem>(array: T[], toFind: T) {
  return array.find((x) => {
    if (toFind.group?.hash) {
      return x.group?.hash === toFind.group?.hash
    }
    // if (!x.group && getTotalStackSize(toFind.items[0]) > 1) {
    return getItemDisplayName(x) === getItemDisplayName(toFind)
    // }
    // return false
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
        },
        {
          name: 'Rarity',
          // @ts-ignore
          values: [['unknown', 0]]
        },
        {
          name: 'Type',
          // @ts-ignore
          values: [[specialMap ? 'special' : uniqueMap ? 'unqiue' : 'normal', 0]]
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
  // Filter all normal items
  return (items || []).filter(
    (item) => !item.properties?.some((p) => p.name === 'Type' && p.values?.[0]?.[0] === 'normal')
  )
}

export const createCompactTab = (stashTab: IStashTab | string): ICompactTab => {
  if (typeof stashTab !== 'string') {
    return {
      id: stashTab.id,
      name: stashTab.name,
      index: stashTab.index,
      color: stashTab.metadata.colour || ''
    }
  }
  return {
    id: uuidv4(),
    name: stashTab,
    index: -1,
    color: ''
  }
}

export const calculateItemPrices = (item: IDisplayedItem, multiplier: number) => {
  item.calculatedPrice = undefined
  item.calculatedTotalPrice = 0
  if (item.selectedPrice !== undefined || item.originalPrice !== undefined) {
    item.calculatedPrice = round((item.selectedPrice! ?? item.originalPrice!) * multiplier, 4)
    item.calculatedTotalPrice = round(
      (item.selectedPrice! ?? item.originalPrice!) * item.stackSize * multiplier,
      4
    )
  }
}

export const filterPricedItems = (
  pricedItems: IPricedItem[],
  category: string | null,
  subCategory: string | null
) => {
  return pricedItems.filter((pItem) => {
    if (!pItem.group || !category) return true
    const categoryItem = LISTING_CATEGORIES.find((x) => x.name === category)
    const result = subCategory
      ? categoryItem?.subCategories.find((c) => c.name === subCategory)?.filter?.(pItem)
      : categoryItem?.filter?.(pItem)
    if (result === undefined) return true
    return result
  })
}

export const mapItemsToPricedItems = (
  valuation: ValuatedItem[],
  stashTab: ICompactTab,
  percentile: number
): IPricedItem[] => {
  return valuation.map((valuatedItem) => {
    const pricedItem: IPricedItem = {
      // uuid: uuidv4(),
      percentile: percentile,
      group: valuatedItem.group?.primaryGroup,
      valuation: valuatedItem.valuation || undefined,
      items: [valuatedItem.data],
      tabs: [stashTab]
    }
    return pricedItem
  })
}

export const mapItemsToDisplayedItems = (
  pricedItems: IPricedItem[],
  multiplier?: number,
  overprices?: Record<string, number>
): IDisplayedItem[] => {
  return pricedItems.map((pItem) => {
    const item = pItem.items[0]
    const valuation = pItem.valuation

    const stackSize = getStackSize(pItem.items)

    const mappedItem: IDisplayedItem = {
      displayName: getItemDisplayName(pItem),
      originalPrice: valuation?.pValues ? valuation.pValues[pItem.percentile] : undefined,
      calculatedPrice: valuation?.pValues
        ? valuation.pValues[pItem.percentile] * (multiplier ?? 1)
        : undefined,
      calculatedTotalPrice: valuation?.pValues
        ? valuation.pValues[pItem.percentile] * stackSize * (multiplier ?? 1)
        : 0,
      selectedPrice: undefined, // We use the price as placeholder
      stackSize: stackSize,
      totalStacksize: getTotalStackSize(item),
      icon: item.icon!,
      frameType: item.frameType!,
      ...pItem
    }

    if (mappedItem.group && mappedItem.displayName === 'Chaos Orb') {
      mappedItem.originalPrice = 1
      mappedItem.calculatedPrice = 1 * (multiplier ?? 1)
      mappedItem.calculatedTotalPrice = 1 * stackSize * (multiplier ?? 1)
    }

    if (mappedItem.group && overprices && overprices[mappedItem.group.hash] !== undefined) {
      mappedItem.selectedPrice = overprices[mappedItem.group.hash]
      calculateItemPrices(mappedItem, multiplier ?? 1)
    }

    return mappedItem
  })
}

export function mergeItemStacks(items: IDisplayedItem[], multiplier?: number) {
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
      calculateItemPrices(mergedItems[idx], multiplier ?? 1)
      if (dItem.tabs !== undefined) {
        mergedItems[idx].tabs = [...(mergedItems[idx].tabs || []), ...dItem.tabs]
        mergedItems[idx].tabs = mergedItems[idx].tabs.filter(
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
      if (pItem.tabs !== undefined) {
        mergedItems[idx].tabs = [...(mergedItems[idx].tabs || []), ...pItem.tabs]
        mergedItems[idx].tabs = mergedItems[idx].tabs.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        )
      }
    }
  })

  return mergedItems
}

export class ItemUtils {
  public static decodeIcon(icon: string, offset = 1): string | null | undefined {
    if (!icon) {
      return null
    }

    const split = icon.split('/')
    const base64String = split[5]
    const iconInfo = JSON.parse(Buffer.from(base64String, 'base64').toString('ascii'))?.[2]
    const categoryString = iconInfo['f']?.split('/')

    return categoryString?.[(categoryString?.length ?? 0) - offset - 1]?.toLowerCase()
  }
}
