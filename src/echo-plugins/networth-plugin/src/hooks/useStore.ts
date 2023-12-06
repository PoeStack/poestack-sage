import { useContext } from 'react'
import { StoreContext } from '../context/store'

export const useStore = () => useContext(StoreContext)
