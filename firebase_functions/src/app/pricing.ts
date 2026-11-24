import type { Firestore } from 'firebase-admin/firestore'

export const OFFICIAL_PRODUCT_PRICES: Record<string, number> = {
  single: 50,
  mini: 350,
  'mini-candy': 500,
  classic: 600,
  'classic-candy': 750,
  premium: 1500,
}

export const SAME_DAY_DELIVERY_FEE_KSH = 250
export const REFERRAL_COMMISSION_PER_ORDER_KSH = 30

export interface AuthoritativeOrderTotals {
  subtotal: number
  deliveryFee: number
  total: number
  totalItemCount: number
  allInStock: boolean
}

/**
 * Recomputes an order's authoritative total on the server from the catalog
 * prices and fulfillment type, ignoring client-submitted totals.
 */
export async function computeAuthoritativeOrderTotal(
  db: Firestore,
  orderData: Record<string, unknown>,
): Promise<AuthoritativeOrderTotals> {
  const rawItems = orderData.items
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Order has no items.')
  }

  let subtotal = 0
  let totalItemCount = 0
  let allInStock = true

  // Fetch unique flower docs in parallel to get live price & stock flags
  const uniqueIds = Array.from(
    new Set(
      rawItems
        .map((item) =>
          item && typeof item === 'object'
            ? (item as Record<string, unknown>).flowerId
            : null,
        )
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  )

  const flowerSnaps = await Promise.all(
    uniqueIds.map((id) => db.collection('flowers').doc(id).get()),
  )
  const flowerDocs = new Map<string, Record<string, unknown>>()
  flowerSnaps.forEach((snap) => {
    if (snap.exists) {
      flowerDocs.set(snap.id, snap.data() as Record<string, unknown>)
    }
  })

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== 'object') {
      throw new Error('Invalid order item.')
    }
    const item = rawItem as Record<string, unknown>
    const flowerId = typeof item.flowerId === 'string' ? item.flowerId : ''
    const quantity =
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 100
        ? item.quantity
        : 0

    if (!flowerId || quantity <= 0) {
      throw new Error('Invalid bouquet or quantity in order.')
    }

    const docData = flowerDocs.get(flowerId)
    const livePrice =
      docData && typeof docData.price === 'number' && docData.price > 0
        ? docData.price
        : OFFICIAL_PRODUCT_PRICES[flowerId]

    if (typeof livePrice !== 'number' || livePrice <= 0) {
      throw new Error(`Unknown bouquet product: ${flowerId}`)
    }

    if (docData && docData.inStock === false) {
      allInStock = false
    }

    subtotal += Math.ceil(livePrice) * quantity
    totalItemCount += quantity
  }

  const delivery = (orderData.delivery ?? {}) as Record<string, unknown>
  const fulfillmentType =
    delivery.fulfillmentType === 'address-delivery'
      ? 'address-delivery'
      : 'event-pickup'
  const deliveryFee =
    fulfillmentType === 'address-delivery' ? SAME_DAY_DELIVERY_FEE_KSH : 0

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    totalItemCount,
    allInStock,
  }
}
