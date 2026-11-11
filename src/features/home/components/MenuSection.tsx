import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FlowerCard } from '@/features/flowers/components/FlowerCard'
import type { Flower } from '@/features/flowers/types/flower.types'
import type { AppError } from '@/shared/errors/app-error'
import { ErrorState } from '@/shared/errors/ErrorState'
import { EmptyState } from '@/shared/ui/EmptyState'

const SKELETON_CARDS = ['a', 'b', 'c', 'd', 'e', 'f']

export interface MenuSectionProps {
  flowers: Flower[]
  isLoading: boolean
  error: AppError | null
  onRetry: () => void
}

export function MenuSection({
  flowers,
  isLoading,
  error,
  onRetry,
}: MenuSectionProps) {
  return (
    <section
      id="menu"
      className="scroll-mt-20 bg-white py-16 sm:py-24 dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
              The menu
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-5xl dark:text-white">
              Six bouquets. One price list.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
              From a single rose for a classmate to a full dozen for the one you
              raised. The price you see is the price you pay.
            </p>
          </div>

          <Link
            to="/flowers"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-rose-600 dark:text-white dark:decoration-neutral-700 dark:hover:decoration-rose-400"
          >
            Compare everything
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading && (
          <div
            role="status"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            {SKELETON_CARDS.map((card) => (
              <div
                key={card}
                className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="aspect-4/3 bg-neutral-200 dark:bg-neutral-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-1/2 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-4 rounded-md bg-neutral-100 dark:bg-neutral-900" />
                  <div className="h-4 w-3/4 rounded-md bg-neutral-100 dark:bg-neutral-900" />
                </div>
              </div>
            ))}
            <span className="sr-only">Loading the menu</span>
          </div>
        )}

        {!isLoading && error && (
          <ErrorState
            error={error}
            title="We couldn't load the menu"
            onRetry={onRetry}
            actionLabel="Try again"
          />
        )}

        {!isLoading && !error && flowers.length === 0 && (
          <EmptyState
            title="The menu is being restocked"
            description="Nothing is listed right now. Check back shortly, or see the full catalogue."
            action={
              <Link
                to="/flowers"
                className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400"
              >
                Open the catalogue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        )}

        {!isLoading && !error && flowers.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {flowers.map((flower) => (
              <FlowerCard key={flower.id} flower={flower} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
