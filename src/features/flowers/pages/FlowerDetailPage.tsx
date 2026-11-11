import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  QrCode,
  Candy,
  Plus,
  Zap,
  Tag,
  MessageSquare,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { fetchFlowerById, SEEDED_FLOWERS } from '../api/flowers.api'
import type { Flower } from '../types/flower.types'
import { useCart } from '@/features/cart/state/useCart'
import { QrMessageRecorder } from '@/features/qr/components/QrMessageRecorder'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/errors/ErrorState'
import { normalizeError } from '@/shared/errors/error-normalizer'
import type { AppError } from '@/shared/errors/app-error'
import { formatKsh } from '@/shared/utils/currency'

export function FlowerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem, openQuickOrder } = useCart()

  const [flower, setFlower] = useState<Flower | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<AppError | null>(null)

  const [selectedRibbon, setSelectedRibbon] = useState<string>('')
  const [ribbonCustomText, setRibbonCustomText] = useState<string>('')
  const [cardMessage, setCardMessage] = useState<string>('')
  const [qrMessageId, setQrMessageId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState<number>(1)

  const handleRetry = () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    fetchFlowerById(id)
      .then((data) => {
        setFlower(data)
        if (data && data.ribbonColors.length > 0) {
          setSelectedRibbon(data.ribbonColors[0] ?? '')
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
            setSelectedRibbon(data.ribbonColors[0] ?? '')
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
    return <LoadingState message="Loading bouquet details..." fullPage />
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
          description="Choose from our 6 official graduation bouquets on the menu."
          action={
            <Link to="/flowers">
              <Button variant="primary">View Menu</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const candyUpgradeTarget = flower.candyUpgradeTargetId
    ? (SEEDED_FLOWERS.find((f) => f.id === flower.candyUpgradeTargetId) ?? null)
    : null
  const candyBaseProduct = flower.candyBaseId
    ? (SEEDED_FLOWERS.find((f) => f.id === flower.candyBaseId) ?? null)
    : null

  const finalTotalPrice = flower.price * quantity

  const handleToggleCandy = () => {
    if (candyUpgradeTarget) {
      navigate(`/flowers/${candyUpgradeTarget.id}`)
    } else if (candyBaseProduct) {
      navigate(`/flowers/${candyBaseProduct.id}`)
    }
  }

  const handleAddToCart = () => {
    addItem({
      flowerId: flower.id,
      name: flower.name,
      whatsInIt: flower.whatsInIt,
      imageUrl: flower.imageUrl,
      category: flower.category,
      basePrice: flower.price,
      tier: 'standard',
      tierLabel: flower.whatsInIt,
      unitPrice: flower.price,
      quantity,
      ribbonColor: selectedRibbon || 'Crimson Red',
      ribbonCustomText: ribbonCustomText.trim() || undefined,
      cardMessage: cardMessage.trim() || undefined,
      qrMessageId,
      addOns: [],
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <Link
        to="/flowers"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to 6-Product Menu</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-6 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-4/3 relative shadow-sm">
            <img
              src={flower.imageUrl}
              alt={flower.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {flower.includesQrCard && (
                <Badge
                  variant="default"
                  className="bg-neutral-900/85 text-white border-white/20 gap-1.5 px-3 py-1 text-xs"
                >
                  <QrCode className="h-3.5 w-3.5 text-amber-300" />
                  <span>Includes QR Voice/Video Card</span>
                </Badge>
              )}
              {flower.hasCandy && (
                <Badge
                  variant="purple"
                  className="bg-amber-500 text-neutral-950 font-bold gap-1 px-3 py-1 text-xs border-none"
                >
                  <Candy className="h-3.5 w-3.5" />
                  <span>Candy Upgrade Included</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              What is inside {flower.name}
            </h4>
            <p className="text-base font-bold text-neutral-900 dark:text-white">
              {flower.whatsInIt}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {flower.meaning}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Collect right at our campus graduation station</span>
            </div>
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Fresh Kenyan roses conditioned on ceremony morning</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                {flower.name}
              </h1>
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {formatKsh(flower.price)}
              </span>
            </div>

            <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {flower.description}
            </p>
          </div>

          {/* Candy Upgrade Toggle */}
          {(candyUpgradeTarget || candyBaseProduct) && (
            <div className="p-4 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/25">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <Candy className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-bold text-neutral-900 dark:text-white">
                      {candyUpgradeTarget
                        ? `Upgrade to ${candyUpgradeTarget.name} (+KSh ${flower.candyUpgradePriceDiff ?? 150})`
                        : `${flower.name} Active (${formatKsh(flower.price)})`}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">
                      {candyUpgradeTarget
                        ? candyUpgradeTarget.whatsInIt
                        : `Switch back to ${candyBaseProduct?.name} (${formatKsh(candyBaseProduct?.price ?? 350)})`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleCandy}
                  aria-label="Toggle candy upgrade"
                  className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors cursor-pointer ${
                    flower.hasCandy
                      ? 'bg-amber-500 justify-end'
                      : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </div>
          )}

          {/* Ribbon Colour Selection */}
          {flower.ribbonColors.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                1. Choose School Ribbon Colour
              </label>
              <div className="flex flex-wrap gap-2">
                {flower.ribbonColors.map((color) => {
                  const isSelected = selectedRibbon === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedRibbon(color)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
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

          {/* Optional Ribbon Tag / Name */}
          <div>
            <label
              htmlFor="ribbon-text"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              2. Graduate Name / “Hongera!” Tag (Optional)
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                id="ribbon-text"
                type="text"
                maxLength={40}
                value={ribbonCustomText}
                onChange={(e) => setRibbonCustomText(e.target.value)}
                placeholder="e.g. Hongera Wanjiku! Class of 2026"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* QR Voice / Video Message Card Recorder for Classic, Classic Candy, Premium */}
          {flower.includesQrCard ? (
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                3. Personalize Your QR Voice / Video Message Card (Included)
              </span>
              <QrMessageRecorder
                bouquetName={flower.name}
                onSaved={(doc) => {
                  setQrMessageId(doc.id)
                  setCardMessage(doc.writtenNote)
                }}
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="card-message"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                3. Short Success Card Note (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <textarea
                  id="card-message"
                  rows={2}
                  maxLength={250}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder="Write a warm Hongera! note for the graduate..."
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={() => openQuickOrder({ flowerId: flower.id })}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
                leftIcon={<Zap className="h-5 w-5" />}
              >
                Buy Now in 60s ({formatKsh(finalTotalPrice)})
              </Button>
            </div>

            <Button
              size="md"
              variant="outline"
              onClick={handleAddToCart}
              className="w-full"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add to Basket ({formatKsh(finalTotalPrice)})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlowerDetailPage
