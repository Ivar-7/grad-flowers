import type { ReactNode } from 'react'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import { FirebaseProvider } from '@/shared/firebase/FirebaseProvider'
import { ReferralProvider } from '@/shared/referral/ReferralProvider'
import { AuthProvider } from '@/features/auth/state/AuthProvider'
import { CartProvider } from '@/features/cart/state/CartProvider'
import { ErrorBoundary } from '@/shared/errors/ErrorBoundary'

export interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <FirebaseProvider>
          <ReferralProvider>
            <AuthProvider>
              <CartProvider>{children}</CartProvider>
            </AuthProvider>
          </ReferralProvider>
        </FirebaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
