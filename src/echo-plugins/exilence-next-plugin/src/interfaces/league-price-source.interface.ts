import { IExternalPrice } from './external-price.interface'

export interface ILeaguePriceSource {
  uuid?: string
  priceSourceUuid: string
  prices: IExternalPrice[]
  pricedFetchedAt?: number
}
