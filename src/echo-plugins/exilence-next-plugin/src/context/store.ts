import { useContext, createContext } from 'react'
import { Store, IStore } from '../store/rootStore'

export const StoreContext = createContext<IStore>({} as IStore)
