import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, ShoppingBag, ArrowRight, Truck, Check, Tag } from 'lucide-react'
import { useCart } from '../state/useCart'
import { CartItemRow } from './CartItemRow'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'

export function CartDrawer() {
  const {
    items,
    itemCount,
    isDrawerOpen,
    closeDrawer,
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
      setPromoError('Invalid promo code. Try GRAD2026 or CAMPUS')
    }
  }

  const handleCheckoutClick = () => {
    closeDrawer()
    navigate('/checkout')
  }

  // Free delivery threshold: KSh 7,500
  const freeDeliveryThreshold = 7500
  const amountUntilFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - summary.subtotal,
  )
  const freeDeliveryProgress = Math.min(
    100,
    (summary.subtotal / freeDeliveryThreshold) * 100,
  )

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white dark:bg-neutral-950 shadow-2xl flex flex-col border-l border-neutral-200 dark:border-neutral-800"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Ceremony Floral Cart
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {itemCount} {itemCount === 1 ? 'bouquet' : 'bouquets'}{' '}
                      reserved
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close cart drawer"
                  className="rounded-lg p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              {summary.subtotal > 0 && (
                <div className="bg-indigo-50/80 dark:bg-indigo-950/40 px-6 py-3 border-b border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-200 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      {amountUntilFreeDelivery === 0 ||
                      appliedPromo?.freeDelivery ? (
                        <span>Free Campus Ceremony Delivery unlocked!</span>
                      ) : (
                        <span>
                          Add {formatKsh(amountUntilFreeDelivery)} more for free
                          campus delivery
                        </span>
                      )}
                    </span>
                    <span className="font-bold">
                      {freeDeliveryProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                      style={{
                        width: `${appliedPromo?.freeDelivery ? 100 : freeDeliveryProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {items.length === 0 ? (
                  <div className="py-16 text-center">
                    <EmptyState
                      title="Your graduation cart is empty"
                      description="Explore our hand-tied commencement bouquets, orchids, and custom ribbons."
                      action={
                        <Link to="/flowers" onClick={closeDrawer}>
                          <Button
                            variant="primary"
                            size="sm"
                            rightIcon={<ArrowRight className="h-4 w-4" />}
                          >
                            Browse Bouquets
                          </Button>
                        </Link>
                      }
                    />
                  </div>
                ) : (
                  items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 space-y-4">
                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. GRAD2026)"
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white uppercase placeholder:normal-case placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                      Apply
                    </Button>
                  </form>

                  {promoError && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {promoError}
                    </p>
                  )}

                  {appliedPromo && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Check className="h-3.5 w-3.5" />
                        <span>
                          {appliedPromo.code}: {appliedPromo.description}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Summary Breakdown */}
                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {formatKsh(summary.subtotal)}
                      </span>
                    </div>

                    {summary.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Discount ({appliedPromo?.code})</span>
                        <span>-{formatKsh(summary.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Ceremony Delivery</span>
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
                      <span>Estimated Tax (8%)</span>
                      <span>{formatKsh(summary.estimatedTax)}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-base">
                        {formatKsh(summary.total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCheckoutClick}
                      className="w-full shadow-md shadow-indigo-600/20"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Proceed to Checkout
                    </Button>

                    <Link
                      to="/cart"
                      onClick={closeDrawer}
                      className="block text-center text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                      View full cart details
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
