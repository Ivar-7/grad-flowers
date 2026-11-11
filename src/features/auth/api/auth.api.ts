import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import {
  AuthCredentialsSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  type AuthCredentials,
  type SignUpInput,
  type ForgotPasswordInput,
} from '../types/auth.schema'
import type { AuthUser, UserProfileDoc, UserRole } from '../types/auth.types'

export function mapFirebaseUser(
  user: User | null,
  role: UserRole = 'customer',
): AuthUser | null {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    createdAt: user.metadata.creationTime,
    role,
  }
}

async function syncUserProfileDoc(
  user: User,
  fallbackName?: string,
): Promise<UserRole> {
  try {
    const userDocRef = doc(db, 'users', user.uid)
    const existingSnap = await getDoc(userDocRef)
    const existingData = existingSnap.exists()
      ? (existingSnap.data() as Partial<UserProfileDoc>)
      : null
    const existingRole: UserRole =
      existingData?.role === 'admin' || existingData?.role === 'staff'
        ? existingData.role
        : 'customer'

    const now = new Date().toISOString()
    const profile: Partial<UserProfileDoc> = {
      uid: user.uid,
      email: user.email,
      displayName:
        user.displayName ?? fallbackName ?? existingData?.displayName ?? null,
      photoURL: user.photoURL ?? existingData?.photoURL ?? null,
      updatedAt: now,
      ...(existingSnap.exists() ? {} : { createdAt: now, role: 'customer' }),
    }
    await setDoc(userDocRef, profile, { merge: true })
    return existingRole
  } catch (error) {
    logError(normalizeError(error, 'User profile sync encountered an issue.'), {
      feature: 'auth',
      action: 'syncUserProfileDoc',
      metadata: { uid: user.uid },
    })
    return 'customer'
  }
}

export async function fetchUserRole(uid: string): Promise<UserRole> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const role = (snap.data() as Partial<UserProfileDoc>).role
      if (role === 'admin' || role === 'staff') {
        return role
      }
    }
  } catch {
    // Default to customer if offline or restricted
  }
  return 'customer'
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
    const role = await syncUserProfileDoc(creds.user)
    const authUser = mapFirebaseUser(creds.user, role)
    if (!authUser) {
      throw new Error('User profile missing after authentication')
    }
    return authUser
  } catch (error) {
    const appError = normalizeError(
      error,
      'Sign-in failed. Please verify your email and password.',
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
    const role = await syncUserProfileDoc(creds.user, validated.displayName)
    const authUser = mapFirebaseUser(creds.user, role)
    if (!authUser) {
      throw new Error('User profile missing after account registration')
    }
    return authUser
  } catch (error) {
    const appError = normalizeError(
      error,
      'Registration failed. Please check your inputs.',
    )
    logError(appError, { feature: 'auth', action: 'registerWithEmail' })
    throw appError
  }
}

export async function loginWithGoogle(): Promise<AuthUser> {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const creds = await signInWithPopup(auth, provider)
    const role = await syncUserProfileDoc(creds.user)
    const authUser = mapFirebaseUser(creds.user, role)
    if (!authUser) {
      throw new Error('User profile missing after Google sign-in')
    }
    return authUser
  } catch (error) {
    const appError = normalizeError(
      error,
      'Google sign-in was cancelled or encountered an error.',
    )
    logError(appError, { feature: 'auth', action: 'loginWithGoogle' })
    throw appError
  }
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<void> {
  const validated = ForgotPasswordSchema.parse(input)
  try {
    await sendPasswordResetEmail(auth, validated.email)
  } catch (error) {
    const appError = normalizeError(
      error,
      'Unable to send password reset email at this time.',
    )
    logError(appError, {
      feature: 'auth',
      action: 'requestPasswordReset',
      metadata: { email: validated.email },
    })
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
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const role = await fetchUserRole(firebaseUser.uid)
    callback(mapFirebaseUser(firebaseUser, role))
  })
}
