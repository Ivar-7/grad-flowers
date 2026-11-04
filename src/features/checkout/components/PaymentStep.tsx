import { useState, type FormEvent } from 'react'
import {
  CreditCard,
  Smartphone,
  Store,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import type { PaymentDetails, PaymentMethodType } from '../types/checkout.types'
import { PaymentDetailsSchema } from '../types/checkout.schema'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { Button } from '@/shared/ui/Button'

export interface PaymentStepProps {
  initialValues: PaymentDetails
  onBack: () => void
  onSubmit: (details: PaymentDetails) => void
}

export function PaymentStep({
  initialValues,
  onBack,
  onSubmit,
}: PaymentStepProps) {
  const [method, setMethod] = useState<PaymentMethodType>(
    initialValues.method || 'card',
  )
  const [cardNumber, setCardNumber] = useState(initialValues.cardNumber || '')
  const [cardExp, setCardExp] = useState(initialValues.cardExp || '')
  const [cardCvc, setCardCvc] = useState(initialValues.cardCvc || '')
  const [billingZip, setBillingZip] = useState(initialValues.billingZip || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      const payload: PaymentDetails = {
        method,
        cardNumber,
        cardExp,
        cardCvc,
        billingZip,
      }
      PaymentDetailsSchema.parse(payload)
      onSubmit(payload)
    } catch (err) {
      const normalized = normalizeError(err)
      setErrorMessage(normalized.userMessage)
    }
  }

  // Format credit card input cleanly
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16)
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim()
    setCardNumber(formatted)
  }

  const handleExpChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4)
    if (raw.length >= 3) {
      setCardExp(`${raw.slice(0, 2)}/${raw.slice(2)}`)
    } else {
      setCardExp(raw)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          2. Payment Method
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Transactions are encrypted and ceremony reservation is guaranteed
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Method Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setMethod('card')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
            method === 'card'
              ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
          }`}
        >
          <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Credit / Debit
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Visa, MC, Amex
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod('apple-pay')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
            method === 'apple-pay'
              ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
          }`}
        >
          <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Apple / Google Pay
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              One-touch checkout
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod('cash-on-pickup')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
            method === 'cash-on-pickup'
              ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
          }`}
        >
          <Store className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Campus Kiosk
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Pay upon handoff
            </div>
          </div>
        </button>
      </div>

      {/* Credit Card Inputs */}
      {method === 'card' && (
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-4">
          <div>
            <label
              htmlFor="card-number"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Card Number *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                id="card-number"
                type="text"
                required
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="4532 8920 1204 8839"
                className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="card-exp"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Expires *
              </label>
              <input
                id="card-exp"
                type="text"
                required
                placeholder="MM/YY"
                value={cardExp}
                onChange={(e) => handleExpChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white text-center placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="card-cvc"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                CVC *
              </label>
              <input
                id="card-cvc"
                type="password"
                required
                maxLength={4}
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white text-center placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="billing-zip"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Billing Zip *
              </label>
              <input
                id="billing-zip"
                type="text"
                required
                placeholder="94720"
                value={billingZip}
                onChange={(e) => setBillingZip(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white text-center placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {method === 'apple-pay' && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
          <Smartphone className="h-8 w-8 text-neutral-700 dark:text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Express Digital Wallet Selected
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            You will confirm biometric authorization on the final review step.
          </p>
        </div>
      )}

      {method === 'cash-on-pickup' && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
          <Store className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Pay at Ceremony Florist Kiosk
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Cash, Venmo, or card accepted at the flower tent outside the
            ceremony gate.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Delivery
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Review Ceremony Order
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
        <Lock className="h-3.5 w-3.5" />
        <span>256-Bit SSL Encrypted & PCI Compliant Payment Processing</span>
      </div>
    </form>
  )
}
