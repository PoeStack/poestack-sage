import { useContext, createContext } from 'react'
import { RootStore } from '../store/rootStore'

export const StoreContext = createContext<RootStore>({} as RootStore)
