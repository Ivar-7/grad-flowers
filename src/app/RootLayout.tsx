import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/shared/ui/Header'
import { Footer } from '@/shared/ui/Footer'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorBoundary } from '@/shared/errors/ErrorBoundary'

export function RootLayout() {
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
    </div>
  )
}
