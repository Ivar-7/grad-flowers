import { createContext } from 'react'
import type { AuthUser } from '../types/auth.types'
import type { AuthCredentials, SignUpInput } from '../types/auth.schema'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: AuthCredentials) => Promise<AuthUser>
  register: (input: SignUpInput) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

