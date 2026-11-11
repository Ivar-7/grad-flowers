import { httpsCallable } from 'firebase/functions'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, functions } from '@/shared/firebase/firebase'
import {
  PaymentStatusSchema,
  StartPaymentResponseSchema,
} from '../types/checkout.schema'
import type { PaymentStatus } from '../types/checkout.types'

export interface StartPayheroPaymentInput {
  amount: number
  phoneNumber: string
  description: string
  orderId: string
  userId: string | null
}

interface StartPayheroPaymentRequest {
  amount: number
  phoneNumber: string
  description: string
  orderId: string
}

const startPayheroPaymentCall = httpsCallable<
  StartPayheroPaymentRequest,
  unknown
>(functions, 'startPayheroPayment')

export async function startPayheroPayment(
  input: StartPayheroPaymentInput,
): Promise<string> {
  const result = await startPayheroPaymentCall({
    amount: input.amount,
    phoneNumber: input.phoneNumber,
    description: input.description,
    orderId: input.orderId,
  })

  return StartPaymentResponseSchema.parse(result.data).paymentId
}

export interface PaymentSnapshot {
  status: PaymentStatus
  errorMessage: string | null
}

export function watchPayment(
  paymentId: string,
  onChange: (snapshot: PaymentSnapshot) => void,
  onError: (error: unknown) => void,
): () => void {
  return onSnapshot(
    doc(db, 'payments', paymentId),
    (snap) => {
      const data = snap.data()
      if (!data) return
      const status = PaymentStatusSchema.safeParse(data.status)
      if (!status.success) return
      onChange({
        status: status.data,
        errorMessage:
          typeof data.errorMessage === 'string' ? data.errorMessage : null,
      })
    },
    onError,
  )
}
