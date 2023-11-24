import { useStore } from './useStore'
import { RootStore } from '../store/rootStore'

export type MapStore<T> = (store: RootStore) => T

const useInject = <T>(mapStore: MapStore<T>) => {
  const store = useStore()
  return mapStore(store)
}

export default useInject
