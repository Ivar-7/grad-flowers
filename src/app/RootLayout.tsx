import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { SITE_CONFIG } from '@/shared/config/site.config'
import { Header } from '@/shared/ui/Header'
import { Footer } from '@/shared/ui/Footer'
import { LoadingState } from '@/shared/ui/LoadingState'
import { WhatsAppButton } from '@/shared/ui/WhatsAppButton'
import { ErrorBoundary } from '@/shared/errors/ErrorBoundary'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { QuickOrderModal } from '@/features/checkout/components/QuickOrderModal'

export function RootLayout() {
  useEffect(() => {
    document.title = `${SITE_CONFIG.fullBrandName} — ${SITE_CONFIG.tagline}`
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-200">
      <Header />
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <Suspense
            fallback={<LoadingState message="Loading page..." fullPage />}
          >
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
      <QuickOrderModal />
    </div>
  )
}
