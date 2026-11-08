import { useState, type FormEvent } from 'react'
import {
  Smartphone,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import type { PaymentDetails } from '../types/checkout.types'
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
  const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const parsed = PaymentDetailsSchema.safeParse({ phoneNumber })
    if (!parsed.success) {
      setErrorMessage(normalizeError(parsed.error).userMessage)
      return
    }
    onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          2. Pay with M-Pesa
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          You will receive an M-Pesa prompt on this number to approve the
          payment
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

      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
        <label
          htmlFor="mpesa-phone"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          M-Pesa Phone Number *
        </label>
        <div className="relative">
          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            id="mpesa-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0712345678"
            className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

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
        <span>Secure M-Pesa payments powered by PayHero</span>
      </div>
    </form>
  )
}
