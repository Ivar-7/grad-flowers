import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/features/cart/state/useCart'
import type { DeliveryDetails, PaymentDetails } from '../types/checkout.types'
import { DeliveryStep } from '../components/DeliveryStep'
import { PaymentStep } from '../components/PaymentStep'
import { ReviewStep } from '../components/ReviewStep'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'

type CheckoutStep = 'delivery' | 'payment' | 'review'

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'delivery', label: 'Ceremony Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Confirmation' },
]

export function CheckoutPage() {
  const { items, summary } = useCart()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery')

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    campusOrVenue: '',
    venueAddress: '',
    deliveryDate: '',
    ceremonyTimeSlot: 'morning-ceremony',
    specialInstructions: '',
  })

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    phoneNumber: '',
  })

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <EmptyState
          title="No bouquets in your cart"
          description="Your cart is currently empty. Please select a graduation bouquet to proceed to checkout."
          icon={<ShoppingBag className="h-8 w-8 text-indigo-500" />}
          action={
            <Link to="/flowers">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Browse Catalog
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const handleDeliverySubmit = (details: DeliveryDetails) => {
    setDeliveryDetails(details)
    setPaymentDetails((prev) => ({
      phoneNumber: prev.phoneNumber || details.recipientPhone,
    }))
    setCurrentStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePaymentSubmit = (details: PaymentDetails) => {
    setPaymentDetails(details)
    setCurrentStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOrderSuccess = (orderId: string) => {
    navigate(`/order-success/${orderId}`)
  }

  const getStepIndex = (step: CheckoutStep) =>
    STEPS.findIndex((s) => s.id === step)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Checkout Progress Bar */}
      <div className="mb-8">
        <div className="relative flex items-center justify-between max-w-md mx-auto mb-4">
          <div
            aria-hidden="true"
            className="absolute top-4 left-8 right-8 h-0.5 bg-neutral-200 dark:bg-neutral-800"
          />
          {STEPS.map((step, idx) => {
            const isCompleted = getStepIndex(currentStep) > idx
            const isCurrent = currentStep === step.id

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center bg-white dark:bg-neutral-950 px-2"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium mt-1.5 ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Checkout Box */}
      <Card className="p-6 sm:p-10 border-neutral-200 dark:border-neutral-800 shadow-sm">
        {currentStep === 'delivery' && (
          <DeliveryStep
            initialValues={deliveryDetails}
            onSubmit={handleDeliverySubmit}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentStep
            initialValues={paymentDetails}
            onBack={() => setCurrentStep('delivery')}
            onSubmit={handlePaymentSubmit}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            delivery={deliveryDetails}
            payment={paymentDetails}
            onBack={() => setCurrentStep('payment')}
            onSuccess={handleOrderSuccess}
          />
        )}
      </Card>

      {/* Mini Cart Total Bar */}
      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-2">
        <span>Order Total: {formatKsh(summary.total)}</span>
        <Link to="/cart" className="hover:underline">
          Edit items in cart
        </Link>
      </div>
    </div>
  )
}

export default CheckoutPage
