export type UserRole = 'customer' | 'staff' | 'admin'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt?: string
  role: UserRole
}

export interface UserProfileDoc {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string
  updatedAt: string
  role: UserRole
}

export type AuthMode = 'signin' | 'signup' | 'forgot-password'

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}
