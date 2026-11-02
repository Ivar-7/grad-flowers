import type { Flower } from '../types/flower.types'
import { FlowerCard } from './FlowerCard'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/errors/ErrorState'
import { Button } from '@/shared/ui/Button'
import type { AppError } from '@/shared/errors/app-error'

export interface FlowerGridProps {
  flowers: Flower[]
  isLoading: boolean
  isEmpty: boolean
  error: AppError | null
  onRetry: () => void
  onResetFilter?: () => void
}

export function FlowerGrid({
  flowers,
  isLoading,
  isEmpty,
  error,
  onRetry,
  onResetFilter,
}: FlowerGridProps) {
  if (isLoading) {
    return <LoadingState message="Gathering fresh graduation arrangements..." />
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Could not load bouquets"
        onRetry={onRetry}
        actionLabel="Retry Loading"
      />
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        title="No bouquets match your search"
        description="Try adjusting your category filter or search terms to find the perfect commencement flowers."
        action={
          onResetFilter ? (
            <Button variant="outline" size="sm" onClick={onResetFilter}>
              Clear Filters
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {flowers.map((flower) => (
        <FlowerCard key={flower.id} flower={flower} />
      ))}
    </div>
  )
}
