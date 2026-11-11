import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import {
  PAYHERO_BASE_URL,
  getPayheroAuth,
  getChannelId,
  getCallbackUrl,
  normalizePhone,
} from './config.js'

const db = getFirestore()

const SAFE_ORDER_ID_REGEX = /^[A-Za-z0-9_-]{4,64}$/

/**
 * Initiates an M-Pesa STK push via PayHero for a specific order.
 * Supports both 60-second guest checkout and authenticated users.
 * Never accepts arbitrary document paths from the client; only updates
 * the verified order's own documents in onPaymentConfirmed.
 *
 * Input:
 *   { amount, phoneNumber, description, orderId }
 *
 * Returns:
 *   { paymentId }
 */
export const startPayheroPayment = onCall(async (request) => {
  const uid = request.auth?.uid ?? null
  const amount = request.data?.amount as number | undefined
  const rawPhone = request.data?.phoneNumber as string | undefined
  const description = request.data?.description as string | undefined
  const rawOrderId =
    (request.data?.orderId as string | undefined) ??
    ((request.data?.metadata as Record<string, unknown> | undefined)
      ?.orderId as string | undefined)

  if (!amount || amount <= 0) {
    throw new HttpsError(
      'invalid-argument',
      'amount must be a positive number.',
    )
  }
  if (!rawPhone) {
    throw new HttpsError('invalid-argument', 'phoneNumber is required.')
  }
  if (!description) {
    throw new HttpsError('invalid-argument', 'description is required.')
  }
  if (!rawOrderId || !SAFE_ORDER_ID_REGEX.test(rawOrderId)) {
    throw new HttpsError('invalid-argument', 'A valid orderId is required.')
  }

  const orderSnap = await db.collection('orders').doc(rawOrderId).get()
  if (!orderSnap.exists) {
    throw new HttpsError('not-found', 'Order not found.')
  }

  const orderData = orderSnap.data() as Record<string, unknown>
  const orderOwnerId =
    typeof orderData.userId === 'string' && orderData.userId
      ? orderData.userId
      : null
  const deliveryData = (orderData.delivery ?? {}) as Record<string, unknown>
  const customerName =
    typeof deliveryData.recipientName === 'string'
      ? deliveryData.recipientName
      : 'Graduate'
  const customerEmail =
    typeof deliveryData.recipientEmail === 'string' &&
    deliveryData.recipientEmail
      ? deliveryData.recipientEmail
      : typeof orderData.userEmail === 'string'
        ? orderData.userEmail
        : ''

  if (orderOwnerId && uid && orderOwnerId !== uid) {
    throw new HttpsError(
      'permission-denied',
      'Order belongs to a different account.',
    )
  }

  const phone = normalizePhone(rawPhone)
  if (!/^(07|01)\d{8}$/.test(phone)) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid phone number. Use format 07xxxxxxxx or 01xxxxxxxx.',
    )
  }

  const paymentId = uuidv4()
  const paymentRef = db.collection('payments').doc(paymentId)

  await paymentRef.set({
    paymentId,
    provider: 'payhero',
    userId: uid ?? orderOwnerId,
    orderId: rawOrderId,
    customerName,
    customerEmail,
    amount,
    phone,
    description,
    status: 'pending',
    checkoutRequestID: null,
    confirmedVia: null,
    confirmedAt: null,
    createdAt: FieldValue.serverTimestamp(),
  })

  try {
    const response = await axios.post(
      `${PAYHERO_BASE_URL}/payments`,
      {
        amount,
        phone_number: phone,
        customer_name: customerName,
        channel_id: getChannelId(),
        provider: 'm-pesa',
        external_reference: paymentId,
        callback_url: getCallbackUrl(),
        description,
      },
      {
        headers: {
          Authorization: `Basic ${getPayheroAuth()}`,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      },
    )

    const responseData = response.data as Record<string, unknown>
    const checkoutRequestID =
      (responseData.reference as string | undefined) ??
      (responseData.CheckoutRequestID as string | undefined) ??
      null

    await paymentRef.update({ checkoutRequestID })

    return { paymentId }
  } catch (err: unknown) {
    const e = err as {
      response?: { data?: { message?: string } }
      message?: string
    }
    const errMsg = e?.response?.data?.message ?? e?.message ?? 'PayHero error'

    await paymentRef.update({ status: 'failed', errorMessage: errMsg })

    logger.error('startPayheroPayment: STK push failed', {
      paymentId,
      uid,
      errMsg,
    })
    throw new HttpsError(
      'internal',
      'Failed to initiate payment. Please try again.',
    )
  }
})
