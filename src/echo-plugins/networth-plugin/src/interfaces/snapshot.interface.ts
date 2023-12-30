import { PoeItem } from 'sage-common'
import { IStashTabNode } from './stash.interface'

export interface IStashTabItems {
  stashTab: IStashTabNode | string
  items: PoeItem[]
}
