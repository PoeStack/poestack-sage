import { IExternalPrice } from './external-price.interface'

export interface ILeaguePriceDetails {
  uuid?: string
  leagueId: string
}

export interface ILeaguePriceDetailsEntity extends ILeaguePriceDetails {
  leaguePriceSourceIds: string[]
}
