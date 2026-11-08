import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  Sparkles,
  Calendar,
  Phone,
  GraduationCap,
} from 'lucide-react'
import { fetchOrderById } from '../api/orders.api'
import type { Order } from '../types/checkout.types'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'

const TRACKING_STEPS = [
  {
    step: 1,
    label: 'Reservation Confirmed',
    time: 'Confirmed instantly',
    done: true,
  },
  {
    step: 2,
    label: 'Florist Stems Conditioning',
    time: 'Morning of ceremony',
    done: true,
  },
  {
    step: 3,
    label: 'Foil Ribbon Embossing',
    time: '2 hours before ceremony',
    done: false,
  },
  {
    step: 4,
    label: 'Campus Courier Dispatch',
    time: 'Venue gate handoff',
    done: false,
  },
]

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    let isMounted = true

    fetchOrderById(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [orderId])

  if (isLoading) {
    return (
      <LoadingState
        message="Loading your ceremony reservation confirmation..."
        fullPage
      />
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Reservation Record Not Found"
          description="We could not retrieve this specific reservation ID."
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4 shadow-sm shadow-emerald-500/20">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Badge variant="purple" className="gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Commencement Order Reserved</span>
          </Badge>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Thank you! Your flowers are scheduled.
        </h1>

        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
          We have secured your fresh stems and personalized ribbons. A receipt
          has been generated for your records.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-neutral-700 dark:text-neutral-300">
          <span>Order ID:</span>
          <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
            {order.id}
          </strong>
        </div>
      </div>

      {/* Live Campus Ceremony Delivery Tracker */}
      <Card className="p-6 sm:p-8 mb-8 border-neutral-200 dark:border-neutral-800">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-6 flex items-center justify-between">
          <span>Ceremony Day Delivery Timeline</span>
          <span className="text-xs font-normal text-neutral-500">
            Window: {order.estimatedDeliveryWindow}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {TRACKING_STEPS.map((step) => (
            <div
              key={step.step}
              className={`flex flex-col p-3 rounded-xl border transition-colors ${
                step.done
                  ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/30'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step.done
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {step.done ? '✓' : step.step}
                </span>
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-0.5">
                {step.label}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {step.time}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Reservation Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Graduate & Ceremony Information</span>
          </div>

          <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
            <div>
              <span className="text-neutral-400 block text-xs">
                Graduate Recipient
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                {order.delivery.recipientName}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-xs">
                Ceremony Date & Call
              </span>
              <span className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                {new Date(order.delivery.deliveryDate).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-xs">
                Campus & Venue Destination
              </span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {order.delivery.campusOrVenue} — {order.delivery.venueAddress}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-xs">
                Contact Phone for Courier
              </span>
              <span className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-indigo-500" />
                {order.delivery.recipientPhone}
              </span>
            </div>

            {order.delivery.specialInstructions && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-400 block text-xs">
                  Venue Instructions
                </span>
                <span className="italic text-neutral-700 dark:text-neutral-300">
                  &ldquo;{order.delivery.specialInstructions}&rdquo;
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Ordered Bouquets Breakdown */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <ShoppingBag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Reserved Bouquets</span>
          </div>

          <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {item.quantity}× {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.tierLabel} • {item.ribbonColor} Ribbon
                  </p>
                  {item.ribbonCustomText && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Ribbon: &ldquo;{item.ribbonCustomText}&rdquo;
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {formatKsh(item.totalPrice)}
                </span>
              </div>
            ))}

            <div className="pt-3 space-y-1 text-xs text-neutral-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatKsh(order.summary.subtotal)}</span>
              </div>
              {order.summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatKsh(order.summary.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ceremony Delivery</span>
                <span>
                  {order.summary.deliveryFee === 0
                    ? 'FREE'
                    : `${formatKsh(order.summary.deliveryFee)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 dark:text-white text-sm pt-2">
                <span>Total Paid</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatKsh(order.summary.total)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Print Ceremony Receipt</span>
        </button>

        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="outline" size="md">
              View All Orders
            </Button>
          </Link>
          <Link to="/flowers">
            <Button variant="primary" size="md">
              Order Another Bouquet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
