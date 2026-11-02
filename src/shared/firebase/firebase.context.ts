import { createContext } from 'react'
import type { FirebaseContextValue } from './firebase.types'

export const FirebaseContext = createContext<FirebaseContextValue | null>(null)

