import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as logger from 'firebase-functions/logger'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { queryPayheroPaymentStatus } from '../payhero/confirmPayheroPayment.js'

const db = getFirestore()
const MIN_PENDING_AGE_MS = 2 * 60 * 1000
const DEAD_PENDING_AGE_MS = 48 * 60 * 60 * 1000
const SWEEP_LIMIT = 100

const SAFE_ID_REGEX = /^[A-Za-z0-9_-]{2,64}$/

interface SweepSummary {
  scanned: number
  skippedYoung: number
  checked: number
  updated: number
  markedDead: number
  missingCheckoutRequestID: number
  unsupportedProvider: number
  errors: number
}

function createdAtMillis(data: Record<string, unknown>): number | null {
  const createdAt = data.createdAt
  if (createdAt instanceof Timestamp) return createdAt.toMillis()
  if (createdAt instanceof Date) return createdAt.getTime()
  return null
}

async function queryProviderStatus(
  provider: string,
  checkoutRequestID: string,
): Promise<string | null> {
  if (provider === 'payhero')
    return queryPayheroPaymentStatus(checkoutRequestID)
  return null
}

/**
 * Post-payment confirmation trigger.
 * Strictly updates ONLY the order document associated with the payment
 * (`orders/{orderId}` and `users/{userId}/orders/{orderId}` when owned by a user)
 * and never writes to arbitrary paths supplied by the browser.
 */
export const onPaymentConfirmed = onDocumentUpdated(
  'payments/{paymentId}',
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    // Only act on the transition into "paid", and only once.
    if (before.status === 'paid' || after.status !== 'paid') return

    const paymentId = event.params.paymentId
    const metadata = (after.metadata ?? {}) as Record<string, unknown>
    const rawOrderId =
      (typeof after.orderId === 'string' ? after.orderId : undefined) ??
      (typeof metadata.orderId === 'string' ? metadata.orderId : undefined)

    if (!rawOrderId || !SAFE_ID_REGEX.test(rawOrderId)) {
      logger.warn('onPaymentConfirmed: missing or invalid orderId', {
        paymentId,
        rawOrderId,
      })
      return
    }

    const orderRef = db.collection('orders').doc(rawOrderId)
    const orderSnap = await orderRef.get()

    if (!orderSnap.exists) {
      logger.warn('onPaymentConfirmed: order not found', {
        paymentId,
        orderId: rawOrderId,
      })
      return
    }

    const orderData = orderSnap.data() as Record<string, unknown>
    const confirmationFields = {
      status: 'confirmed',
      paymentId,
      paidAt: FieldValue.serverTimestamp(),
    }

    await orderRef.set(confirmationFields, { merge: true })

    const orderUserId =
      typeof orderData.userId === 'string' &&
      SAFE_ID_REGEX.test(orderData.userId)
        ? orderData.userId
        : null

    if (orderUserId) {
      await db
        .collection('users')
        .doc(orderUserId)
        .collection('orders')
        .doc(rawOrderId)
        .set(confirmationFields, { merge: true })
    }

    const referrer =
      typeof orderData.referrer === 'string' &&
      SAFE_ID_REGEX.test(orderData.referrer)
        ? orderData.referrer.toLowerCase()
        : null

    if (referrer) {
      const amount = typeof after.amount === 'number' ? after.amount : 0
      const pointsEarned = 10 + Math.floor(amount / 100)
      await db
        .collection('sellers')
        .doc(referrer)
        .set(
          {
            code: referrer,
            ordersCount: FieldValue.increment(1),
            totalSalesKsh: FieldValue.increment(amount),
            points: FieldValue.increment(pointsEarned),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    }

    logger.info('onPaymentConfirmed: updated order documents only', {
      paymentId,
      orderId: rawOrderId,
      orderUserId,
      referrer,
    })
  },
)

export const reconcilePendingPayments = onSchedule(
  'every 30 minutes',
  async () => {
    const now = Date.now()
    const summary: SweepSummary = {
      scanned: 0,
      skippedYoung: 0,
      checked: 0,
      updated: 0,
      markedDead: 0,
      missingCheckoutRequestID: 0,
      unsupportedProvider: 0,
      errors: 0,
    }

    const pendingSnap = await db
      .collection('payments')
      .where('status', '==', 'pending')
      .limit(SWEEP_LIMIT)
      .get()

    summary.scanned = pendingSnap.size

    await Promise.all(
      pendingSnap.docs.map(async (doc) => {
        try {
          const data = doc.data() as Record<string, unknown>
          const createdMillis = createdAtMillis(data)
          const ageMs =
            createdMillis === null
              ? Number.POSITIVE_INFINITY
              : now - createdMillis

          if (ageMs < MIN_PENDING_AGE_MS) {
            summary.skippedYoung += 1
            return
          }

          const provider = data.provider as string | undefined
          const checkoutRequestID = data.checkoutRequestID as
            string | null | undefined

          if (!checkoutRequestID) {
            summary.missingCheckoutRequestID += 1
            if (ageMs >= DEAD_PENDING_AGE_MS) {
              await doc.ref.update({
                status: 'failed',
                confirmedVia: 'reconciliation',
                confirmedAt: FieldValue.serverTimestamp(),
                errorMessage: 'Payment confirmation timed out.',
              })
              summary.markedDead += 1
            }
            return
          }

          if (provider !== 'payhero') {
            summary.unsupportedProvider += 1
            if (ageMs >= DEAD_PENDING_AGE_MS) {
              await doc.ref.update({
                status: 'failed',
                confirmedVia: 'reconciliation',
                confirmedAt: FieldValue.serverTimestamp(),
                errorMessage: 'Unsupported payment provider timed out.',
              })
              summary.markedDead += 1
            }
            return
          }

          summary.checked += 1
          const newStatus = await queryProviderStatus(
            provider,
            checkoutRequestID,
          )

          if (newStatus && newStatus !== data.status) {
            await doc.ref.update({
              status: newStatus,
              confirmedVia: 'reconciliation',
              confirmedAt: FieldValue.serverTimestamp(),
            })
            summary.updated += 1
            return
          }

          if (ageMs >= DEAD_PENDING_AGE_MS) {
            await doc.ref.update({
              status: 'failed',
              confirmedVia: 'reconciliation',
              confirmedAt: FieldValue.serverTimestamp(),
              errorMessage: 'Payment confirmation timed out.',
            })
            summary.markedDead += 1
          }
        } catch (err) {
          summary.errors += 1
          logger.warn('reconcilePendingPayments: failed to process payment', {
            paymentId: doc.id,
            err,
          })
        }
      }),
    )

    logger.info('reconcilePendingPayments summary', summary)
  },
)
