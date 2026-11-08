import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import {
  startPayheroPayment,
  watchPayment,
  type StartPayheroPaymentInput,
} from '../api/payments.api'

export type CheckoutPhase =
  'idle' | 'initiating' | 'awaiting' | 'paid' | 'failed'

interface PayheroCheckout {
  phase: CheckoutPhase
  errorMessage: string | null
  start: (input: StartPayheroPaymentInput) => Promise<void>
  reset: () => void
}

export function usePayheroCheckout(): PayheroCheckout {
  const [phase, setPhase] = useState<CheckoutPhase>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const stopWatching = useCallback(() => {
    unsubscribeRef.current?.()
    unsubscribeRef.current = null
  }, [])

  useEffect(() => stopWatching, [stopWatching])

  const fail = useCallback(
    (error: unknown, fallback: string) => {
      stopWatching()
      const appError = normalizeError(error, fallback)
      logError(appError, { feature: 'checkout', action: 'payhero-checkout' })
      setErrorMessage(appError.userMessage)
      setPhase('failed')
    },
    [stopWatching],
  )

  const start = useCallback(
    async (input: StartPayheroPaymentInput) => {
      stopWatching()
      setErrorMessage(null)
      setPhase('initiating')

      try {
        const paymentId = await startPayheroPayment(input)
        setPhase('awaiting')

        unsubscribeRef.current = watchPayment(
          paymentId,
          ({ status, errorMessage: reason }) => {
            if (status === 'paid') {
              stopWatching()
              setPhase('paid')
            } else if (status === 'failed' || status === 'cancelled') {
              stopWatching()
              setErrorMessage(
                reason ??
                  (status === 'cancelled'
                    ? 'The M-Pesa request was cancelled.'
                    : 'The M-Pesa payment failed. Please try again.'),
              )
              setPhase('failed')
            }
          },
          (error) => fail(error, 'Lost connection while confirming payment.'),
        )
      } catch (error) {
        fail(error, 'Could not start the M-Pesa payment. Please try again.')
      }
    },
    [fail, stopWatching],
  )

  const reset = useCallback(() => {
    stopWatching()
    setErrorMessage(null)
    setPhase('idle')
  }, [stopWatching])

  return { phase, errorMessage, start, reset }
}
