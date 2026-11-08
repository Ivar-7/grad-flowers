import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react'
import { useCart } from '../state/useCart'
import { CartItemRow } from '../components/CartItemRow'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'

export function CartPage() {
  const {
    items,
    itemCount,
    updateQuantity,
    removeItem,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    summary,
  } = useCart()

  const navigate = useNavigate()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault()
    setPromoError(null)
    if (!promoInput.trim()) return

    const success = applyPromoCode(promoInput)
    if (success) {
      setPromoInput('')
    } else {
      setPromoError('Invalid code. Try GRAD2026 or CAMPUS')
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Your ceremony bouquet cart is empty"
          description="Celebrate diplomas and academic achievements with fresh commencement flowers and personalized ribbons."
          icon={<ShoppingBag className="h-8 w-8 text-indigo-500" />}
          action={
            <Link to="/flowers">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Browse Graduation Bouquets
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Ceremony Floral Cart
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review your graduation arrangements, commemorative ribbons, and
            delivery schedule
          </p>
        </div>

        <Link
          to="/flowers"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8">
          <Card className="p-6 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="pb-4 flex justify-between items-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <span>Selected Bouquets ({itemCount})</span>
              <span>Subtotal</span>
            </div>

            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Code (GRAD2026)"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white uppercase placeholder:normal-case placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Apply
              </Button>
            </form>

            {promoError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                {promoError}
              </p>
            )}

            {appliedPromo && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    {appliedPromo.code}: {appliedPromo.description}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="text-xs underline text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Price Line Items */}
            <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatKsh(summary.subtotal)}
                </span>
              </div>

              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-{formatKsh(summary.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Ceremony Campus Delivery</span>
                <span>
                  {summary.deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      FREE
                    </span>
                  ) : (
                    `${formatKsh(summary.deliveryFee)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span>{formatKsh(summary.estimatedTax)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800 text-base font-bold text-neutral-900 dark:text-white">
                <span>Estimated Total</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-lg">
                  {formatKsh(summary.total)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 shadow-md shadow-indigo-500/20"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Proceed to Checkout
            </Button>
          </Card>

          {/* Guarantees Box */}
          <Card className="p-6 space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-start gap-2.5">
              <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Campus Delivery Guaranteed:</strong> Delivered directly
                to the ceremony venue or campus gates on time.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>100% Fresh Arrival Guarantee:</strong> Replaced
                immediately if any stem is damaged before the ceremony.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CartPage
