import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import {
  AuthCredentialsSchema,
  SignUpSchema,
  type AuthCredentials,
  type SignUpInput,
} from '../types/auth.schema'
import type { AuthUser } from '../types/auth.types'

export function mapFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

export async function loginWithEmail(
  credentials: AuthCredentials,
): Promise<AuthUser> {
  const validated = AuthCredentialsSchema.parse(credentials)
  try {
    const creds = await signInWithEmailAndPassword(
      auth,
      validated.email,
      validated.password,
    )
    const user = mapFirebaseUser(creds.user)
    if (!user) {
      throw new Error('User profile missing after authentication')
    }
    return user
  } catch (error) {
    const appError = normalizeError(
      error,
      'Sign-in failed. Please check your credentials.',
    )
    logError(appError, { feature: 'auth', action: 'loginWithEmail' })
    throw appError
  }
}

export async function registerWithEmail(input: SignUpInput): Promise<AuthUser> {
  const validated = SignUpSchema.parse(input)
  try {
    const creds = await createUserWithEmailAndPassword(
      auth,
      validated.email,
      validated.password,
    )
    if (creds.user && validated.displayName) {
      await updateProfile(creds.user, { displayName: validated.displayName })
    }
    const user = mapFirebaseUser(creds.user)
    if (!user) {
      throw new Error('User profile missing after account registration')
    }
    return user
  } catch (error) {
    const appError = normalizeError(
      error,
      'Registration failed. Please check your inputs.',
    )
    logError(appError, { feature: 'auth', action: 'registerWithEmail' })
    throw appError
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    const appError = normalizeError(error, 'Unable to sign out at this moment.')
    logError(appError, { feature: 'auth', action: 'logoutUser' })
    throw appError
  }
}

export function subscribeToAuthState(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user))
  })
}
