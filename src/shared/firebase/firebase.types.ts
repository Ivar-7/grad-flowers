import type { FirebaseApp } from 'firebase/app'
import type { Analytics } from 'firebase/analytics'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

export interface FirebaseContextValue {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
  analytics: Analytics | null
  isReady: boolean
}
