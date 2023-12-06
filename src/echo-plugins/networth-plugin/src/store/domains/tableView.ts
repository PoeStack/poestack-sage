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
import { OnChangeFn, PaginationState, Updater } from '@tanstack/react-table'
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
}

@model('nw/tableview')
export class TableView
  extends Model(
    ...PersistWrapper(
      {
        id: idProp,
        globalFilter: tProp(types.string, ''),
        pageSize: tProp(25).withSetter(),
        pageIndex: tProp(0).withSetter(),
        showPricedItems: tProp(true).withSetter(),
        showUnpricedItems: tProp(false).withSetter(),
        itemTableSelection: prop<ItemTableSelectionType>('latest').withSetter(),
        filteredStashTabsRef: tProp(
          // TODO: implement
          types.maybe(types.array(types.ref(tableStashTabRef)))
        ).withSetter(),
        version: prop(1)
      },
      {
        whitelist: ['showPricedItems', 'showUnpricedItems']
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
  setGlobalFilter(updaterOrValue: Updater<string>) {
    let globalFilter: string
    if (typeof updaterOrValue === 'function') {
      globalFilter = updaterOrValue(this.globalFilter)
    } else {
      globalFilter = updaterOrValue
    }
    this.globalFilter = globalFilter
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
