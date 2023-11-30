import { PoeItem } from 'sage-common'
import { Rarity } from '../assets/theme'
import { IChildStashTab, ICompactTab, IStashTab } from '../interfaces/stash.interface'
import { v4 as uuidv4 } from 'uuid'

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

export function getRarity(identifier: number): keyof Rarity {
  if (identifier < rarities.length) {
    return rarities[identifier]
  } else {
    return rarities[0]
  }
}

export function getRarityIdentifier(name: string): number {
  return rarities.indexOf(name as keyof Rarity)
}

export function parseTabNames(tabs: ICompactTab[]) {
  return tabs.map((t) => t.name).join(', ')
}

const specialMapImplicits = {
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
const getImplicitMods = (name: string) => {
  const entry = Object.entries(specialMapImplicits).find(([key]) => name.includes(key))
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

export function mergeItemStacks(items: PoeItem[]) {
  const mergedItems: PoeItem[] = []

  // items.forEach((item) => {
  //   const clonedItem = { ...item }
  //   const foundItem = findItem(mergedItems, clonedItem)

  //   if (!foundItem) {
  //     mergedItems.push(clonedItem)
  //   } else {
  //     const foundStackIndex = mergedItems.indexOf(foundItem)
  //     mergedItems[foundStackIndex].stackSize += item.stackSize
  //     mergedItems[foundStackIndex].total =
  //       mergedItems[foundStackIndex].stackSize * mergedItems[foundStackIndex].calculated
  //     if (mergedItems[foundStackIndex].tab !== undefined && item.tab !== undefined) {
  //       mergedItems[foundStackIndex].tab = [...mergedItems[foundStackIndex].tab, ...item.tab]
  //       mergedItems[foundStackIndex].tab = mergedItems[foundStackIndex].tab.filter(
  //         (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  //       )
  //     }
  //   }
  // })

  return mergedItems
}
