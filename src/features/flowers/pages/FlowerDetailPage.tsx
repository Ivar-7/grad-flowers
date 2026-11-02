import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, Sparkles, Shield, Truck } from 'lucide-react'
import { fetchFlowerById } from '../api/flowers.api'
import type { Flower } from '../types/flower.types'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/errors/ErrorState'
import { normalizeError } from '@/shared/errors/error-normalizer'
import type { AppError } from '@/shared/errors/app-error'

export function FlowerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [flower, setFlower] = useState<Flower | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<AppError | null>(null)
  const [selectedRibbon, setSelectedRibbon] = useState<string>('')
  const [isOrdered, setIsOrdered] = useState<boolean>(false)

  const handleRetry = () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    fetchFlowerById(id)
      .then((data) => {
        setFlower(data)
        if (data && data.ribbonColors.length > 0) {
          setSelectedRibbon(data.ribbonColors[0])
        }
        setIsLoading(false)
      })
      .catch((err) => {
        setError(normalizeError(err, 'Failed to retrieve bouquet information.'))
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (!id) return
    let isMounted = true

    fetchFlowerById(id)
      .then((data) => {
        if (isMounted) {
          setFlower(data)
          if (data && data.ribbonColors.length > 0) {
            setSelectedRibbon(data.ribbonColors[0])
          }
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            normalizeError(err, 'Failed to retrieve bouquet information.'),
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return <LoadingState message="Preparing bouquet details..." fullPage />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          error={error}
          title="Could not load bouquet"
          onRetry={handleRetry}
          actionLabel="Try Again"
        />
      </div>
    )
  }

  if (!flower) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Bouquet Not Found"
          description="The graduation bouquet you are looking for is either unavailable or has expired."
          action={
            <Link to="/flowers">
              <Button variant="primary">Return to Catalog</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <Link
        to="/flowers"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Bouquets</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Flower Image */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-4/3 relative">
          <img
            src={flower.imageUrl}
            alt={flower.name}
            className="h-full w-full object-cover"
          />
          {flower.isFeatured && (
            <div className="absolute top-4 left-4">
              <Badge
                variant="purple"
                className="shadow-md gap-1 px-3 py-1 text-sm"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Featured Commencement Bouquet</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Flower Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="capitalize">
              {flower.category}
            </Badge>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {flower.flowerCount} fresh stems
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-4">
            {flower.name}
          </h1>

          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
            ${flower.price.toFixed(2)}
          </p>

          <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
            {flower.description}
          </p>

          {/* Ribbon Customization */}
          {flower.ribbonColors.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Select Commemorative Ribbon Color:
              </label>
              <div className="flex flex-wrap gap-2">
                {flower.ribbonColors.map((color) => {
                  const isSelected = selectedRibbon === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedRibbon(color)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      <span>{color}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              size="lg"
              variant="primary"
              onClick={() => setIsOrdered(true)}
              className="flex-1"
            >
              {isOrdered
                ? 'Reserved for Ceremony!'
                : 'Reserve for Graduation Day'}
            </Button>
          </div>

          {isOrdered && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm mb-6 flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>
                Bouquet reserved with {selectedRibbon} ribbon. Proceed to
                checkout or continue browsing.
              </span>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Free venue/campus delivery on ceremony morning</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>100% Freshness and arrival guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlowerDetailPage
