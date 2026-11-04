export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt?: string
}

export interface UserProfileDoc {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string
  updatedAt: string
  role: 'customer' | 'admin'
}

export type AuthMode = 'signin' | 'signup' | 'forgot-password'

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}
