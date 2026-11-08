import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getFunctions, type Functions } from 'firebase/functions'
import type { Analytics } from 'firebase/analytics'
import { firebaseConfig } from './firebase.config'
import { logError } from '../errors/error-logger'
import { normalizeError } from '../errors/error-normalizer'

// Singleton initialization
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)
export const functions: Functions = getFunctions(app)

let analyticsInstance: Analytics | null = null

export async function initAnalytics(): Promise<Analytics | null> {
  if (analyticsInstance) {
    return analyticsInstance
  }

  try {
    // Dynamic import so ad blockers blocking the analytics chunk cannot break app rendering
    const { getAnalytics, isSupported } = await import('firebase/analytics')
    const supported = await isSupported()
    if (supported && typeof window !== 'undefined') {
      analyticsInstance = getAnalytics(app)
      return analyticsInstance
    }
  } catch (error) {
    const appError = normalizeError(error, 'Analytics initialization failed.')
    logError(appError, {
      feature: 'Firebase',
      action: 'initAnalytics',
    })
  }

  return null
}
