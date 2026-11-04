import { useEffect, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser } from '../types/auth.types'
import type {
  AuthCredentials,
  SignUpInput,
  ForgotPasswordInput,
} from '../types/auth.schema'
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle as apiLoginWithGoogle,
  requestPasswordReset,
  logoutUser,
  subscribeToAuthState,
} from '../api/auth.api'
import { AuthContext, type AuthContextValue } from './auth.context'

export interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (credentials: AuthCredentials) => {
    setIsLoading(true)
    try {
      const authUser = await loginWithEmail(credentials)
      setUser(authUser)
      return authUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (input: SignUpInput) => {
    setIsLoading(true)
    try {
      const authUser = await registerWithEmail(input)
      setUser(authUser)
      return authUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    try {
      const authUser = await apiLoginWithGoogle()
      setUser(authUser)
      return authUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendPasswordReset = useCallback(async (input: ForgotPasswordInput) => {
    await requestPasswordReset(input)
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    loginWithGoogle,
    sendPasswordReset,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
