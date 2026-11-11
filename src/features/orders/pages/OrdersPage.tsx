import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Search,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/features/auth/state/useAuth'
import { useCart } from '@/features/cart/state/useCart'
import { fetchUserOrders } from '@/features/checkout/api/orders.api'
import type { Order } from '@/features/checkout/types/checkout.types'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'

export function OrdersPage() {
  const { user } = useAuth()
  const { openQuickOrder } = useCart()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderLookupId, setOrderLookupId] = useState('')

  useEffect(() => {
    let isMounted = true

    fetchUserOrders(user ? user.uid : null)
      .then((data) => {
        if (isMounted) {
          setOrders(data)
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
  }, [user])

  const handleLookup = (e: FormEvent) => {
    e.preventDefault()
    const clean = orderLookupId.trim().toUpperCase()
    if (!clean) return
    navigate(`/order-success/${encodeURIComponent(clean)}`)
  }

  if (isLoading) {
    return (
      <LoadingState
        message="Loading your graduation station orders..."
        fullPage
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Station Orders & Collection Passes
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            View your graduation bouquet orders and campus station pickup passes
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={orderLookupId}
              onChange={(e) => setOrderLookupId(e.target.value)}
              placeholder="Order ID (e.g. GF-2026-...)"
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Open Pass
          </Button>
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No graduation orders on this device yet"
          description="Order in 60 seconds with your name, email, and M-Pesa number — no login or signup needed."
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
                <Button variant="outline" size="md">
                  Browse 6 Products
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-6 border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                    {order.id}
                  </span>
                  <Badge variant="purple" className="gap-1 text-xs">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Station Order</span>
                  </Badge>
                  <Badge
                    variant={
                      order.status === 'pending-payment' ? 'default' : 'success'
                    }
                    className="text-xs capitalize"
                  >
                    {order.status.replace(/-/g, ' ')}
                  </Badge>
                </div>

                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-0.5">
                    Graduate / Buyer
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white block">
                    {order.delivery.recipientName}
                  </span>
                  <span className="text-neutral-500 block">
                    {order.delivery.recipientEmail || order.userEmail}
                  </span>
                  <span className="text-neutral-500 block">
                    Phone: {order.delivery.recipientPhone}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">
                    Collection Station & Date
                  </span>
                  <div className="flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>
                      {order.delivery.campusOrVenue} —{' '}
                      {order.delivery.venueAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-500 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>
                      {new Date(
                        order.delivery.deliveryDate,
                      ).toLocaleDateString()}{' '}
                      ({order.delivery.ceremonyTimeSlot.replace(/-/g, ' ')})
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                      <span>
                        <strong>{item.quantity}×</strong> {item.name} (
                        {item.ribbonColor} ribbon)
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {formatKsh(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">
                    Order Total
                  </span>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                    {formatKsh(order.summary.total)}
                  </span>
                </div>

                <Link to={`/order-success/${order.id}`}>
                  <Button variant="outline" size="sm">
                    Open Station Pass & QR
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
