import { computed } from 'mobx'
import {
  detach,
  idProp,
  model,
  Model,
  modelAction,
  prop,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { ItemTableSelectionType } from '../../interfaces/item-table-selection.interface'
import { StashTab } from './stashtab'
import {
  ColumnSizingState,
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
  VisibilityState
} from '@tanstack/react-table'
import { PersistWrapper } from '../../utils/persist.utils'

export const tableStashTabRef = rootRef<StashTab>('nw/tableStashTabRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

interface ITableView {
  setPagination: OnChangeFn<PaginationState>
  setGlobalFilter: OnChangeFn<string>
  setSorting: OnChangeFn<SortingState>
  setColumnVisibility: OnChangeFn<VisibilityState>
  setColumnSizing: OnChangeFn<ColumnSizingState>
}

@model('nw/tableview')
export class TableView
  extends Model(
    ...PersistWrapper(
      {
        id: idProp,
        globalFilter: tProp(types.string, ''),
        sorting: prop<SortingState>(() => [
          {
            desc: true,
            id: 'total'
          }
        ]),
        columnVisibility: prop<VisibilityState>(() => ({
          tag: false
        })),
        columnSizing: prop<ColumnSizingState>(() => ({})),
        pageSize: tProp(25).withSetter(),
        pageIndex: tProp(0).withSetter(),
        showPricedItems: tProp(true),
        showUnpricedItems: tProp(false),
        itemTableSelection: prop<ItemTableSelectionType>('latest').withSetter(),
        filteredStashTabsRef: tProp(
          // TODO: implement
          types.maybe(types.array(types.ref(tableStashTabRef)))
        ).withSetter(),
        version: prop(1)
      },
      {
        blacklist: ['globalFilter', 'pageIndex', 'itemTableSelection']
      }
    )
  )
  implements ITableView
{
  @computed
  get filteredStashTabs() {
    return this.filteredStashTabsRef?.filter((x) => x.maybeCurrent).map((x) => x.maybeCurrent!)
  }

  @modelAction
  changeItemTablePage(index: number) {
    this.pageIndex = index
  }

  @modelAction
  setShowPricedItems(show: boolean) {
    this.showPricedItems = show
    if (!this.showPricedItems && this.showUnpricedItems && this.columnVisibility) {
      this.columnVisibility.unsafeHashProperties = false
    } else {
      this.columnVisibility.unsafeHashProperties = true
    }
  }
  @modelAction
  setShowUnpricedItems(show: boolean) {
    this.showUnpricedItems = show
    if (!this.showPricedItems && this.showUnpricedItems && this.columnVisibility) {
      this.columnVisibility.unsafeHashProperties = false
    } else {
      this.columnVisibility.unsafeHashProperties = true
    }
  }

  @modelAction
  setGlobalFilter(updaterOrValue: Updater<string>) {
    let globalFilter: string
    if (typeof updaterOrValue === 'function') {
      globalFilter = updaterOrValue(this.globalFilter)
    } else {
      globalFilter = updaterOrValue
    }
    this.globalFilter = globalFilter
  }

  @modelAction
  setSorting(updaterOrValue: Updater<SortingState>) {
    let sorting: SortingState
    if (typeof updaterOrValue === 'function') {
      sorting = updaterOrValue(this.sorting)
    } else {
      sorting = updaterOrValue
    }
    this.sorting = sorting
  }

  @modelAction
  setColumnVisibility(updaterOrValue: Updater<VisibilityState>) {
    let columnVisibility: VisibilityState
    if (typeof updaterOrValue === 'function') {
      columnVisibility = updaterOrValue(this.columnVisibility)
    } else {
      columnVisibility = updaterOrValue
    }
    console.log(columnVisibility)
    this.columnVisibility = columnVisibility
  }

  @modelAction
  setColumnSizing(updaterOrValue: Updater<ColumnSizingState>) {
    let columnSizing: ColumnSizingState
    if (typeof updaterOrValue === 'function') {
      columnSizing = updaterOrValue(this.columnSizing)
    } else {
      columnSizing = updaterOrValue
    }
    this.columnSizing = columnSizing
  }

  @computed
  get pagination(): PaginationState {
    return {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    }
  }

  @modelAction
  setPagination(updaterOrValue: Updater<PaginationState>) {
    let pagination: PaginationState
    if (typeof updaterOrValue === 'function') {
      pagination = updaterOrValue({ pageIndex: this.pageIndex, pageSize: this.pageSize })
    } else {
      pagination = updaterOrValue
    }
    this.setPageSize(pagination.pageSize)
    this.setPageIndex(pagination.pageIndex)
  }
}
