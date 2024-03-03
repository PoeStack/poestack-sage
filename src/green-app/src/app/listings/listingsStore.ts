'use client'

import { ListingFilterGroup } from '@/components/trade-filter-card'
import { SUPPORTED_LEAGUES } from '@/lib/constants'
import { ListingFilterUtil } from '@/lib/listing-filter-util'
import { SageListingType } from '@/types/sage-listing-type'
import { RowSelectionState } from '@tanstack/react-table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useNotificationStore } from '@/store/notificationStore'
dayjs.extend(utc)

const calculateMetaPrices = (
  listing: SageListingType,
  selectedItemsMap: Record<string, RowSelectionState>
) => {
  if (listing.meta.listingMode === 'bulk') {
    if (!selectedItemsMap[listing.uuid]) {
      selectedItemsMap[listing.uuid] = {}
    }
    return
  }
  let calculatedTotalPrice = 0
  let calculatedTotalValuation = 0
  if (selectedItemsMap[listing.uuid]) {
    listing.items.forEach((item) => {
      if (!selectedItemsMap[listing.uuid][item.hash]) return
      calculatedTotalPrice += item.price * (item.selectedQuantity ?? 0)
      calculatedTotalValuation += item.primaryValuation * (item.selectedQuantity ?? 0)
    })
  } else {
    selectedItemsMap[listing.uuid] = {}
  }

  let multiplier = -1
  if (calculatedTotalPrice === 0 && calculatedTotalValuation === 0) {
    multiplier = 100
  } else if (!(calculatedTotalPrice === 0 || calculatedTotalValuation === 0)) {
    multiplier = (calculatedTotalPrice / calculatedTotalValuation) * 100
  }
  listing.meta.calculatedTotalPrice = calculatedTotalPrice
  listing.meta.calculatedTotalValuation = calculatedTotalValuation
  listing.meta.multiplier = multiplier
}

const calculateListings = (
  listings: SageListingType[],
  selectedItemsMap: Record<string, RowSelectionState>,
  filterGroups: ListingFilterGroup[],
  filteredByGroupListings: Record<string, boolean>
) => {
  listings.forEach((listing) => {
    let calculatedTotalPrice = 0
    let calculatedTotalValuation = 0
    const { items, valid } = ListingFilterUtil.filterItems(listing.items, filterGroups)
    filteredByGroupListings[listing.uuid] = valid
    selectedItemsMap[listing.uuid] = {}

    if (listing.meta.listingMode === 'bulk') {
      // Select the listings if the listing got updated while the dialog is open to an individual listing
      return items.forEach(({ item }) => {
        selectedItemsMap[listing.uuid][item.hash] = true
      })
    }

    items.forEach(({ item, minQuantity }) => {
      if (minQuantity !== undefined) {
        item.selectedQuantity = minQuantity
      } else {
        item.selectedQuantity = item.quantity
      }

      selectedItemsMap[listing.uuid][item.hash] = true
      calculatedTotalPrice += item.price * (item.selectedQuantity ?? 0)
      calculatedTotalValuation += item.primaryValuation * (item.selectedQuantity ?? 0)
    })
    listing.meta.calculatedTotalPrice = calculatedTotalPrice
    listing.meta.calculatedTotalValuation = calculatedTotalValuation
    if (calculatedTotalPrice === 0 && calculatedTotalValuation === 0) {
      listing.meta.multiplier = 100
    } else if (calculatedTotalPrice === 0 || calculatedTotalValuation === 0) {
      listing.meta.multiplier = -1
    } else {
      listing.meta.multiplier = (calculatedTotalPrice / calculatedTotalValuation) * 100
    }
  })
}

type State = {
  dialogOpen: boolean
  league: string // Persist
  category: string | null // Persist
  multiplierRange: number[] // Persist
  /**
   * The timestamps to start from for the indivitual categories
   * league - category - timestamp
   */
  fetchTimeStamps: Record<string, Record<string, number>>
  filterGroups: ListingFilterGroup[]
  // category, listings
  listingsMap: Record<string, SageListingType[]>
  selectedListingId: string | null
  // listingId, selectedItems
  selectedItemsMap: Record<string, RowSelectionState>
  // listingId, filterGroup valid
  filteredByGroupListings: Record<string, boolean>
  // listingId, sentHashes: objecthash[], currentHash: objecthash
  whisperedListings: Record<string, { sentHashes: string[]; lastCopiedHash: string }>
}

type Actions = {
  setDialogOpen: (open: boolean) => void
  setLeague: (league: string) => void
  setCategory: (category: string | null) => void
  setMultiplierRange: (range: number[]) => void
  setFetchTimestamps: (timestamp: number) => void
  /**
   * Recalculates the selectedItem & totalValue for all listings of the current category
   */
  setFilterGroups: (filterGroups: ListingFilterGroup[]) => void
  /**
   * Calculates the listings totalValue, selected items, selected total and adds this to the pool of listings & then filters them
   */
  addListings: (listings: SageListingType[], category: string) => void
  cleanupListings: () => void
  addWhisperedListing: (id: string, hash: string) => void
  setSelectedListingId: (id: string) => void
  updateData: (rowIndex: number, columnId: string, value: number | string) => void
  setSelectedItems: React.Dispatch<React.SetStateAction<RowSelectionState>>
  reset: () => void
}

// define the initial state
const initialState: State = {
  dialogOpen: false as boolean,
  league: SUPPORTED_LEAGUES[0],
  category: null as string | null,
  multiplierRange: [0, 200],
  fetchTimeStamps: Object.fromEntries(SUPPORTED_LEAGUES.map((league) => [league, {}])),
  filterGroups: [{ selected: true, mode: 'AND', filters: [] }],
  listingsMap: {},
  selectedListingId: null,
  selectedItemsMap: {},
  filteredByGroupListings: {},
  whisperedListings: {}
}

export const useListingsStore = create<State & Actions>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      reset: () => set(initialState),
      setDialogOpen: (open) =>
        set((state) => {
          if (!open) {
            const listing = state.listingsMap[state.category || ''].find(
              (l) => l.uuid === state.selectedListingId
            )
            if (listing) {
              // Reset values
              calculateListings(
                [listing],
                state.selectedItemsMap,
                state.filterGroups,
                state.filteredByGroupListings
              )
            }
          }
          state.dialogOpen = open
        }),

      setLeague: (league) => set({ league }),

      setCategory: (category) =>
        set((state) => {
          state.category = category

          // Set initial key to listingsmap
          if (!state.listingsMap[category || '']) {
            state.listingsMap[category || ''] = []
          }

          // Set initial timestamp
          if (category && state.fetchTimeStamps[state.league][category] === undefined) {
            state.fetchTimeStamps[state.league][category] = 0
          }

          // Reset filterGroups
          state.filterGroups = [{ selected: true, mode: 'AND', filters: [] }]
          state.filteredByGroupListings = {}
          calculateListings(
            state.listingsMap[state.category || ''],
            state.selectedItemsMap,
            state.filterGroups,
            state.filteredByGroupListings
          )
        }),

      setMultiplierRange: (range) =>
        set((state) => {
          state.multiplierRange = range
        }),

      setFetchTimestamps: (timestamp) =>
        set((state) => {
          state.fetchTimeStamps[state.league][state.category || ''] = timestamp
        }),

      setFilterGroups: (filterGroups) =>
        set((state) => {
          if (!state.category) return

          state.filterGroups = filterGroups
          state.filteredByGroupListings = {}
          calculateListings(
            state.listingsMap[state.category || ''],
            state.selectedItemsMap,
            state.filterGroups,
            state.filteredByGroupListings
          )
        }),

      addListings: (listings, category) =>
        set((state) => {
          if (!state.listingsMap[category]) {
            state.listingsMap[category] = []
          }

          // Add the new listings to the listingsMap
          const newListings = listings.filter((l) => {
            // Unique key: userId:league:category
            const idx = state.listingsMap[category || ''].findIndex(
              (cl) =>
                cl.userId === l.userId &&
                cl.meta.league === l.meta.league &&
                cl.meta.category === l.meta.category
            )
            if (idx !== -1) {
              if (l.deleted) {
                if (state.dialogOpen && state.selectedListingId === l.uuid) {
                  state.dialogOpen = false
                  console.warn('The dialog was closed because the opened listing was deleted')
                  useNotificationStore
                    .getState()
                    .addNotification('Sorry! The listing has been deleted!', 'warning')
                }
                if (state.selectedItemsMap[l.uuid]) {
                  delete state.selectedItemsMap[l.uuid]
                }
                if (state.filteredByGroupListings[l.uuid]) {
                  delete state.filteredByGroupListings[l.uuid]
                }
                state.listingsMap[category || ''].splice(idx, 1)
              } else {
                const prev = state.listingsMap[category || ''][idx]
                if (prev.uuid !== l.uuid) {
                  if (state.dialogOpen && state.selectedListingId === prev.uuid) {
                    state.selectedListingId = l.uuid
                    console.warn('The dialog was updated because the opened listing was replaced')
                    useNotificationStore
                      .getState()
                      .addNotification('The listing has been updated!', 'warning')

                    // Move the selection over
                    if (state.selectedItemsMap[prev.uuid]) {
                      state.selectedItemsMap[l.uuid] = {}
                      Object.keys(state.selectedItemsMap[prev.uuid]).forEach((sHash) => {
                        const selectedItemFound = l.items.some((cl) => cl.hash === sHash)
                        if (selectedItemFound) {
                          state.selectedItemsMap[l.uuid][sHash] = true
                        }
                      })
                    }
                    // Move selectedQuantity over
                    l.items.forEach((item) => {
                      const pItem = prev.items.find((pItem) => pItem.hash === item.hash)
                      if (pItem) {
                        item.selectedQuantity = Math.min(pItem.selectedQuantity, item.quantity)
                      }
                    })

                    // Update prices and the the listing visibility
                    calculateMetaPrices(l, state.selectedItemsMap)
                    const { valid } = ListingFilterUtil.filterItems(l.items, state.filterGroups)
                    state.filteredByGroupListings[l.uuid] = valid
                  } else {
                    // Calculate the new listing
                    calculateListings(
                      [l],
                      state.selectedItemsMap,
                      state.filterGroups,
                      state.filteredByGroupListings
                    )
                  }
                  // We only replace listings with different uuids to prevent data loss
                  if (state.selectedItemsMap[prev.uuid]) {
                    delete state.selectedItemsMap[prev.uuid]
                  }
                  if (state.filteredByGroupListings[prev.uuid]) {
                    delete state.filteredByGroupListings[prev.uuid]
                  }

                  state.listingsMap[category || ''].splice(idx, 1, l)
                }
              }
              return false
            }
            if (l.deleted) return false
            // Its a new listing
            return true
          })

          // Calculate only new listings
          calculateListings(
            newListings,
            state.selectedItemsMap,
            state.filterGroups,
            state.filteredByGroupListings
          )

          if (state.listingsMap[category]) {
            state.listingsMap[category].push(...newListings)
          } else {
            state.listingsMap[category] = newListings
          }

          // Add default rowselection
          newListings.forEach((l) => {
            if (!state.selectedItemsMap[l.uuid]) {
              state.selectedItemsMap[l.uuid] = {}
            }
          })
        }),

      cleanupListings: () =>
        set((state) => {
          if (!state.category) return
          // Delete all listings timestampMs > 30min
          const now = dayjs.utc().valueOf()
          let idx = state.listingsMap[state.category].length
          while (idx--) {
            const l = state.listingsMap[state.category][idx]
            if (now - l.meta.timestampMs > 30 * 60 * 1000) {
              if (state.dialogOpen && state.selectedListingId === l.uuid) {
                state.dialogOpen = false
                console.warn('The dialog was closed because the opened listing got stale')
                useNotificationStore
                  .getState()
                  .addNotification('Sorry! The listing is stale and got deleted!', 'warning')
              }
              if (state.selectedItemsMap[l.uuid]) {
                delete state.selectedItemsMap[l.uuid]
              }
              if (state.filteredByGroupListings[l.uuid]) {
                delete state.filteredByGroupListings[l.uuid]
              }
              state.listingsMap[state.category].splice(idx, 1)
            }
          }
        }),

      addWhisperedListing: (id, hash) =>
        set((state) => {
          if (state.whisperedListings[id]) {
            if (!state.whisperedListings[id].sentHashes.includes(hash)) {
              state.whisperedListings[id].sentHashes.push(hash)
            }
            state.whisperedListings[id].lastCopiedHash = hash
          } else {
            state.whisperedListings[id] = { sentHashes: [hash], lastCopiedHash: hash }
          }
        }),
      // The items are already selected and calculated
      setSelectedListingId: (id) =>
        set({
          dialogOpen: true,
          selectedListingId: id
        }),

      setSelectedItems: (nextState) =>
        set((state) => {
          if (typeof nextState === 'function') {
            state.selectedItemsMap[state.selectedListingId || ''] = nextState(
              state.selectedItemsMap[state.selectedListingId || '']
            )
          } else {
            state.selectedItemsMap[state.selectedListingId || ''] = nextState
          }

          const listing = state.listingsMap[state.category || ''].find(
            (l) => l.uuid === state.selectedListingId
          )

          // Shouldn't happen
          if (!listing) return

          calculateMetaPrices(listing, state.selectedItemsMap)
        }),

      updateData: (rowIndex, columnId, value) =>
        set((state) => {
          const listing = state.listingsMap[state.category || ''].find(
            (l) => l.uuid === state.selectedListingId
          )
          if (!listing) return {}
          const item = listing.items.find((_, index) => index === rowIndex)

          if (item) {
            if (columnId === 'selectedQuantity') {
              if (typeof value === 'number') {
                item.selectedQuantity = value
              } else {
                item.selectedQuantity = 0
              }
            }
          }

          calculateMetaPrices(listing, state.selectedItemsMap)
        })
    })),
    {
      name: 'listings-items-storage',
      storage: createJSONStorage(() => localStorage),
      // TODO: On league change => increase version!
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const nextState = persistedState as State & Actions
        if (nextState && typeof nextState === 'object' && 'league' in nextState) {
          nextState.league = SUPPORTED_LEAGUES[0]
        }
        return nextState
      },
      partialize: (state) => ({
        league: state.league
      }),
      onRehydrateStorage: (state) => {
        console.log('hydration starts')

        // optional
        return (state, error) => {
          if (error) {
            console.log('an error happened during hydration', error)
          } else {
            console.log('hydration finished')
          }
        }
      }
    }
  )
)
