import { ListingFilter, ListingFilterGroup } from '@/components/trade-filter-card'
import { SageListingItemType, SageListingType } from '@/types/sage-listing-type'

export class ListingFilterUtil {
  static combineFilter = (filterGroups: ListingFilterGroup[]) => {
    filterGroups = filterGroups ?? []

    const andFilters: Record<string, ListingFilter> = {}
    filterGroups
      .filter((group) => group.selected && group.mode === 'AND')
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

    const countFilters: Record<string, ListingFilter> = {}
    filterGroups
      .filter((group) => group.selected && group.mode === 'COUNT')
      .flatMap((group) => group.filters)
      .forEach((filter) => {
        if (
          !!filter.option?.hash &&
          filter.selected &&
          (!countFilters[filter.option.hash] ||
            (filter.minimumQuantity || 0) > (countFilters[filter.option.hash].minimumQuantity || 0))
        ) {
          countFilters[filter.option.hash] = filter
        }
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

    return { andFilters, countFilters, notFilters }
  }

  static filterItems(items: SageListingItemType[], filterGroups: ListingFilterGroup[]) {
    // TODO: Add calculation for COUNT
    const { andFilters, countFilters, notFilters } = this.combineFilter(filterGroups)

    let notFilterValid = true

    let andItems: {
      item: SageListingItemType
      filtered: boolean
      minQuantity?: number
      index: number
    }[] = []

    items.forEach((item, index) => {
      let result = false
      let filtered = false
      const filtersLength = Object.keys(andFilters).length
      if (andFilters[item.hash]) {
        filtered = true
        if (item.quantity >= (andFilters[item.hash].minimumQuantity || 0)) {
          result = true
        }
      } else if (filtersLength === 0) {
        result = true
      }

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

    const allAndFiltersValid = Object.entries(andFilters).every(([hash]) =>
      andItems.some((out) => out.item.hash === hash)
    )
    if (!allAndFiltersValid) {
      andItems = []
    }

    return { valid: allAndFiltersValid && notFilterValid, items: andItems }
  }
}
