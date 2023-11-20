import { useContext, createContext } from 'react'
import { Store, IStore } from '../mst-store/rootStore'

export const StoreContext = createContext<IStore>({} as IStore)
