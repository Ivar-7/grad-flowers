import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import type { Order, OrderStatus } from '../types/checkout.types'

const SESSION_RECEIPT_KEY = 'grad_flowers_last_orders_session_v1'

function getTimeSlotDescription(slot: string): string {
  switch (slot) {
    case 'morning-ceremony':
      return '7:00 AM - 9:30 AM (Morning Processional Pickup)'
    case 'midday-ceremony':
      return '10:00 AM - 1:00 PM (Midday Graduation Pickup)'
    case 'afternoon-ceremony':
      return '1:30 PM - 4:30 PM (Afternoon Photo Call Pickup)'
    case 'evening-banquet':
      return '5:00 PM - 7:30 PM (Evening Celebration Pickup)'
    default:
      return 'Graduation Station Window'
  }
}

function getSessionReceipts(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const raw =
      localStorage.getItem(SESSION_RECEIPT_KEY) ??
      sessionStorage.getItem(SESSION_RECEIPT_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

export function saveSessionReceipt(order: Order): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getSessionReceipts()
    const updated = [order, ...existing.filter((o) => o.id !== order.id)].slice(
      0,
      20,
    )
    const serialized = JSON.stringify(updated)
    localStorage.setItem(SESSION_RECEIPT_KEY, serialized)
    sessionStorage.setItem(SESSION_RECEIPT_KEY, serialized)
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
    referrer: data.referrer ?? null,
    status: 'pending-payment',
    createdAt,
    estimatedDeliveryWindow,
  }

  await setDoc(doc(db, 'orders', id), order)

  if (data.userId) {
    await setDoc(doc(db, 'users', data.userId, 'orders', id), order)
  }

  saveSessionReceipt(order)

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
      normalizeError(
        error,
        'Order read restricted to owner or staff; checking current session receipt.',
      ),
      {
        feature: 'checkout',
        action: 'fetchOrderById',
        metadata: { id },
      },
    )
  }

  const sessionOrders = getSessionReceipts()
  return sessionOrders.find((o) => o.id === id) ?? null
}

export async function fetchUserOrders(userId: string | null): Promise<Order[]> {
  if (!userId) {
    return getSessionReceipts()
  }

  try {
    const userOrdersRef = collection(db, 'users', userId, 'orders')
    const q = query(userOrdersRef, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)

    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as Order)
    }

    // Also check root orders collection where userId == current user
    const rootQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    const rootSnap = await getDocs(rootQuery)
    return rootSnap.docs.map((d) => d.data() as Order)
  } catch (error) {
    logError(normalizeError(error, 'Could not load orders from cloud.'), {
      feature: 'orders',
      action: 'fetchUserOrders',
      metadata: { userId },
    })
    return getSessionReceipts()
  }
}

export async function fetchAllOrdersForStaff(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as Order)
  } catch (error) {
    const appError = normalizeError(
      error,
      'Unable to load orders. Staff or Admin permissions required.',
    )
    logError(appError, { feature: 'staff', action: 'fetchAllOrdersForStaff' })
    throw appError
  }
}

export async function updateOrderStatusForStaff(
  orderId: string,
  status: OrderStatus,
  userId?: string | null,
): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status })
  if (userId) {
    try {
      await updateDoc(doc(db, 'users', userId, 'orders', orderId), { status })
    } catch {
      // User subcollection doc may not exist for guest orders
    }
  }
}
