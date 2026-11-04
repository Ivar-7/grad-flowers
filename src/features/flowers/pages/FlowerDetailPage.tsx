import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Sparkles,
  Shield,
  Truck,
  Plus,
  Star,
  Tag,
  MessageSquare,
  Gift,
} from 'lucide-react'
import {
  fetchFlowerById,
  STEM_TIER_OPTIONS,
  FLOWER_ADD_ONS,
} from '../api/flowers.api'
import type { Flower, StemTier, FlowerAddOn } from '../types/flower.types'
import { useCart } from '@/features/cart/state/useCart'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/errors/ErrorState'
import { normalizeError } from '@/shared/errors/error-normalizer'
import type { AppError } from '@/shared/errors/app-error'

export function FlowerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()

  const [flower, setFlower] = useState<Flower | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<AppError | null>(null)

  // Customization State
  const [selectedTier, setSelectedTier] = useState<StemTier>('standard')
  const [selectedRibbon, setSelectedRibbon] = useState<string>('')
  const [ribbonCustomText, setRibbonCustomText] = useState<string>('')
  const [selectedAddOns, setSelectedAddOns] = useState<FlowerAddOn[]>([])
  const [cardMessage, setCardMessage] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false)

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

  const currentTierConfig =
    STEM_TIER_OPTIONS.find((t) => t.tier === selectedTier) ??
    STEM_TIER_OPTIONS[0]!

  const unitPrice = flower.price * (currentTierConfig?.priceMultiplier ?? 1)
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
  const singleCombinedPrice = unitPrice + addOnsTotal
  const finalTotalPrice = singleCombinedPrice * quantity

  const toggleAddOn = (addon: FlowerAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id)
      if (exists) {
        return prev.filter((a) => a.id !== addon.id)
      }
      return [...prev, addon]
    })
  }

  const handleAddToCart = () => {
    addItem({
      flowerId: flower.id,
      name: flower.name,
      imageUrl: flower.imageUrl,
      category: flower.category,
      basePrice: flower.price,
      tier: selectedTier,
      tierLabel: currentTierConfig.label,
      unitPrice,
      quantity,
      ribbonColor: selectedRibbon || 'Gold',
      ribbonCustomText: ribbonCustomText.trim() || undefined,
      cardMessage: cardMessage.trim() || undefined,
      addOns: selectedAddOns.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
    })

    setIsAddedFeedback(true)
    setTimeout(() => setIsAddedFeedback(false), 2500)
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Flower Image & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-4/3 relative shadow-sm">
            <img
              src={flower.imageUrl}
              alt={flower.name}
              className="h-full w-full object-cover"
            />
            {flower.isFeatured && (
              <div className="absolute top-4 left-4">
                <Badge
                  variant="purple"
                  className="shadow-md gap-1 px-3 py-1 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Commencement Honors Choice</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Meaning & Symbolism Card */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Floral Meaning & Symbolism
            </h4>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {flower.meaning}
            </p>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Campus venue delivery on ceremony morning</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>100% Freshness and arrival guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customization & Add to Cart */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="default" className="capitalize">
                {flower.category}
              </Badge>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{flower.rating.toFixed(2)}</span>
                <span className="text-neutral-400 font-normal">
                  ({flower.reviewCount} graduate reviews)
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              {flower.name}
            </h1>

            <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ${singleCombinedPrice.toFixed(2)}
            </p>

            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {flower.description}
            </p>
          </div>

          {/* Stem Tier Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              1. Choose Bouquet Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STEM_TIER_OPTIONS.map((tierOpt) => {
                const isSelected = selectedTier === tierOpt.tier
                const tierPrice = flower.price * tierOpt.priceMultiplier
                return (
                  <button
                    key={tierOpt.tier}
                    type="button"
                    onClick={() => setSelectedTier(tierOpt.tier)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {tierOpt.tier === 'standard'
                        ? 'Standard'
                        : tierOpt.tier === 'deluxe'
                          ? 'Deluxe'
                          : 'Grand'}
                    </span>
                    <span className="text-xs text-neutral-500 mt-0.5">
                      {tierOpt.stemCount} fresh stems
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                      ${tierPrice.toFixed(2)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ribbon Color Customization */}
          {flower.ribbonColors.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                2. Select Commencement Ribbon Color
              </label>
              <div className="flex flex-wrap gap-2">
                {flower.ribbonColors.map((color) => {
                  const isSelected = selectedRibbon === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedRibbon(color)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold'
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

          {/* Custom Foil Embossing Text */}
          <div>
            <label
              htmlFor="ribbon-text"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              3. Custom Gold Foil Inscription on Ribbon (Optional)
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                id="ribbon-text"
                type="text"
                maxLength={40}
                value={ribbonCustomText}
                onChange={(e) => setRibbonCustomText(e.target.value)}
                placeholder="e.g. Class of 2026 • Proud Parents"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Printed in metallic gold foil directly onto the satin drape.
            </p>
            <div className="mt-3 rounded-xl border border-amber-300/60 dark:border-amber-500/40 bg-neutral-900 px-4 py-2.5 text-center shadow-xs">
              <span className="block text-xs text-neutral-400">
                {selectedRibbon || 'Gold'} Satin Ribbon Preview
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-amber-300">
                ★ {ribbonCustomText.trim() || 'CLASS OF 2026 • CONGRATULATIONS'}{' '}
                ★
              </span>
            </div>
          </div>

          {/* Graduation Add-Ons Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              4. Add Graduation Keepsakes & Gifts
            </label>
            <div className="space-y-2">
              {FLOWER_ADD_ONS.map((addon) => {
                const isChecked = selectedAddOns.some((a) => a.id === addon.id)
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddOn(addon)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {addon.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {addon.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      +${addon.price.toFixed(2)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Greeting Card Message */}
          <div>
            <label
              htmlFor="card-message"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              5. Handwritten Ceremony Card Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <textarea
                id="card-message"
                rows={2}
                maxLength={250}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Write an encouraging commencement note for the graduate..."
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quantity & Add to Cart Button */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold text-neutral-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={handleAddToCart}
              className="flex-1 shadow-lg shadow-indigo-600/20"
              leftIcon={<Plus className="h-5 w-5" />}
            >
              Add to Ceremony Cart (${finalTotalPrice.toFixed(2)})
            </Button>
          </div>

          {isAddedFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Gift className="h-4 w-4 shrink-0" />
              <span>
                Added to cart with personalized ribbons! Opening cart drawer...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlowerDetailPage
