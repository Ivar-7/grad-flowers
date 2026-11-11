import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, ShoppingBag, ArrowRight, MapPin, Zap } from 'lucide-react'
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
    summary,
    openQuickOrder,
  } = useCart()

  const navigate = useNavigate()

  const handleCheckoutClick = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white dark:bg-neutral-950 shadow-2xl flex flex-col border-l border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Your Bouquet Basket
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
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

              {summary.subtotal > 0 && (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 px-6 py-2.5 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Free Campus Station Collection — Pay exact menu price via
                    M-Pesa
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {items.length === 0 ? (
                  <div className="py-16 text-center">
                    <EmptyState
                      title="Your basket is empty"
                      description="Pick from our 6 graduation products — Single (KSh 50) up to Premium (KSh 1,500)."
                      action={
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openQuickOrder()}
                          leftIcon={<Zap className="h-4 w-4" />}
                        >
                          Order in 60 Seconds
                        </Button>
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

              {items.length > 0 && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 space-y-4">
                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex justify-between">
                      <span>Bouquets Subtotal</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {formatKsh(summary.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Campus Station Collection</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        FREE
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-900 dark:text-white">
                      <span>Total to Pay (M-Pesa)</span>
                      <span className="text-rose-600 dark:text-rose-400 text-base">
                        {formatKsh(summary.total)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCheckoutClick}
                      className="w-full"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Pay {formatKsh(summary.total)} & Pick Station
                    </Button>

                    <Link
                      to="/cart"
                      onClick={closeDrawer}
                      className="block text-center text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                      View full basket
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
