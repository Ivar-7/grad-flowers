import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import type { Order } from '../types/checkout.types'

const LOCAL_ORDERS_KEY = 'grad_flowers_cached_orders'

function getTimeSlotDescription(slot: string): string {
  switch (slot) {
    case 'morning-ceremony':
      return '7:30 AM - 9:30 AM (Morning Ceremony Call)'
    case 'midday-ceremony':
      return '11:30 AM - 1:30 PM (Midday Commencement Call)'
    case 'afternoon-ceremony':
      return '3:00 PM - 5:00 PM (Afternoon Diploma Call)'
    case 'evening-banquet':
      return '6:00 PM - 8:00 PM (Evening Honors Banquet)'
    default:
      return 'Ceremony Morning Window'
  }
}

function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

function cacheOrderLocally(order: Order): void {
  try {
    const existing = getStoredOrders()
    const updated = [order, ...existing.filter((o) => o.id !== order.id)]
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage quota
  }
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'status' | 'estimatedDeliveryWindow'>,
): Promise<Order> {
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  const id = `GF-2026-${randomSuffix}`
  const createdAt = new Date().toISOString()
  const estimatedDeliveryWindow = getTimeSlotDescription(
    data.delivery.ceremonyTimeSlot,
  )

  const order: Order = {
    ...data,
    id,
    status: 'confirmed',
    createdAt,
    estimatedDeliveryWindow,
  }

  // Always cache locally first so user is never stranded
  cacheOrderLocally(order)

  try {
    // Save to Firestore general orders collection
    const orderDocRef = doc(db, 'orders', id)
    await setDoc(orderDocRef, order)

    // If signed-in user, also record in their subcollection
    if (data.userId) {
      const userOrderRef = doc(db, 'users', data.userId, 'orders', id)
      await setDoc(userOrderRef, order)
    }
  } catch (error) {
    // Non-fatal if offline/rules issue: log diagnostic and proceed with locally cached order
    const appError = normalizeError(
      error,
      'Order saved locally. Cloud synchronization pending.',
    )
    logError(appError, {
      feature: 'checkout',
      action: 'createOrder',
      metadata: { id },
    })
  }

  return order
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const orderSnap = await getDoc(doc(db, 'orders', id))
    if (orderSnap.exists()) {
      return orderSnap.data() as Order
    }
  } catch (error) {
    logError(
      normalizeError(error, 'Could not retrieve order from cloud database.'),
      {
        feature: 'checkout',
        action: 'fetchOrderById',
        metadata: { id },
      },
    )
  }

  // Check local cache fallback
  const localOrders = getStoredOrders()
  const match = localOrders.find((o) => o.id === id)
  return match ?? null
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const userOrdersRef = collection(db, 'users', userId, 'orders')
    const q = query(userOrdersRef, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)

    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Order)
    }
  } catch (error) {
    logError(normalizeError(error, 'Could not load past orders from cloud.'), {
      feature: 'orders',
      action: 'fetchUserOrders',
      metadata: { userId },
    })
  }

  // Fallback to local storage filter
  const local = getStoredOrders()
  return local.filter((o) => o.userId === userId || !o.userId)
}
