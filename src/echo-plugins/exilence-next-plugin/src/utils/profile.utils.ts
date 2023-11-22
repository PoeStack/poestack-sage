import { ICurrency } from '../interfaces/currency.interface'

export const generateProfileName = () => {
  const prefixes = [
    'Divine',
    'Majestic',
    'Strong',
    'Exalted',
    'Swift',
    'Rich',
    'Humble',
    'Fine',
    'Nice',
    'Fiery'
  ]
  const suffixes = [
    'Exile',
    'Slayer',
    'Assassin',
    'Duelist',
    'Witch',
    'Trader',
    'Farmer',
    'Grinder',
    'Templar',
    'Merchant',
    'Flipper',
    'Stash',
    'Collection'
  ]

  return (
    prefixes[Math.floor(Math.random() * prefixes.length)] +
    ' ' +
    suffixes[Math.floor(Math.random() * suffixes.length)]
  )
}
