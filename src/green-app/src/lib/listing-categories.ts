import { SageItemGroup } from 'sage-common'
import { lowerCaseCompasses } from './compasses'

type ItemWithGroup = { group?: Pick<SageItemGroup, 'unsafeHashProperties' | 'key' | 'tag'> }

export type ListingSubCategory = {
  name: string
  tags: string[]
  icon: string
  restItems?: boolean
  filter?: <T extends ItemWithGroup>(item: T) => boolean
  parseName?: <T extends ItemWithGroup>(item: T) => string | undefined
}

export type ListingCategory = Omit<ListingSubCategory, 'restItems'> & {
  subCategories: ListingSubCategory[]
}

export const LISTING_CATEGORIES: ListingCategory[] = [
  {
    name: 'compass',
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
    name: 'heist',
    tags: ['contract'],
    // TODO: Readd blueprints once the backend is fixed
    // tags: ['contract', 'blueprint'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSGVpc3QvQ29udHJhY3RJdGVtIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/8262f2ca0e/ContractItem.png',
    filter: (item) => {
      if (!item.group) return true
      if (item.group.tag === 'blueprint') {
        const ilvl = item?.group?.unsafeHashProperties?.['ilvl']
        return ilvl === '81+'
      } else if (item.group.tag === 'contract') {
        const ilvl = item?.group?.unsafeHashProperties?.['ilvl']
        return ilvl === '83+'
      }
      return true
    },
    subCategories: [
      {
        name: 'contract',
        tags: ['contract'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSGVpc3QvQ29udHJhY3RJdGVtIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/8262f2ca0e/ContractItem.png',
        filter: (item) => {
          const ilvl = item?.group?.unsafeHashProperties?.['ilvl']
          return ilvl === '83+'
        }
      }
      // {
      //   name: 'blueprint',
      //   tags: ['blueprint'],
      //   icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSGVpc3QvQmx1ZXByaW50Tm90QXBwcm92ZWQ4IiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/cc90ce9113/BlueprintNotApproved8.png',
      //   filter: (item) => {
      //     const ilvl = item?.group?.unsafeHashProperties?.['ilvl']
      //     return ilvl === '81+'
      //   }
      // }
    ]
  },
  {
    name: 'currency',
    tags: ['currency'],
    icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png',
    subCategories: [
      {
        name: 'stackedDeck',
        tags: ['currency'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9EZWNrIiwic2NhbGUiOjF9XQ/8e83aea79a/Deck.png',
        filter: (item) => {
          return ['stacked deck'].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'lifeforce',
        tags: ['currency'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSGFydmVzdC9XaWxkTGlmZWZvcmNlIiwic2NhbGUiOjF9XQ/e3d0b372b0/WildLifeforce.png',
        filter: (item) => {
          return [
            'vivid crystallised lifeforce',
            'wild crystallised lifeforce',
            'primal crystallised lifeforce'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'otherCurrency',
        tags: ['currency'],
        restItems: true,
        icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png'
      }
    ]
  },
  {
    name: 'beast',
    tags: ['beast'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQmVzdGlhcnlPcmJGdWxsIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/3214b44360/BestiaryOrbFull.png',
    subCategories: []
  },
  {
    name: 'delve',
    tags: ['fossil', 'resonator'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsdmUvRmFjZXRlZEZvc3NpbCIsInNjYWxlIjoxfV0/473889cafb/FacetedFossil.png',
    subCategories: [
      {
        name: 'fossil',
        tags: ['fossil'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsdmUvR2x5cGhpY0Zvc3NpbCIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/f5b3c6edf7/GlyphicFossil.png'
      },
      {
        name: 'resonator',
        tags: ['resonator'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsdmUvUmVyb2xsMXgxQSIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/eea57ec0df/Reroll1x1A.png'
      }
    ]
  },
  {
    name: 'catalyst',
    tags: ['catalyst'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ2F0YWx5c3RzL0NoYW9zUGh5c2ljYWxDYXRhbHlzdCIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/bbdf8917e4/ChaosPhysicalCatalyst.png',
    subCategories: []
  },
  {
    name: 'sanctum',
    tags: ['relic', 'forbidden tome'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvUmVsaWNzL1JlbGljVW5pcXVlMngyIiwidyI6MiwiaCI6Miwic2NhbGUiOjF9XQ/15bd9eec94/RelicUnique2x2.png',
    filter: (item) => {
      if (!item.group || item.group.tag !== 'forbidden tome') return true
      const ilvl = parseInt(item?.group?.unsafeHashProperties?.['ilvl'])
      return !isNaN(ilvl) && ilvl >= 83
    },
    subCategories: [
      {
        name: 'uniqueRelic',
        tags: ['relic'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvUmVsaWNzL1JlbGljVW5pcXVlMngyIiwidyI6MiwiaCI6Miwic2NhbGUiOjF9XQ/15bd9eec94/RelicUnique2x2.png'
      },
      {
        name: 'forbiddenTome',
        tags: ['forbidden tome'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvU2FuY3R1bS9TYW5jdHVtS2V5IiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d0326cac9a/SanctumKey.png',
        filter: (item) => {
          const ilvl = parseInt(item?.group?.unsafeHashProperties?.['ilvl'])
          return !isNaN(ilvl) && ilvl >= 83
        }
      }
    ]
  },
  {
    name: 'fragment',
    tags: ['fragment', 'scarab', 'breach', 'invitation'],
    icon: 'https://web.poecdn.com/image/Art/2DItems/Maps/AtlasMaps/FragmentPhoenix.png',
    subCategories: [
      {
        name: 'scarab',
        tags: ['scarab'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvU2NhcmFicy9UaWVyNFNjYXJhYkhhcmJpbmdlcnMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/81caefbf3f/Tier4ScarabHarbingers.png'
      },
      {
        name: 'breach',
        tags: ['breach'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQnJlYWNoL0JyZWFjaEZyYWdtZW50c0NoYW9zIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/04b5c032f4/BreachFragmentsChaos.png'
      },
      {
        name: 'legion',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9NYXJha2V0aEZyYWdtZW50IiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/7c42d58a5e/MarakethFragment.png',
        filter: (item) => {
          return [
            'timeless maraketh emblem',
            'timeless templar emblem',
            'timeless vaal emblem',
            'timeless karui emblem',
            'timeless eternal emblem',
            'unrelenting timeless maraketh emblem',
            'unrelenting timeless templar emblem',
            'unrelenting timeless karui emblem',
            'unrelenting timeless vaal emblem',
            'unrelenting timeless eternal emblem',
            'timeless maraketh splinter',
            'timeless templar splinter',
            'timeless karui splinter',
            'timeless vaal splinter',
            'timeless eternal empire splinter'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'invitation',
        tags: ['invitation'],
        icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/Atlas/NullVoid5.png?w=1&h=1&scale=1'
      },
      {
        name: 'mortalSet',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9VYmVyVmFhbENvbXBsZXRlIiwic2NhbGUiOjF9XQ/994d9e2821/UberVaalComplete.png',
        filter: (item) => {
          return ['mortal ignorance', 'mortal rage', 'mortal hope', 'mortal grief'].some(
            (essence) => item.group?.key.startsWith(essence)
          )
        }
      },
      {
        name: 'sacrificeSet',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9WYWFsQ29tcGxldGUiLCJzY2FsZSI6MX1d/63035d86d7/VaalComplete.png',
        filter: (item) => {
          return [
            'sacrifice at midnight',
            'sacrifice at noon',
            'sacrifice at dawn',
            'sacrifice at dusk'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'shaperSet',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9TaGFwZXJDb21wbGV0ZSIsInNjYWxlIjoxfV0/ace686004d/ShaperComplete.png',
        filter: (item) => {
          return [
            'fragment of the phoenix',
            'fragment of the hydra',
            'fragment of the minotaur',
            'fragment of the chimera'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'elderSet',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9FbGRlckNvbXBsZXRlIiwic2NhbGUiOjF9XQ/6db44597fe/ElderComplete.png',
        filter: (item) => {
          return [
            'fragment of eradication',
            'fragment of enslavement',
            'fragment of constriction',
            'fragment of purification'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'conquererSet',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9TaXJ1c0ZyYWdtZW50Q29tcGxldGUiLCJzY2FsZSI6MX1d/c585a0ae79/SirusFragmentComplete.png',
        filter: (item) => {
          return ["al-hezmin's crest", "baran's crest", "drox's crest", "veritania's crest"].some(
            (essence) => item.group?.key.startsWith(essence)
          )
        }
      },
      {
        name: 'uberElderSet',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9VYmVyRWxkZXJDb21wbGV0ZSIsInNjYWxlIjoxfV0/715e041869/UberElderComplete.png',
        filter: (item) => {
          return [
            'fragment of terror',
            'fragment of emptiness',
            'fragment of shape',
            'fragment of knowledge'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'simulacrum',
        tags: ['fragment'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9EZWxpcml1bUZyYWdtZW50Iiwic2NhbGUiOjF9XQ/7f29157183/DeliriumFragment.png',
        filter: (item) => {
          return ['simulacrum', 'simulacrum splinter'].some((essence) =>
            item.group?.key.startsWith(essence)
          )
        }
      },
      {
        name: 'otherFragments',
        tags: ['fragment', 'scarab', 'breach', 'invitation'],
        restItems: true,
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9Db3NtaWNDb3JlU3VwcG9ydGVyVmF1bHRLZXkiLCJzY2FsZSI6MX1d/1f2d34a36d/CosmicCoreSupporterVaultKey.png'
      }
    ]
  },
  {
    name: 'card',
    tags: ['card'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png',
    subCategories: []
  },
  {
    name: 'delirium orb',
    tags: ['delirium orb'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRGVsaXJpdW0vRGVsaXJpdW1PcmJTY2FyYWJzIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/fa4c5160ca/DeliriumOrbScarabs.png',
    subCategories: []
  },
  {
    name: 'expedition',
    tags: ['logbook', 'artifacts'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9FeHBlZGl0aW9uQ2hyb25pY2xlMyIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/2802fe605e/ExpeditionChronicle3.png',
    filter: (item) => {
      if (!item.group || item.group.tag !== 'logbook') return true
      const ilvl = parseInt(item?.group?.unsafeHashProperties?.['ilvl'])
      return !isNaN(ilvl) && ilvl >= 83
    },
    subCategories: [
      {
        name: 'logbook',
        tags: ['logbook'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9FeHBlZGl0aW9uQ2hyb25pY2xlMyIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/2802fe605e/ExpeditionChronicle3.png',
        filter: (item) => {
          const ilvl = parseInt(item?.group?.unsafeHashProperties?.['ilvl'])
          return !isNaN(ilvl) && ilvl >= 83
        }
      },
      {
        name: 'artifact',
        tags: ['artifacts'],
        icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRXhwZWRpdGlvbi9CYXJ0ZXJSZWZyZXNoQ3VycmVuY3kiLCJzY2FsZSI6MX1d/0542d74d3c/BarterRefreshCurrency.png'
      }
    ]
  },
  {
    name: 'oil',
    tags: ['oil'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvT2lscy9Hb2xkZW5PaWwiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/69094a06e9/GoldenOil.png',
    subCategories: []
  },
  {
    name: 'memory',
    tags: ['atlas memory'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvTWVtb3J5TGluZS9OaWtvTWVtb3J5SXRlbSIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/5c560ea8fd/NikoMemoryItem.png',
    subCategories: []
  },
  {
    name: 'incubator',
    tags: ['incubator'],
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvSW5jdWJhdGlvbi9JbmN1YmF0aW9uQXJtb3VyIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/637c41a730/IncubationArmour.png',
    subCategories: [],
    filter: (item) => {
      const ilvl = parseInt(item?.group?.unsafeHashProperties?.['ilvl'])
      return !isNaN(ilvl) && ilvl >= 83
    }
  },
  {
    name: 'map',
    tags: ['map'],
    icon: 'https://web.poecdn.com/image/Art/2DItems/Maps/AtlasMaps/Gorge3.png?scale=1&w=1&h=1',
    filter: (item) => {
      return [
        'lair of the hydra map',
        'maze of the minotaur map',
        'forge of the phoenix map',
        'pit of the chimera map',
        "purifier's map",
        "constrictor's map",
        "enslaver's map",
        "eradicator's map",
        "al-hezmin's map",
        "veritania's map",
        "baran's map",
        "drox's map"
      ].some((essence) => item.group?.key.startsWith(essence))
    },
    subCategories: [
      {
        name: 'shaperMap',
        tags: ['map'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9BdGxhczJNYXBzL05ldy9QaG9lbml4IiwidyI6MSwiaCI6MSwic2NhbGUiOjEsIm1uIjoxOSwibXQiOjAsIm1pIjoxfV0/3a961684d2/Phoenix.png',
        filter: (item) => {
          return [
            'lair of the hydra map',
            'maze of the minotaur map',
            'forge of the phoenix map',
            'pit of the chimera map'
          ].some((essence) => item.group?.key.startsWith(essence))
        }
      },
      {
        name: 'elderMap',
        tags: ['map'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9BdGxhczJNYXBzL05ldy9JbmZlc3RhdGlvbiIsInciOjEsImgiOjEsInNjYWxlIjoxLCJtbiI6MTksIm10IjoxNiwibWciOjEsIm1pIjoyfV0/6d86f8c63f/Infestation.png',
        filter: (item) => {
          return ["purifier's map", "constrictor's map", "enslaver's map", "eradicator's map"].some(
            (essence) => item.group?.key.startsWith(essence)
          )
        }
      },
      {
        name: 'conquerorMap',
        tags: ['map'],
        icon: 'https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9BdGxhczJNYXBzL05ldy9CYXRocyIsInciOjEsImgiOjEsInNjYWxlIjoxLCJtbiI6MTksIm10IjoxNiwibWMiOjJ9XQ/6c27bce263/Baths.png',
        filter: (item) => {
          return ["al-hezmin's map", "veritania's map", "baran's map", "drox's map"].some(
            (essence) => item.group?.key.startsWith(essence)
          )
        }
      }
      // TODO: Normal maps not(corrupted, mirrored, split)
      // TODO: Unique maps
      // TODO: Blighted maps
      // TODO: Blighted revanged maps
    ]
  }
]
