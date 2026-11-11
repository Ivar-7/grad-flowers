import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import axios from 'axios'
import {
  PAYHERO_BASE_URL,
  getPayheroAuth,
  verifyCallbackSecret,
} from './config.js'

const db = getFirestore()
const TERMINAL = new Set(['paid', 'failed', 'cancelled'])

function nestedResponse(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const response = payload.response
  return response && typeof response === 'object' && !Array.isArray(response)
    ? (response as Record<string, unknown>)
    : {}
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

function payheroExternalReference(
  payload: Record<string, unknown>,
): string | undefined {
  const response = nestedResponse(payload)
  return firstString(
    response.ExternalReference,
    response.external_reference,
    payload.external_reference,
    payload.ExternalReference,
  )
}

function payheroStatus(payload: Record<string, unknown>): string | undefined {
  const response = nestedResponse(payload)
  return firstString(
    response.Status,
    response.status,
    payload.status,
    payload.Status,
  )
}

function payheroCheckoutRequestID(
  payload: Record<string, unknown>,
): string | undefined {
  const response = nestedResponse(payload)
  return firstString(
    response.CheckoutRequestID,
    response.reference,
    payload.reference,
    payload.CheckoutRequestID,
  )
}

function toInternalStatus(raw: string | undefined): string | null {
  const s = raw?.toUpperCase()
  if (s === 'SUCCESS' || s === 'SUCCESSFUL' || s === 'COMPLETED') return 'paid'
  if (s === 'FAILED' || s === 'FAILURE' || s === 'FAIL') return 'failed'
  if (s === 'CANCELLED' || s === 'CANCELED') return 'cancelled'
  return null
}

async function updatePaymentStatus(
  paymentId: string,
  newStatus: string,
  via: 'callback' | 'polling',
  checkoutRequestID?: string,
): Promise<void> {
  const update: Record<string, unknown> = {
    status: newStatus,
    confirmedVia: via,
    confirmedAt: FieldValue.serverTimestamp(),
  }
  if (checkoutRequestID) update.checkoutRequestID = checkoutRequestID
  await db.collection('payments').doc(paymentId).update(update)
}

export async function queryPayheroPaymentStatus(
  checkoutRequestID: string,
): Promise<string | null> {
  const response = await axios.get(`${PAYHERO_BASE_URL}/transaction-status`, {
    params: { reference: checkoutRequestID },
    headers: { Authorization: `Basic ${getPayheroAuth()}` },
    timeout: 15_000,
  })

  return toInternalStatus(
    payheroStatus(response.data as Record<string, unknown>),
  )
}

/**
 * HTTP endpoint — PayHero posts here when a payment completes.
 * Updates payments/{paymentId}.status and nothing else.
 * The onPaymentConfirmed Firestore trigger handles all app-level logic.
 *
 * Requires a `secret` query param matching PAYHERO_CALLBACK_SECRET — without
 * it, anyone who learns a paymentId could forge a "paid" status via curl.
 */
export const payheroCallback = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  try {
    if (!verifyCallbackSecret(req.query?.secret)) {
      logger.warn(
        'payheroCallback: rejected request with missing/invalid secret',
      )
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const payload = req.body as Record<string, unknown>

    const paymentId = payheroExternalReference(payload)
    const rawStatus = payheroStatus(payload)
    const checkoutRequestID = payheroCheckoutRequestID(payload)
    logger.info('PayHero callback received', {
      paymentId,
      rawStatus,
      checkoutRequestID,
    })

    if (!paymentId) {
      res.status(400).json({ error: 'Missing external_reference' })
      return
    }

    const status = toInternalStatus(rawStatus)
    if (!status) {
      res.status(200).json({ received: true, status: 'ignored' })
      return
    }

    const paymentSnap = await db.collection('payments').doc(paymentId).get()
    if (!paymentSnap.exists) {
      logger.warn('payheroCallback: payment not found', { paymentId })
      res.status(404).json({ error: 'Payment not found' })
      return
    }

    const existingData = paymentSnap.data() as Record<string, unknown>

    // Idempotent — already terminal
    if (TERMINAL.has(existingData.status as string)) {
      res.status(200).json({ received: true, status: 'already_terminal' })
      return
    }

    await updatePaymentStatus(paymentId, status, 'callback', checkoutRequestID)
    res.status(200).json({ received: true, status })
  } catch (err) {
    logger.error('payheroCallback error', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * Callable — Flutter polls this every 12 s while waiting for confirmation.
 * Hits PayHero status API, updates Firestore if status changed.
 * Idempotent — safe to call multiple times.
 *
 * Input:  { paymentId }
 * Returns: { status }
 */
export const checkPaymentStatus = onCall(async (request) => {
  const paymentId = request.data?.paymentId as string | undefined
  if (!paymentId) {
    throw new HttpsError('invalid-argument', 'paymentId is required.')
  }

  const paymentSnap = await db.collection('payments').doc(paymentId).get()
  if (!paymentSnap.exists) {
    throw new HttpsError('not-found', 'Payment not found.')
  }

  const paymentData = paymentSnap.data() as Record<string, unknown>

  if (
    paymentData.userId &&
    request.auth?.uid &&
    paymentData.userId !== request.auth.uid
  ) {
    throw new HttpsError('permission-denied', 'Access denied.')
  }

  const currentStatus = paymentData.status as string
  if (TERMINAL.has(currentStatus)) {
    return { status: currentStatus }
  }

  const checkoutRequestID = paymentData.checkoutRequestID as string | null
  if (!checkoutRequestID) {
    return { status: paymentData.status }
  }

  try {
    const newStatus = await queryPayheroPaymentStatus(checkoutRequestID)

    if (newStatus && newStatus !== paymentData.status) {
      await updatePaymentStatus(paymentId, newStatus, 'polling')
      return { status: newStatus }
    }

    return { status: paymentData.status }
  } catch (err) {
    logger.warn('checkPaymentStatus: PayHero API error', { paymentId, err })
    return { status: paymentData.status }
  }
})
