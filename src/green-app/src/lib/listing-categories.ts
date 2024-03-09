import { lowerCaseCompasses } from './compasses'
import { SageItemGroup } from './item-grouping-service'

type ItemWithGroup = { group?: Pick<SageItemGroup, 'unsafeHashProperties' | 'key'> }

export type ListingSubCategory = {
  name: string
  tags: string[]
  icon: string
  filter?: <T extends ItemWithGroup>(item: T) => boolean
  parseName?: <T extends ItemWithGroup>(item: T) => string | undefined
}

export type ListingCategory = ListingSubCategory & {
  subCategories: ListingSubCategory[]
}

export const LISTING_CATEGORIES: ListingCategory[] = [
  {
    name: 'compasses',
    tags: ['compass'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ2hhcmdlZENvbXBhc3MiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/ea8fcc3e35/ChargedCompass.png',
    filter: (item) => {
      return ['4', '16'].includes(`${item?.group?.unsafeHashProperties?.['uses']}`)
    },
    parseName: (item) => {
      if (item.group) {
        return lowerCaseCompasses[item.group?.key]
      }
    },
    subCategories: []
  },
  {
    name: 'essence',
    tags: ['essence'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRXNzZW5jZS9Db250ZW1wdDYiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/332e9b32e9/Contempt6.png',
    subCategories: [
      {
        name: 'essence low',
        tags: ['essence'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRXNzZW5jZS9Db250ZW1wdDMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/7347bf5d1c/Contempt3.png',
        filter: (item) => {
          return ![
            'shrieking',
            'deafening',
            'essence of horror',
            'essence of delirium',
            'essence of hysteria'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'essence high',
        tags: ['essence'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRXNzZW5jZS9Ib3Jyb3IxIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/748d594bde/Horror1.png',
        filter: (item) => {
          return [
            'shrieking',
            'deafening',
            'essence of horror',
            'essence of delirium',
            'essence of hysteria'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      }
    ]
  },
  {
    name: 'scarabs',
    tags: ['scarab'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvU2NhcmFicy9UaWVyNFNjYXJhYkhhcmJpbmdlcnMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/81caefbf3f/Tier4ScarabHarbingers.png',
    subCategories: []
  },
  {
    name: 'heist',
    tags: ['contract'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSGVpc3QvQ29udHJhY3RJdGVtIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/8262f2ca0e/ContractItem.png',
    subCategories: []
  },
  {
    name: 'currency',
    tags: ['currency'],
    icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png',
    subCategories: []
  },
  {
    name: 'beast',
    tags: ['beast'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQmVzdGlhcnlPcmJGdWxsIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/3214b44360/BestiaryOrbFull.png',
    subCategories: []
  },
  {
    name: 'fossil',
    tags: ['fossil'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsdmUvR2x5cGhpY0Zvc3NpbCIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/f5b3c6edf7/GlyphicFossil.png',
    subCategories: []
  },
  {
    name: 'resonator',
    tags: ['resonator'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsdmUvUmVyb2xsMXgxQSIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/eea57ec0df/Reroll1x1A.png',
    subCategories: []
  },
  {
    name: 'catalysts',
    tags: ['catalyst'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ2F0YWx5c3RzL0NoYW9zUGh5c2ljYWxDYXRhbHlzdCIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/bbdf8917e4/ChaosPhysicalCatalyst.png',
    subCategories: []
  },
  {
    name: 'fragments',
    tags: ['fragment'],
    icon: 'https://web.poecdn.com/image/Art/2DItems/Maps/AtlasMaps/FragmentPhoenix.png',
    subCategories: []
  },
  {
    name: 'breach',
    tags: ['breach'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQnJlYWNoL0JyZWFjaEZyYWdtZW50c0NoYW9zIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/04b5c032f4/BreachFragmentsChaos.png',
    subCategories: []
  },
  {
    name: 'cards',
    tags: ['card'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png',
    subCategories: []
  },
  {
    name: 'delirium orbs',
    tags: ['delirium orb'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsaXJpdW0vRGVsaXJpdW1PcmJTY2FyYWJzIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/fa4c5160ca/DeliriumOrbScarabs.png',
    subCategories: []
  },
  {
    name: 'logbooks',
    tags: ['logbook'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9FeHBlZGl0aW9uQ2hyb25pY2xlMyIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/2802fe605e/ExpeditionChronicle3.png',
    subCategories: []
  },
  {
    name: 'oils',
    tags: ['oil'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT2lscy9Hb2xkZW5PaWwiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/69094a06e9/GoldenOil.png',
    subCategories: []
  },
  {
    name: 'incubators',
    tags: ['incubator'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSW5jdWJhdGlvbi9JbmN1YmF0aW9uQXJtb3VyIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/637c41a730/IncubationArmour.png',
    subCategories: []
  }
]
