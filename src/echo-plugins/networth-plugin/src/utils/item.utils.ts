import { Rarity } from '../assets/theme'
import { ICompactTab } from '../interfaces/stash.interface'

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
