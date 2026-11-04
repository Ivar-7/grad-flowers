import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { fetchFlowers } from '@/features/flowers/api/flowers.api'
import { FlowerCard } from '@/features/flowers/components/FlowerCard'
import type { Flower } from '@/features/flowers/types/flower.types'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/errors/ErrorState'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { normalizeError } from '@/shared/errors/error-normalizer'
import type { AppError } from '@/shared/errors/app-error'

export function FeaturedBouquetsSection() {
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<AppError | null>(null)

  const loadFeatured = useCallback(() => {
    setIsLoading(true)
    setError(null)
    fetchFlowers('bestsellers')
      .then((data) => {
        setFlowers(data.slice(0, 3))
        setIsLoading(false)
      })
      .catch((err) => {
        setError(
          normalizeError(err, 'Unable to load featured commencement bouquets.'),
        )
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchFlowers('bestsellers')
      .then((data) => {
        if (isMounted) {
          setFlowers(data.slice(0, 3))
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            normalizeError(
              err,
              'Unable to load featured commencement bouquets.',
            ),
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="py-16 sm:py-24 bg-neutral-50/70 dark:bg-neutral-900/30 border-b border-neutral-200/70 dark:border-neutral-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="purple" className="mb-3 gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Most Reserved for Class of 2026</span>
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Signature Commencement Bestsellers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
              Hand-selected by thousands of proud families. Every arrangement
              includes a custom satin ribbon in your graduate’s university
              colors.
            </p>
          </div>

          <Link to="/flowers?category=bestsellers" className="shrink-0">
            <Button
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View All Bestsellers
            </Button>
          </Link>
        </div>

        {isLoading && (
          <LoadingState message="Loading signature graduation bouquets..." />
        )}

        {!isLoading && error && (
          <ErrorState
            error={error}
            title="Could not load featured bouquets"
            onRetry={loadFeatured}
            actionLabel="Try Again"
          />
        )}

        {!isLoading && !error && flowers.length === 0 && (
          <EmptyState
            title="No featured arrangements available"
            description="Browse our full catalog to explore all graduation flowers and leis."
            action={
              <Link to="/flowers">
                <Button variant="primary" size="sm">
                  Explore Full Catalog
                </Button>
              </Link>
            }
          />
        )}

        {!isLoading && !error && flowers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {flowers.map((flower) => (
              <FlowerCard key={flower.id} flower={flower} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
