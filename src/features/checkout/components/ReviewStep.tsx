import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Smartphone,
  User,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import type {
  DeliveryDetails,
  Order,
  PaymentDetails,
} from '../types/checkout.types'
import { useCart } from '@/features/cart/state/useCart'
import { useAuth } from '@/features/auth/state/useAuth'
import { createOrder } from '../api/orders.api'
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
  const { items, summary, clearCart } = useCart()
  const { user } = useAuth()
  const checkout = usePayheroCheckout()
  const [orderError, setOrderError] = useState<string | null>(null)
  const pendingOrderRef = useRef<Order | null>(null)

  const { phase } = checkout
  const isBusy = phase === 'initiating' || phase === 'awaiting'
  const errorMessage = orderError ?? checkout.errorMessage

  useEffect(() => {
    if (phase !== 'paid' || !pendingOrderRef.current) return
    const orderId = pendingOrderRef.current.id
    clearCart()
    onSuccess(orderId)
  }, [phase, clearCart, onSuccess])

  const handlePlaceOrder = async () => {
    if (!user) return
    setOrderError(null)

    try {
      if (!pendingOrderRef.current) {
        pendingOrderRef.current = await createOrder({
          userId: user.uid,
          userEmail:
            user.email ||
            `${delivery.recipientName.toLowerCase().replace(/\s+/g, '')}@student.edu`,
          items,
          summary,
          delivery,
          paymentMethod: 'mpesa',
        })
      }

      await checkout.start({
        amount: Math.ceil(summary.total),
        phoneNumber: payment.phoneNumber,
        description: `Grad Flowers order ${pendingOrderRef.current.id}`,
        orderId: pendingOrderRef.current.id,
        userId: user.uid,
      })
    } catch (err) {
      const normalized = normalizeError(
        err,
        'Failed to start your order. Please try again.',
      )
      logError(normalized, { feature: 'checkout', action: 'placeOrder' })
      setOrderError(normalized.userMessage)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          3. Final Review & Reservation
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Review your graduation delivery specifications before placing your
          order
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recipient & Venue Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Graduate Recipient</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {delivery.recipientName}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Phone: {delivery.recipientPhone}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ceremony Venue</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {delivery.campusOrVenue}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {delivery.venueAddress}
          </p>
        </div>
      </div>

      {/* Timing & Payment Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ceremony Date & Arrival</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {new Date(delivery.deliveryDate).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 capitalize">
            {delivery.ceremonyTimeSlot.replace(/-/g, ' ')}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Smartphone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Payment Method</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            M-Pesa via PayHero
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Prompt sent to {payment.phoneNumber}
          </p>
        </div>
      </div>

      {/* Bouquet Items Overview */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        <div className="pb-3 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Reserved Bouquets ({items.length})
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
                  {item.ribbonCustomText && (
                    <span>&ldquo;{item.ribbonCustomText}&rdquo;</span>
                  )}
                </div>
              </div>
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">
              {formatKsh(item.totalPrice)}
            </span>
          </div>
        ))}

        <div className="pt-3 flex justify-between items-center text-sm font-bold text-neutral-900 dark:text-white">
          <span>Total To Charge</span>
          <span className="text-lg text-indigo-600 dark:text-indigo-400">
            {formatKsh(summary.total)}
          </span>
        </div>
      </div>

      {phase === 'awaiting' && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2.5"
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>
            Check your phone and enter your M-Pesa PIN to approve{' '}
            {formatKsh(summary.total)}. This page updates automatically.
          </span>
        </div>
      )}

      {!user && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2.5"
        >
          <span>Please sign in to pay for your order with M-Pesa.</span>
          <Link to="/auth" className="font-bold underline">
            Sign in
          </Link>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isBusy}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Payment
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          isLoading={isBusy}
          disabled={!user}
          onClick={handlePlaceOrder}
          rightIcon={<CheckCircle2 className="h-4 w-4" />}
          className="shadow-lg shadow-indigo-600/25"
        >
          {phase === 'failed' ? 'Retry M-Pesa Payment' : 'Pay with M-Pesa'} (
          {formatKsh(summary.total)})
        </Button>
      </div>

      <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/70 flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          100% On-Time Commencement Arrival Guarantee with Free Stem Replacement
        </span>
      </div>
    </div>
  )
}
