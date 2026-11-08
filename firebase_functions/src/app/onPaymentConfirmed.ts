import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as logger from 'firebase-functions/logger'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { queryPayheroPaymentStatus } from '../payhero/confirmPayheroPayment.js'

const db = getFirestore()
const MIN_PENDING_AGE_MS = 2 * 60 * 1000
const DEAD_PENDING_AGE_MS = 48 * 60 * 60 * 1000
const SWEEP_LIMIT = 100

interface OnConfirmTarget {
  /** Firestore document path to update, e.g. "bookings/abc123". */
  path: string
  /** Extra fields merged into the target doc alongside paymentId/paidAt. */
  fields?: Record<string, unknown>
}

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
 * Generic bridge between "a payment was confirmed" and "do something about it".
 *
 * Shared by every payment provider (currently payhero/) â€” it has no
 * knowledge of any app-specific or provider-specific concept, only of the
 * `payments/{paymentId}` contract those providers write to. The caller
 * describes what to do via `metadata.onConfirm` when starting the payment
 * (see startPayheroPayment), so the same
 * deployment works for any project or provider without modification.
 *
 * metadata.onConfirm may be a single target or an array of targets:
 *   { path: "bookings/abc123", fields: { status: "paid" } }
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
    const onConfirm = metadata.onConfirm as
      OnConfirmTarget | OnConfirmTarget[] | undefined

    if (!onConfirm) {
      logger.info('onPaymentConfirmed: no metadata.onConfirm target', {
        paymentId,
      })
      return
    }

    const targets = Array.isArray(onConfirm) ? onConfirm : [onConfirm]

    await Promise.all(
      targets.map(async (target) => {
        if (!target?.path) {
          logger.warn('onPaymentConfirmed: skipping target with no path', {
            paymentId,
            target,
          })
          return
        }

        await db.doc(target.path).set(
          {
            ...target.fields,
            paymentId,
            paidAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
      }),
    )

    logger.info('onPaymentConfirmed: applied onConfirm targets', {
      paymentId,
      count: targets.length,
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
