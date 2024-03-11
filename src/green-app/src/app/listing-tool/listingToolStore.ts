'use client'

import { SUPPORTED_LEAGUES } from '@/lib/constants'
import { calculateItemPrices } from '@/lib/item-util'
import { ListingCategory } from '@/lib/listing-categories'
import { IDisplayedItem } from '@/types/echo-api/priced-item'
import { IStashTab } from '@/types/echo-api/stash'
import { ListingMode } from '@/types/sage-listing-type'
import { RowSelectionState } from '@tanstack/react-table'
import _ from 'lodash-es'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const getCategory = (
  state?: State,
  category?: string | null,
  subCategory?: string | null
) => {
  return (category || state?.category || '') + (subCategory || state?.subCategory || '')
}

type State = {
  league: string // Persisted
  stashes: Record<string, IStashTab[]>
  category: string | null
  subCategory: string | null
  selectableCategories: ListingCategory[]
  localMultiplier: number
  categoryListingMode: Record<string, ListingMode> // Persisted
  categoryMultiplier: Record<string, number> // Persisted
  selectedItems: RowSelectionState
  modifiedItems: IDisplayedItem[]
  overprices: Record<string, number> // Persisted
  unselectedItems: RowSelectionState // Persisted
  totalPrice: number
}

type Actions = {
  setLeague: (league: string) => void
  setStashes: (stashes: IStashTab[]) => void
  setCategory: (category: string | null) => void
  setSubCategory: (category: string | null) => void
  setSelectableCategories: (categories: ListingCategory[]) => void
  debouncedMultiplier: _.DebouncedFunc<
    (multiplier: number, selectedCategory: string | null) => void
  >
  setCategoryListingMode: (listingMode: ListingMode, category?: string | null) => void
  setLocalMultiplier: (multiplier: number, category: string | null) => void
  setMultiplier: (localMultiplier: number, category: string | null) => void
  resetData: () => void
  setInitialItems: (items: IDisplayedItem[]) => void
  updateData: (rowIndex: number, columnId: string, value: number | string) => void
  setSelectedItems: React.Dispatch<React.SetStateAction<RowSelectionState>>
  reset: () => void
}

const calculateTotalPrice = (item: IDisplayedItem, selectedItems: RowSelectionState) => {
  if (item.group && selectedItems[item.group.hash]) {
    return item.calculatedTotal
  }
  return 0
}

const initialState: State = {
  league: SUPPORTED_LEAGUES[0], // Persisted
  stashes: Object.fromEntries(SUPPORTED_LEAGUES.map((l) => [l, []])),
  category: null,
  subCategory: null,
  selectableCategories: [],
  localMultiplier: 100,
  categoryListingMode: {}, // Persisted
  categoryMultiplier: {}, // Persisted
  selectedItems: {},
  modifiedItems: [],
  overprices: {}, // Persisted
  unselectedItems: {}, // Persisted
  totalPrice: 0
}

export const useListingToolStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      reset: () => set(initialState),
      setLeague: (league) => set({ league }),
      setStashes: (nextStashes) =>
        set((state) => {
          const stashes = { ...state.stashes }
          stashes[state.league] = nextStashes
          return { stashes }
        }),
      setCategory: (category) => set({ category }),
      setSubCategory: (subCategory) => set({ subCategory }),
      setSelectableCategories: (selectableCategories) => set({ selectableCategories }),
      resetData: () => {
        set((state) => {
          let totalPrice = 0
          const preSelectedItems: RowSelectionState = {}
          const updatedItems = state.modifiedItems.map((originalItem) => {
            const item = { ...originalItem }
            if (item.group) {
              preSelectedItems[item.group.hash] = true
            }
            item.selectedPrice = undefined
            calculateItemPrices(item, 1)
            totalPrice += calculateTotalPrice(item, preSelectedItems)
            return item
          })

          return {
            localMultiplier: 100,
            categoryMultiplier: {},
            selectedItems: preSelectedItems,
            modifiedItems: updatedItems,
            overprices: {},
            unselectedItems: {},
            totalPrice
          }
        })
      },
      setCategoryListingMode: (listingMode, category) =>
        set((state) => {
          let categoryListingMode = state.categoryListingMode
          if (category) {
            categoryListingMode = { ...state.categoryListingMode, [category]: listingMode }
          } else if (category === undefined) {
            categoryListingMode = {
              ...state.categoryListingMode,
              [getCategory(state)]: listingMode
            }
          }
          return { categoryListingMode }
        }),
      debouncedMultiplier: _.debounce(
        (localMultiplier: number, selectedCategory: string | null) =>
          get().setMultiplier(localMultiplier, selectedCategory),
        5
      ),
      setLocalMultiplier: (localMultiplier, category) => {
        set((state) => {
          state.debouncedMultiplier(localMultiplier, category)
          return { localMultiplier }
        })
      },
      setMultiplier: (localMultiplier, category) =>
        set((state) => {
          let categoryMultiplier = state.categoryMultiplier
          if (category) {
            console.log('Set categoryMultiplier', category, localMultiplier)
            categoryMultiplier = { ...state.categoryMultiplier, [category]: localMultiplier }
          }

          let totalPrice = 0
          const updatedItems = state.modifiedItems.map((originalItem) => {
            const item = { ...originalItem }
            calculateItemPrices(item, localMultiplier / 100)
            totalPrice += calculateTotalPrice(item, state.selectedItems)
            return item
          })
          return {
            modifiedItems: updatedItems,
            localMultiplier: localMultiplier,
            totalPrice,
            categoryMultiplier
          }
        }),
      setInitialItems: (items, category) =>
        set((state) => {
          const preSelectedItems: RowSelectionState = {}
          // Preselect all items
          items.forEach((item) => {
            if (item.group && !state.unselectedItems[item.group.hash]) {
              preSelectedItems[item.group.hash] = true
            }
          })
          const multiplier = getCategory(state)
            ? state.categoryMultiplier[getCategory(state)] || state.localMultiplier
            : state.localMultiplier

          let totalPrice = 0
          items.forEach((item) => {
            calculateItemPrices(item, multiplier / 100)
            totalPrice += calculateTotalPrice(item, preSelectedItems)
          })
          return {
            modifiedItems: items,
            totalPrice,
            selectedItems: preSelectedItems,
            localMultiplier: multiplier
          }
        }),
      setSelectedItems: (nextState) =>
        set((state) => {
          let selectedItems: RowSelectionState = {}
          const unselectedItems: RowSelectionState = {}
          if (typeof nextState === 'function') {
            selectedItems = nextState(state.selectedItems)
          } else {
            selectedItems = nextState
          }

          let totalPrice = 0
          state.modifiedItems.forEach((item) => {
            if (item.group) {
              if (!selectedItems[item.group.hash]) {
                unselectedItems[item.group.hash] = true
              } else if (unselectedItems[item.group.hash] !== undefined) {
                delete unselectedItems[item.group.hash]
              }
            }
            totalPrice += calculateTotalPrice(item, selectedItems)
          })

          return { selectedItems, unselectedItems, totalPrice }
        }),
      updateData: (rowIndex, columnId, value) =>
        set((state) => {
          let totalPrice = 0
          const overprices = { ...state.overprices }
          const newModifiedItems = state.modifiedItems.map((row, index): IDisplayedItem => {
            if (index === rowIndex) {
              if (columnId === 'selectedPrice') {
                const item: IDisplayedItem = { ...row }
                if (typeof value === 'number') {
                  item.selectedPrice = value
                } else {
                  item.selectedPrice = undefined
                }
                calculateItemPrices(item, state.localMultiplier / 100)

                if (item.group) {
                  if (item.selectedPrice !== undefined) {
                    overprices[item.group.hash] = item.selectedPrice
                  } else if (overprices[item.group.hash] !== undefined) {
                    delete overprices[item.group.hash]
                  }
                }
                totalPrice += calculateTotalPrice(item, state.selectedItems)
                return item
              }
              const item: IDisplayedItem = {
                ...row,
                [columnId]: value
              }
              totalPrice += calculateTotalPrice(item, state.selectedItems)
              return item
            }
            totalPrice += calculateTotalPrice(row, state.selectedItems)
            return row
          })

          return { modifiedItems: newModifiedItems, totalPrice, overprices }
        })
    }),
    {
      name: 'offering-items-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        league: state.league,
        categoryListingMode: state.categoryListingMode,
        categoryMultiplier: state.categoryMultiplier,
        overprices: state.overprices,
        unselectedItems: state.unselectedItems
      }),
      // TODO: On league change => increase version!
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const nextState = persistedState as State & Actions
        if (nextState && typeof nextState === 'object' && 'league' in nextState) {
          nextState.league = SUPPORTED_LEAGUES[0]
        }
        return nextState
      },
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
