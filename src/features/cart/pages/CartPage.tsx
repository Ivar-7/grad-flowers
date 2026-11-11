import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Zap,
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
    summary,
    openQuickOrder,
  } = useCart()

  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Your bouquet basket is empty"
          description="Pick from our 6 official graduation products — from a KSh 50 Single rose to a KSh 1,500 Premium bouquet."
          icon={<ShoppingBag className="h-8 w-8 text-rose-500" />}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => openQuickOrder()}
                leftIcon={<Zap className="h-4 w-4" />}
              >
                Order in 60 Seconds
              </Button>
              <Link to="/flowers">
                <Button
                  variant="outline"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View Full Menu
                </Button>
              </Link>
            </div>
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
            Your Graduation Basket
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review your selected bouquets before choosing your pickup station
            and paying via M-Pesa
          </p>
        </div>

        <Link
          to="/flowers"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Menu</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <Card className="p-6 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="pb-4 flex justify-between items-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <span>Selected Bouquets ({itemCount})</span>
              <span>Price</span>
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

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
              Payment Summary
            </h3>

            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Menu Price Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatKsh(summary.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Station Pickup Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  FREE
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800 text-base font-bold text-neutral-900 dark:text-white">
                <span>Total (M-Pesa)</span>
                <span className="text-rose-600 dark:text-rose-400 text-lg">
                  {formatKsh(summary.total)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full mt-6"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Checkout (No Account Needed)
            </Button>
          </Card>

          <Card className="p-6 space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>Fast Station Pickup:</strong> Collect right at our
                graduation gate station or tent with your M-Pesa receipt code.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Fresh Kenyan Stems:</strong> Conditioned fresh every
                graduation morning.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CartPage
