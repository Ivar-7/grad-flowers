import { useContext } from 'react'
import { FirebaseContext } from './firebase.context'
import type { FirebaseContextValue } from './firebase.types'
import { AppError } from '../errors/app-error'

export function useFirebase(): FirebaseContextValue {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new AppError({
      code: 'FIREBASE_CONTEXT_MISSING',
      userMessage: 'Application services are temporarily unavailable.',
      technicalMessage: 'useFirebase must be used within a FirebaseProvider',
      statusCode: 500,
      severity: 'fatal',
    })
  }
  return context
}
