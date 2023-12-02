import { reaction } from 'mobx'
import { getRoot, model, Model, modelAction, tProp, types } from 'mobx-keystone'
import { valuateItems } from '../service/external.service'
import { RootStore } from './rootStore'
import { catchError, interval, mergeMap, of, switchMap, toArray } from 'rxjs'

@model('nw/priceStore')
export class PriceStore extends Model({
  exaltedPrice: tProp(types.number, 0).withSetter(),
  divinePrice: tProp(types.number, 0).withSetter()
}) {
  onAttachedToRootStore() {
    const getItemObserable = (league: string) =>
      valuateItems(league, [{ typeLine: 'Divine Orb' }, { typeLine: 'Exalted Orb' }]).pipe(
        mergeMap((valuation) => {
          // For currencies we use the most stable divine price
          const price = valuation.valuation?.pvs[4]
          if (price) {
            if (valuation.data.typeLine === 'Divine Orb') {
              console.log('Set divine price: ', price)
              this.setDivinePrice(price)
            }
            if (valuation.data.typeLine === 'Exalted Orb') {
              console.log('Set exalted price: ', price)
              this.setExaltedPrice(price)
            }
          }
          return of(price)
        }),
        toArray(),
        switchMap(() => of(this.priceItemsSuccess())),
        catchError((e: Error) => of(this.priceItemsFail(e)))
      )
    // TODO: Add listener to echo-valuation-subject-cache

    const reactionDisposer = reaction(
      () => {
        // Run pricecheck when priceleague changes
        const { accountStore } = getRoot<RootStore>(this)
        return accountStore.activeAccount.activePriceLeague
      },
      (priceLeague) => {
        if (!priceLeague) return
        getItemObserable(priceLeague.name).subscribe()
      }
    )

    // Run pricecheck every 20 min
    const intervalSub = interval(20 * 60 * 1000).subscribe(() => {
      const { accountStore } = getRoot<RootStore>(this)
      const priceLeague = accountStore.activeAccount.activePriceLeague
      if (priceLeague) getItemObserable(priceLeague.name).subscribe()
    })

    return () => {
      reactionDisposer()
      intervalSub.unsubscribe()
    }
  }

  @modelAction
  priceItemsSuccess() {
    const { notificationStore } = getRoot<RootStore>(this)
    notificationStore.createNotification('price_price_store_items', 'success')
  }

  @modelAction
  priceItemsFail(e: Error) {
    const { notificationStore } = getRoot<RootStore>(this)
    notificationStore.createNotification('price_price_store_items', 'error', true, e)
  }
}
