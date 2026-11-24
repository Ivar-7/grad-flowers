import { useEffect, useRef, useState } from 'react'
import {
  MapPin,
  Calendar,
  Smartphone,
  User,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Plus,
  Sparkles,
  Truck,
} from 'lucide-react'
import type {
  DeliveryDetails,
  Order,
  PaymentDetails,
} from '../types/checkout.types'
import { useCart } from '@/features/cart/state/useCart'
import { useAuth } from '@/features/auth/state/useAuth'
import { useReferral } from '@/shared/referral/useReferral'
import { SEEDED_FLOWERS } from '@/features/flowers/api/flowers.api'
import { SITE_CONFIG } from '@/shared/config/site.config'
import { createOrder, saveSessionReceipt } from '../api/orders.api'
import { usePayheroCheckout } from '../state/usePayheroCheckout'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { formatKsh } from '@/shared/utils/currency'

export interface ReviewStepProps {
  delivery: DeliveryDetails
  payment: PaymentDetails
  onBack: () => void
  onSuccess: (orderId: string) => void
}

export function ReviewStep({
  delivery,
  payment,
  onBack,
  onSuccess,
}: ReviewStepProps) {
  const { items, summary, addItem, clearCart } = useCart()
  const { user } = useAuth()
  const { referrer } = useReferral()
  const checkout = usePayheroCheckout()
  const [orderError, setOrderError] = useState<string | null>(null)
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const pendingOrderRef = useRef<Order | null>(null)

  const isDelivery = delivery.fulfillmentType === 'address-delivery'
  const deliveryFee = isDelivery ? SITE_CONFIG.sameDayDeliveryFeeKsh : 0
  const grandTotal = Math.ceil(summary.subtotal + deliveryFee)

  // Suggest smaller bouquets the buyer hasn't added yet to boost order value
  const existingFlowerIds = new Set(items.map((i) => i.flowerId))
  const smallerSuggestions = SEEDED_FLOWERS.filter(
    (f) =>
      ['mini', 'mini-candy', 'single'].includes(f.id) &&
      !existingFlowerIds.has(f.id),
  ).slice(0, 2)

  const { phase } = checkout
  const isBusy = phase === 'initiating' || phase === 'awaiting'
  const errorMessage = orderError ?? checkout.errorMessage

  useEffect(() => {
    if (phase !== 'paid' || !pendingOrderRef.current) return
    const confirmedOrder: Order = {
      ...pendingOrderRef.current,
      status: 'confirmed',
    }
    saveSessionReceipt(confirmedOrder)
    const orderId = confirmedOrder.id
    clearCart()
    onSuccess(orderId)
  }, [phase, clearCart, onSuccess])

  const handleAddSuggestion = (flowerId: string) => {
    const prod = SEEDED_FLOWERS.find((f) => f.id === flowerId)
    if (!prod) return
    // Reset any stale pending order so the new total is used
    pendingOrderRef.current = null
    setPendingOrder(null)
    addItem({
      flowerId: prod.id,
      name: prod.name,
      whatsInIt: prod.whatsInIt,
      imageUrl: prod.imageUrl,
      category: prod.category,
      basePrice: prod.price,
      tier: 'standard',
      tierLabel: prod.whatsInIt,
      unitPrice: prod.price,
      quantity: 1,
      ribbonColor: prod.ribbonColors[0] || 'Royal Blue',
      addOns: [],
    })
  }

  const handlePlaceOrder = async () => {
    setOrderError(null)

    try {
      if (!pendingOrderRef.current) {
        const firstQrId = items.find((i) => i.qrMessageId)?.qrMessageId
        const created = await createOrder({
          userId: user ? user.uid : null,
          userEmail: delivery.recipientEmail,
          referrer,
          qrMessageId: firstQrId,
          items,
          summary: {
            subtotal: summary.subtotal,
            deliveryFee,
            total: grandTotal,
          },
          delivery,
          paymentMethod: 'mpesa',
        })
        pendingOrderRef.current = created
        setPendingOrder(created)
      }

      await checkout.start({
        amount: grandTotal,
        phoneNumber: payment.phoneNumber,
        description: `${SITE_CONFIG.brandName} order ${pendingOrderRef.current.id}`,
        orderId: pendingOrderRef.current.id,
        userId: user ? user.uid : null,
      })
    } catch (err) {
      const normalized = normalizeError(
        err,
        'Failed to start your M-Pesa payment. Please try again.',
      )
      logError(normalized, { feature: 'checkout', action: 'placeOrder' })
      setOrderError(normalized.userMessage)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          3. Confirm &amp; Pay via M-Pesa
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          No account required — verify your{' '}
          {isDelivery ? 'delivery' : 'graduation pickup'} details and approve
          the M-Pesa prompt on your phone
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2.5"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {pendingOrder && (
            <button
              type="button"
              onClick={() => {
                const id = pendingOrder.id
                clearCart()
                onSuccess(id)
              }}
              className="shrink-0 font-bold underline cursor-pointer"
            >
              View Order Pass →
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <User className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Buyer &amp; Graduand</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {delivery.recipientName}
          </p>
          {delivery.graduandName && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
              For Graduand: {delivery.graduandName}
            </p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {delivery.recipientEmail}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Phone: {delivery.recipientPhone}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            {isDelivery ? (
              <Truck className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            ) : (
              <MapPin className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{isDelivery ? 'Delivery Address' : 'Graduation Pickup'}</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {delivery.campusOrVenue}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {delivery.venueAddress}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>{isDelivery ? 'Delivery' : 'Pickup'} Date &amp; Window</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {new Date(delivery.deliveryDate).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5 capitalize">
            {delivery.ceremonyTimeSlot.replace(/-/g, ' ')}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>M-Pesa STK Push</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            M-Pesa via PayHero
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Prompt sent to {payment.phoneNumber}
          </p>
        </div>
      </div>

      {/* Pre-checkout Upsell: Suggest smaller bouquets */}
      {smallerSuggestions.length > 0 && !isBusy && (
        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/25 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Add a smaller bouquet for a friend or classmate?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {smallerSuggestions.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-white dark:bg-neutral-900 p-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="h-11 w-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {prod.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {formatKsh(prod.price)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSuggestion(prod.id)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        <div className="pb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <span>Selected Bouquets ({items.length})</span>
          {referrer && (
            <span className="text-emerald-600 dark:text-emerald-400">
              Agent Code: @{referrer.toUpperCase()}
            </span>
          )}
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {item.quantity}× {item.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Badge variant="purple" className="text-xs py-0 px-1.5">
                    {item.ribbonColor}
                  </Badge>
                  {item.whatsInIt && <span>{item.whatsInIt}</span>}
                </div>
              </div>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatKsh(item.totalPrice)}
            </span>
          </div>
        ))}

        <div className="py-2.5 flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
          <span>
            {isDelivery ? 'Address Delivery Fee' : 'Graduation Event Pickup'}
          </span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {deliveryFee > 0 ? formatKsh(deliveryFee) : 'FREE'}
          </span>
        </div>

        <div className="pt-3 flex justify-between items-center text-sm font-bold text-neutral-900 dark:text-white">
          <span>Total M-Pesa Amount</span>
          <span className="text-lg text-rose-600 dark:text-rose-400">
            {formatKsh(grandTotal)}
          </span>
        </div>
      </div>

      {phase === 'awaiting' && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2.5"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>
              Check your phone ({payment.phoneNumber}) and enter your M-Pesa PIN
              to approve {formatKsh(grandTotal)}.
            </span>
          </div>
          {pendingOrder && (
            <button
              type="button"
              onClick={() => {
                const id = pendingOrder.id
                clearCart()
                onSuccess(id)
              }}
              className="shrink-0 font-bold underline cursor-pointer"
            >
              Open Pass →
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isBusy}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          isLoading={isBusy}
          onClick={handlePlaceOrder}
          rightIcon={<CheckCircle2 className="h-4 w-4" />}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
        >
          {phase === 'failed' ? 'Retry M-Pesa Payment' : 'Pay with M-Pesa'} (
          {formatKsh(grandTotal)})
        </Button>
      </div>

      <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/70 flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          {isDelivery
            ? 'In-stock bouquets deliver same day; freshly sourced orders deliver within 2–4 days.'
            : 'After payment we connect you with an available vendor for graduation pickup.'}
        </span>
      </div>
    </div>
  )
}
