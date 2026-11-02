import { useEffect, useState, type ReactNode } from 'react'
import type { Analytics } from 'firebase/analytics'
import { app, auth, db, storage, initAnalytics } from './firebase'
import { FirebaseContext } from './firebase.context'
import type { FirebaseContextValue } from './firebase.types'

export interface FirebaseProviderProps {
  children: ReactNode
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isReady, setIsReady] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    initAnalytics()
      .then((instance) => {
        if (isMounted) {
          setAnalytics(instance)
          setIsReady(true)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsReady(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const value: FirebaseContextValue = {
    app,
    auth,
    db,
    storage,
    analytics,
    isReady,
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}
