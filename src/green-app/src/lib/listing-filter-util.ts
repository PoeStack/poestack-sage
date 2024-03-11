import { ListingFilter, ListingFilterGroup } from '@/components/trade-filter-card'
import { SageListingItemType } from '@/types/sage-listing-type'

type ResultCountItem = {
  item: SageListingItemType
  filtered: boolean
  minQuantity?: number
  index: number
}

type ResultCountGroup = {
  minQuantity: number
  filters: Record<string, ListingFilter>
  items: ResultCountItem[]
}

export class ListingFilterUtil {
  static combineFilter = (filterGroups: ListingFilterGroup[]) => {
    filterGroups = filterGroups ?? []

    const andFilters: Record<string, ListingFilter> = {}
    const andGroups = filterGroups.filter((group) => group.selected && group.mode === 'AND')
    const hasAndGroups = andGroups.length > 0
    andGroups
      .flatMap((group) => group.filters)
      .forEach((filter) => {
        if (
          !!filter.option?.hash &&
          filter.selected &&
          (!andFilters[filter.option.hash] ||
            (filter.minimumQuantity || 0) > (andFilters[filter.option.hash].minimumQuantity || 0))
        ) {
          andFilters[filter.option.hash] = filter
        }
      })

    const countGroups: { minQuantity: number; filters: Record<string, ListingFilter> }[] = []
    filterGroups
      .filter((group) => group.selected && group.mode === 'COUNT')
      .forEach((group) => {
        const countFilters: Record<string, ListingFilter> = {}
        group.filters.map((filter) => {
          if (
            !!filter.option?.hash &&
            filter.selected &&
            (!countFilters[filter.option.hash] ||
              (filter.minimumQuantity || 0) >
                (countFilters[filter.option.hash].minimumQuantity || 0))
          ) {
            countFilters[filter.option.hash] = filter
          }
        })
        countGroups.push({
          minQuantity: group.minimumQuantity || 0,
          filters: countFilters
        })
      })

    const notFilters: Record<string, ListingFilter> = {}
    filterGroups
      .filter((group) => group.selected && group.mode === 'NOT')
      .flatMap((group) => group.filters)
      .forEach((filter) => {
        if (
          !!filter.option?.hash &&
          filter.selected &&
          (!notFilters[filter.option.hash] ||
            (filter.minimumQuantity || 0) < (notFilters[filter.option.hash].minimumQuantity || 0))
        ) {
          notFilters[filter.option.hash] = filter
        }
      })

    return { hasAndGroups, andFilters, countGroups, notFilters }
  }

  static filterItems(items: SageListingItemType[], filterGroups: ListingFilterGroup[]) {
    const { hasAndGroups, andFilters, countGroups, notFilters } = this.combineFilter(filterGroups)

    let notFilterValid = true

    const andItems: ResultCountItem[] = []

    const countGroupResult: ResultCountGroup[] = countGroups.map((countGroup) => {
      return {
        minQuantity: countGroup.minQuantity,
        filters: countGroup.filters,
        items: []
      }
    })

    items.forEach((item, index) => {
      let result = false
      let filtered = false
      const andFiltersLength = Object.keys(andFilters).length
      if (andFilters[item.hash]) {
        filtered = true
        if (item.quantity >= (andFilters[item.hash].minimumQuantity || 0)) {
          result = true
        }
      } else if (hasAndGroups && andFiltersLength === 0) {
        result = true
      }

      countGroupResult.forEach((countGroup) => {
        let result = false
        const countFilters = countGroup.filters
        const countFiltersLength = Object.keys(countFilters).length

        if (countFilters[item.hash]) {
          filtered = true
          if (item.quantity >= (countFilters[item.hash].minimumQuantity || 0)) {
            result = true
          }
        } else if (countFiltersLength === 0) {
          result = true
        }

        if (result) {
          countGroup.items.push({
            item,
            minQuantity: countFilters[item.hash]?.minimumQuantity,
            filtered,
            index
          })
        }
      })

      if (
        notFilters[item.hash] &&
        (notFilters[item.hash].minimumQuantity === undefined ||
          item.quantity < (notFilters[item.hash].minimumQuantity || 0))
      ) {
        notFilterValid = false
      }

      if (result) {
        andItems.push({
          item,
          minQuantity: andFilters[item.hash]?.minimumQuantity,
          filtered,
          index
        })
      }
    })

    const resultItems: Record<number, ResultCountItem> = {}

    const allAndFiltersValid = Object.entries(andFilters).every(([hash]) =>
      andItems.some((out) => out.item.hash === hash)
    )

    if (allAndFiltersValid) {
      andItems.forEach((out) => {
        if (
          !resultItems[out.index] ||
          (out.minQuantity || 0) > (resultItems[out.index].minQuantity || 0)
        ) {
          resultItems[out.index] = out
        }
      })
    }

    const countFiltersValid = countGroupResult.every((countGroup) => {
      const validFilterCount = Object.entries(countGroup.filters).filter(([hash]) =>
        countGroup.items.some((out) => out.item.hash === hash)
      ).length
      if (validFilterCount >= countGroup.minQuantity) {
        countGroup.items.forEach((out) => {
          if (
            !resultItems[out.index] ||
            (out.minQuantity || 0) > (resultItems[out.index].minQuantity || 0)
          ) {
            resultItems[out.index] = out
          }
        })

        return true
      }
      return false
    })

    const valid = allAndFiltersValid && notFilterValid && countFiltersValid

    return {
      valid,
      items: valid ? Object.values(resultItems) : []
    }
  }
}
