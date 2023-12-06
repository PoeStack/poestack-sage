// export const highchartsColors = [
//     primaryMain,
//     deepOrange[300],
//     orange[300],
//     lime[300],
//     teal[300],
//     amber[300],
//     deepPurple[300],
//     pink[300],
//     blue[300],
//   ];

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

export const itemColors = {
  chaosOrb: '#d6b600',
  corrupted: 'rgb(255 123 123)',
  custom: '#38cfba'
}

export const netWorthSessionColors = [
  '#3ed914', // 'start'
  '#e8952e', // 'pause'
  '#eb2f26', // 'offline'
  '#de23de', // 'inactive'
  '#3119cf' // 'adjustments'
]

export const currencyChangeColors = {
  positive: 'green-600',
  negative: 'red-700'
}

export type Rarity = typeof rarityColors
export type ItemColor = typeof itemColors
