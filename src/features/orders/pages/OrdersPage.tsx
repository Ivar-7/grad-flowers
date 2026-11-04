import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth/state/useAuth'
import { fetchUserOrders } from '@/features/checkout/api/orders.api'
import type { Order } from '@/features/checkout/types/checkout.types'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchUserOrders(user ? user.uid : 'guest')
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

  if (isLoading) {
    return (
      <LoadingState
        message="Loading your graduation reservations..."
        fullPage
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Graduation Orders & Reservations
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Track upcoming commencement ceremony deliveries and past milestone
          bouquets
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No graduation orders found"
          description="You haven't reserved any bouquets for upcoming ceremonies yet."
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
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-6 border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                    {order.id}
                  </span>
                  <Badge variant="purple" className="gap-1 text-xs">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Commencement Order</span>
                  </Badge>
                  <Badge variant="success" className="text-xs capitalize">
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

              {/* Order Info & Delivery Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-0.5">
                    Graduate Recipient
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {order.delivery.recipientName}
                  </span>
                  <span className="text-neutral-500 block">
                    Phone: {order.delivery.recipientPhone}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-0.5">
                    Ceremony Destination & Time
                  </span>
                  <div className="flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>
                      {order.delivery.campusOrVenue} —{' '}
                      {order.delivery.venueAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-500 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>
                      {new Date(
                        order.delivery.deliveryDate,
                      ).toLocaleDateString()}{' '}
                      ({order.delivery.ceremonyTimeSlot.replace(/-/g, ' ')})
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
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
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">
                    Order Total
                  </span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    ${order.summary.total.toFixed(2)}
                  </span>
                </div>

                <Link to={`/order-success/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Live Tracker & Receipt
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
