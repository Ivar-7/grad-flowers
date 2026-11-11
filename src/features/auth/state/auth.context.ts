import { createContext } from 'react'
import type { AuthUser } from '../types/auth.types'
import type {
  AuthCredentials,
  SignUpInput,
  ForgotPasswordInput,
} from '../types/auth.schema'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isStaffOrAdmin: boolean
  isAdmin: boolean
  login: (credentials: AuthCredentials) => Promise<AuthUser>
  register: (input: SignUpInput) => Promise<AuthUser>
  loginWithGoogle: () => Promise<AuthUser>
  sendPasswordReset: (input: ForgotPasswordInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
