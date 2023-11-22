import { useStore } from './useStore'
import { IStore } from '../store/rootStore'

export type MapStore<T> = (store: IStore) => T

const useInject = <T>(mapStore: MapStore<T>) => {
  const store = useStore()
  return mapStore(store)
}

export default useInject
