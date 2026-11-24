import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as logger from 'firebase-functions/logger'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { queryPayheroPaymentStatus } from '../payhero/confirmPayheroPayment.js'
import {
  computeAuthoritativeOrderTotal,
  REFERRAL_COMMISSION_PER_ORDER_KSH,
  SAME_DAY_DELIVERY_FEE_KSH,
} from './pricing.js'

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

interface FulfillmentAssignment {
  route: 'vendor-connected' | 'same-day-delivery' | 'scheduled-2-4-days'
  assignedVendorCode?: string
  assignedVendorName?: string
  assignedVendorStation?: string
  estimatedDeliveryFeeKsh?: number
  estimatedTimeline: string
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
 * Post-payment smart fulfillment routing:
 * 1. If the buyer ordered for graduation pickup, connect them with an
 *    available vendor who has stock.
 * 2. Otherwise (address delivery or no graduation vendor available), check
 *    catalog stock: if in stock -> same-day delivery (small Bolt-based fee);
 *    if out of stock -> 2–4 day delivery while we source and prepare.
 */
async function resolveFulfillmentRoute(
  orderData: Record<string, unknown>,
  allInStock: boolean,
  totalItemCount: number,
): Promise<FulfillmentAssignment> {
  const delivery = (orderData.delivery ?? {}) as Record<string, unknown>
  const fulfillmentType =
    delivery.fulfillmentType === 'address-delivery'
      ? 'address-delivery'
      : 'event-pickup'
  const campus =
    typeof delivery.campusOrVenue === 'string'
      ? delivery.campusOrVenue.toLowerCase()
      : ''

  if (fulfillmentType === 'event-pickup') {
    const sellersSnap = await db.collection('sellers').get()
    const availableVendors = sellersSnap.docs
      .map((d): Record<string, unknown> & { id: string } => ({
        ...(d.data() as Record<string, unknown>),
        id: d.id,
      }))
      .filter((s) => {
        if (s.available === false) return false
        const allocated =
          typeof s.allocatedStock === 'number' ? s.allocatedStock : 0
        const manualSold =
          typeof s.manualSoldCount === 'number' ? s.manualSoldCount : 0
        const onlineOrders =
          typeof s.ordersCount === 'number' ? s.ordersCount : 0
        const remaining = allocated - manualSold - onlineOrders
        return remaining >= totalItemCount
      })

    const matchedVendor =
      availableVendors.find((v) => {
        const st = typeof v.station === 'string' ? v.station.toLowerCase() : ''
        return campus && st && (st.includes(campus) || campus.includes(st))
      }) ?? availableVendors[0]

    if (matchedVendor) {
      return {
        route: 'vendor-connected',
        assignedVendorCode:
          typeof matchedVendor.code === 'string'
            ? matchedVendor.code
            : matchedVendor.id,
        assignedVendorName:
          typeof matchedVendor.name === 'string'
            ? matchedVendor.name
            : 'Assigned Vendor',
        assignedVendorStation:
          typeof matchedVendor.station === 'string'
            ? matchedVendor.station
            : undefined,
        estimatedDeliveryFeeKsh: 0,
        estimatedTimeline:
          'Connected with an available vendor for graduation pickup.',
      }
    }
  }

  if (allInStock) {
    return {
      route: 'same-day-delivery',
      estimatedDeliveryFeeKsh: SAME_DAY_DELIVERY_FEE_KSH,
      estimatedTimeline:
        'In stock — scheduled for same-day delivery (delivery fee applies).',
    }
  }

  return {
    route: 'scheduled-2-4-days',
    estimatedDeliveryFeeKsh: SAME_DAY_DELIVERY_FEE_KSH,
    estimatedTimeline:
      '2–4 days delivery while we source fresh stems and prepare your bouquet.',
  }
}

/**
 * Post-payment confirmation trigger.
 * - Verifies paid amount against the authoritative server-computed order total.
 * - Assigns post-payment fulfillment routing (vendor / same-day / 2-4 days).
 * - Credits ONLY registered sellers that already exist in `sellers/{code}`,
 *   recording both ordersCount and KSh commission earned.
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
    const paidAmount = typeof after.amount === 'number' ? after.amount : 0

    // Server-side amount verification
    let authoritative
    try {
      authoritative = await computeAuthoritativeOrderTotal(db, orderData)
    } catch (err) {
      logger.error(
        'onPaymentConfirmed: failed to compute authoritative total',
        {
          paymentId,
          orderId: rawOrderId,
          err,
        },
      )
      return
    }

    if (paidAmount < authoritative.total) {
      logger.error(
        'onPaymentConfirmed: paid amount is less than authoritative order total — refusing confirmation',
        {
          paymentId,
          orderId: rawOrderId,
          paidAmount,
          expectedTotal: authoritative.total,
        },
      )
      await orderRef.set(
        {
          paymentMismatch: true,
          paidAmountReceived: paidAmount,
          expectedTotal: authoritative.total,
        },
        { merge: true },
      )
      return
    }

    const fulfillment = await resolveFulfillmentRoute(
      orderData,
      authoritative.allInStock,
      authoritative.totalItemCount,
    )

    const confirmationFields = {
      status: 'confirmed',
      paymentId,
      paidAt: FieldValue.serverTimestamp(),
      fulfillment,
      summary: {
        subtotal: authoritative.subtotal,
        deliveryFee: authoritative.deliveryFee,
        total: authoritative.total,
      },
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

    // Credit ONLY existing registered seller/agent codes (never create phantom sellers on typos)
    const referrer =
      typeof orderData.referrer === 'string' &&
      SAFE_ID_REGEX.test(orderData.referrer)
        ? orderData.referrer.toLowerCase()
        : null

    let creditedReferrer: string | null = null
    if (referrer) {
      const sellerRef = db.collection('sellers').doc(referrer)
      const sellerSnap = await sellerRef.get()
      if (!sellerSnap.exists) {
        logger.warn(
          'onPaymentConfirmed: ignoring unknown referral code (not registered)',
          {
            paymentId,
            orderId: rawOrderId,
            referrer,
          },
        )
      } else {
        const sellerData = sellerSnap.data() as Record<string, unknown>
        const commissionKsh =
          typeof sellerData.commissionPerOrderKsh === 'number' &&
          sellerData.commissionPerOrderKsh >= 0
            ? sellerData.commissionPerOrderKsh
            : REFERRAL_COMMISSION_PER_ORDER_KSH
        const pointsEarned = 10 + Math.floor(paidAmount / 100)

        await sellerRef.update({
          ordersCount: FieldValue.increment(1),
          totalSalesKsh: FieldValue.increment(paidAmount),
          earnedKsh: FieldValue.increment(commissionKsh),
          points: FieldValue.increment(pointsEarned),
          updatedAt: new Date().toISOString(),
        })
        creditedReferrer = referrer
      }
    }

    logger.info('onPaymentConfirmed: verified payment and updated order', {
      paymentId,
      orderId: rawOrderId,
      orderUserId,
      creditedReferrer,
      fulfillmentRoute: fulfillment.route,
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
