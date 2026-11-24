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
  QrCode,
  Truck,
  Users,
  Plus,
} from 'lucide-react'
import { fetchOrderById } from '../api/orders.api'
import type { Order, OrderStatus } from '../types/checkout.types'
import { useCart } from '@/features/cart/state/useCart'
import { SEEDED_FLOWERS } from '@/features/flowers/api/flowers.api'
import { SITE_CONFIG } from '@/shared/config/site.config'
import { getQrCardUrl } from '@/features/qr/api/qr.api'
import { QrCodeDisplay } from '@/features/qr/components/QrCodeDisplay'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'

const STATUS_ORDER: OrderStatus[] = [
  'pending-payment',
  'confirmed',
  'florist-arranging',
  'out-for-delivery',
  'delivered',
]

function isStepDone(current: OrderStatus, required: OrderStatus): boolean {
  const curIdx = STATUS_ORDER.indexOf(
    current === 'ribbon-embossed' ? 'florist-arranging' : current,
  )
  const reqIdx = STATUS_ORDER.indexOf(required)
  return curIdx >= reqIdx
}

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { openQuickOrder } = useCart()
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
        message="Loading your graduation station pass & receipt..."
        fullPage
      />
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Order Pass Not Found"
          description={`Only the order owner or ${SITE_CONFIG.brandName} staff can view this receipt.`}
          action={
            <Link to="/flowers">
              <Button variant="primary">Return to Menu</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const isDelivery = order.delivery.fulfillmentType === 'address-delivery'
  const deliveryFee = order.summary.deliveryFee ?? 0
  const smallerBouquetSuggestions = SEEDED_FLOWERS.filter((f) =>
    ['single', 'mini', 'mini-candy'].includes(f.id),
  )

  const timelineSteps = [
    {
      step: 1,
      label: 'Order Logged',
      time: isDelivery
        ? 'Delivery order created'
        : 'Pickup reservation created',
      done: true,
    },
    {
      step: 2,
      label: 'M-Pesa Confirmed',
      time:
        order.status === 'pending-payment'
          ? 'Awaiting M-Pesa PIN confirmation'
          : 'Paid via M-Pesa',
      done: isStepDone(order.status, 'confirmed'),
    },
    {
      step: 3,
      label: 'Bouquet Prepared',
      time: 'Fresh roses & ribbon arranged',
      done: isStepDone(order.status, 'florist-arranging'),
    },
    {
      step: 4,
      label: isDelivery ? 'Out for Delivery' : 'Ready for Pickup',
      time: order.delivery.venueAddress,
      done: isStepDone(order.status, 'out-for-delivery'),
    },
  ]

  const activeQrId =
    order.qrMessageId ?? order.items.find((i) => i.qrMessageId)?.qrMessageId

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4 shadow-sm shadow-emerald-500/20">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="purple" className="gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Hongera! Station Collection Pass</span>
          </Badge>
          {order.referrer && (
            <Badge variant="success" className="text-xs">
              Credited to @{order.referrer}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Hongera! Your bouquet order is set.
        </h1>

        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
          {isDelivery ? (
            <>
              Delivering to <strong>{order.delivery.venueAddress}</strong> (
              {order.delivery.campusOrVenue}).
            </>
          ) : (
            <>
              Present this Order Code for pickup at{' '}
              <strong>{order.delivery.campusOrVenue}</strong>. We will confirm
              your vendor handoff on WhatsApp.
            </>
          )}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-mono text-neutral-700 dark:text-neutral-300">
          <span>Collection Code:</span>
          <strong className="text-rose-600 dark:text-rose-400 font-extrabold">
            {order.id}
          </strong>
        </div>
      </div>

      {/* Smart Fulfillment Routing Banner */}
      <Card className="p-5 mb-8 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            {order.fulfillment?.route === 'vendor-connected' ? (
              <Users className="h-5 w-5" />
            ) : (
              <Truck className="h-5 w-5" />
            )}
          </span>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-extrabold text-neutral-900 dark:text-white">
              {order.fulfillment?.route === 'vendor-connected'
                ? `Connected with Graduation Vendor: ${order.fulfillment.assignedVendorName ?? 'Available Vendor'}`
                : order.fulfillment?.route === 'scheduled-2-4-days'
                  ? 'Fresh Sourcing Scheduled (2–4 Days Delivery)'
                  : order.fulfillment?.route === 'same-day-delivery'
                    ? 'In Stock — Eligible for Same-Day Delivery'
                    : isDelivery
                      ? 'Delivery Routing Ready (Same-Day if In Stock, or 2–4 Days)'
                      : 'Matching You with an Available Graduation Vendor'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300">
              {order.fulfillment?.estimatedTimeline ??
                (isDelivery
                  ? 'Once M-Pesa confirms, in-stock bouquets dispatch same day (small delivery fee applies). Out-of-stock bouquets are freshly sourced within 2–4 days.'
                  : 'Once M-Pesa confirms, we connect you with an available vendor at your ceremony or arrange same-day / 2–4 day delivery if no vendor is on site.')}
            </p>
          </div>
        </div>
      </Card>

      {/* Live Station Timeline */}
      <Card className="p-6 sm:p-8 mb-8 border-neutral-200 dark:border-neutral-800">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-6 flex items-center justify-between">
          <span>Station Fulfillment Status</span>
          <span className="text-xs font-normal text-neutral-500">
            {order.estimatedDeliveryWindow}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {timelineSteps.map((step) => (
            <div
              key={step.step}
              className={`flex flex-col p-3.5 rounded-xl border transition-colors ${
                step.done
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step.done
                      ? 'bg-emerald-600 text-white'
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

      {/* QR Message Card Preview if attached */}
      {activeQrId && (
        <Card className="p-6 mb-8 border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <QrCode className="h-4 w-4" />
              <span>Your Personal QR Message Card ({activeQrId})</span>
            </div>
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
              Scan to Open Voice / Video Graduation Card
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
              We print this QR code onto the card tucked into your bouquet. When{' '}
              <strong>{order.delivery.recipientName}</strong> scans it with
              their phone camera, your voice/video message plays!
            </p>
          </div>
          <QrCodeDisplay
            url={getQrCardUrl(activeQrId)}
            label={`Card ${activeQrId}`}
            size={140}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <GraduationCap className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Station Pickup Details</span>
          </div>

          <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
            <div>
              <span className="text-neutral-400 block text-xs">
                Graduate / Buyer
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white block">
                {order.delivery.recipientName}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                {order.delivery.recipientEmail || order.userEmail}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-xs">
                Collection Date
              </span>
              <span className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-rose-500" />
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
                University & Station
              </span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {order.delivery.campusOrVenue} — {order.delivery.venueAddress}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-xs">
                M-Pesa / Contact Phone
              </span>
              <span className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                {order.delivery.recipientPhone}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <ShoppingBag className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Ordered Items</span>
          </div>

          <div className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    {item.quantity}× {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.whatsInIt ?? item.tierLabel} • {item.ribbonColor}{' '}
                    Ribbon
                  </p>
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {formatKsh(item.totalPrice)}
                </span>
              </div>
            ))}

            <div className="pt-3 space-y-1 text-xs text-neutral-500">
              <div className="flex justify-between">
                <span>Bouquets Subtotal</span>
                <span>{formatKsh(order.summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {isDelivery ? 'Address Delivery' : 'Graduation Pickup'}
                </span>
                <span className="text-emerald-600 font-semibold">
                  {deliveryFee > 0 ? formatKsh(deliveryFee) : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 dark:text-white text-sm pt-2">
                <span>Total (M-Pesa)</span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatKsh(order.summary.total)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Post-Order Upsell: Suggest smaller bouquets */}
      <Card className="p-6 mb-8 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Add a smaller bouquet for a friend or classmate?</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Tap any smaller bouquet below to add another celebratory gift in
              seconds.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {smallerBouquetSuggestions.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-white dark:bg-neutral-900 p-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="h-12 w-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {prod.name}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {formatKsh(prod.price)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openQuickOrder({ flowerId: prod.id })}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Order
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Print Station Pass</span>
        </button>

        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="outline" size="md">
              My Orders
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
