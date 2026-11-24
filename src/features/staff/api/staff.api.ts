import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'
import { SITE_CONFIG } from '@/shared/config/site.config'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import {
  UpsertSellerSchema,
  type UpsertSellerInput,
} from '../types/staff.schema'
import type { SellerRecord, SellerPerformanceRow } from '../types/staff.types'
import type { Order } from '@/features/checkout/types/checkout.types'
import type { LeadDoc } from '@/features/leads/types/leads.types'

export async function fetchSellers(): Promise<SellerRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'sellers'))
    if (snap.empty) {
      return []
    }
    const records: SellerRecord[] = snap.docs.map((d) => {
      const raw = d.data() as Partial<SellerRecord>
      return {
        code: raw.code || d.id,
        name: raw.name || d.id,
        phone: raw.phone || '',
        station: raw.station || 'Graduation Event',
        allocatedStock:
          typeof raw.allocatedStock === 'number' ? raw.allocatedStock : 0,
        manualSoldCount:
          typeof raw.manualSoldCount === 'number' ? raw.manualSoldCount : 0,
        commissionPerOrderKsh:
          typeof raw.commissionPerOrderKsh === 'number'
            ? raw.commissionPerOrderKsh
            : SITE_CONFIG.referralCommissionPerOrderKsh,
        earnedKsh: typeof raw.earnedKsh === 'number' ? raw.earnedKsh : 0,
        paidOutKsh: typeof raw.paidOutKsh === 'number' ? raw.paidOutKsh : 0,
        lastPaidAt: raw.lastPaidAt ?? null,
        available: raw.available !== false,
        updatedAt: raw.updatedAt || new Date().toISOString(),
      }
    })
    return records
  } catch (error) {
    const appError = normalizeError(
      error,
      'Could not load sellers. Staff or Admin sign-in required.',
    )
    logError(appError, { feature: 'staff', action: 'fetchSellers' })
    throw appError
  }
}

export async function upsertSeller(
  input: UpsertSellerInput,
): Promise<SellerRecord> {
  const validated = UpsertSellerSchema.parse(input)
  const now = new Date().toISOString()
  const record: SellerRecord = {
    ...validated,
    earnedKsh: 0,
    paidOutKsh: 0,
    lastPaidAt: null,
    updatedAt: now,
  }

  // Save full seller record (staff/admin-only)
  await setDoc(
    doc(db, 'sellers', record.code),
    {
      code: record.code,
      name: record.name,
      phone: record.phone,
      station: record.station,
      allocatedStock: record.allocatedStock,
      manualSoldCount: record.manualSoldCount,
      commissionPerOrderKsh: record.commissionPerOrderKsh,
      available: record.available,
      updatedAt: now,
    },
    { merge: true },
  )

  // Publish public-safe referral code lookup doc (zero PII or sales totals)
  await setDoc(
    doc(db, 'referralCodes', record.code),
    {
      code: record.code,
      active: true,
      updatedAt: now,
    },
    { merge: true },
  )

  return record
}

export async function markSellerPaidOut(
  code: string,
  totalEarnedKsh: number,
): Promise<string> {
  const now = new Date().toISOString()
  await updateDoc(doc(db, 'sellers', code), {
    paidOutKsh: totalEarnedKsh,
    lastPaidAt: now,
    updatedAt: now,
  })
  return now
}

export async function deleteSeller(code: string): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, 'sellers', code)),
    deleteDoc(doc(db, 'referralCodes', code)).catch(() => undefined),
  ])
}

/**
 * Computes seller performance strictly for registered sellers in `sellers`.
 * Unknown or mistyped referral codes are never auto-created or credited.
 */
export function computeSellerLeaderboard(
  sellers: SellerRecord[],
  orders: Order[],
  leads: LeadDoc[],
): SellerPerformanceRow[] {
  const rows: SellerPerformanceRow[] = []

  for (const seller of sellers) {
    const code = seller.code.toLowerCase()
    const sellerOrders = orders.filter(
      (o) => (o.referrer ?? '').toLowerCase() === code,
    )
    const paidOrders = sellerOrders.filter(
      (o) => o.status !== 'pending-payment',
    )
    const sellerLeads = leads.filter(
      (l) => (l.referrer ?? '').toLowerCase() === code,
    )

    const ordersCount = sellerOrders.length
    const paidOrdersCount = paidOrders.length
    const onlineItemsSold = paidOrders.reduce(
      (sum, o) => sum + o.items.reduce((q, item) => q + item.quantity, 0),
      0,
    )
    const itemsSoldCount = onlineItemsSold + seller.manualSoldCount
    const totalSalesKsh = paidOrders.reduce(
      (sum, o) => sum + o.summary.total,
      0,
    )
    const leadsCount = sellerLeads.length
    const remainingStock = Math.max(0, seller.allocatedStock - itemsSoldCount)

    const commissionRate =
      seller.commissionPerOrderKsh ?? SITE_CONFIG.referralCommissionPerOrderKsh
    const computedEarnedKsh = paidOrdersCount * commissionRate
    const earnedKsh = Math.max(seller.earnedKsh ?? 0, computedEarnedKsh)
    const paidOutKsh = seller.paidOutKsh ?? 0
    const unpaidKsh = Math.max(0, earnedKsh - paidOutKsh)

    const points =
      paidOrdersCount * 10 +
      Math.floor(totalSalesKsh / 100) +
      leadsCount * 15 +
      seller.manualSoldCount * 5

    rows.push({
      code: seller.code,
      name: seller.name,
      phone: seller.phone,
      station: seller.station,
      allocatedStock: seller.allocatedStock,
      ordersCount,
      paidOrdersCount,
      itemsSoldCount,
      remainingStock,
      totalSalesKsh,
      commissionPerOrderKsh: commissionRate,
      earnedKsh,
      paidOutKsh,
      unpaidKsh,
      lastPaidAt: seller.lastPaidAt ?? null,
      leadsCount,
      points,
      available: seller.available,
    })
  }

  return rows.sort((a, b) => b.earnedKsh - a.earnedKsh || b.points - a.points)
}

function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Exports all orders into a single CSV sheet ready for Google Sheets or Excel.
 */
export function buildOrdersCsv(orders: Order[]): string {
  const headers = [
    'Order ID',
    'Created At',
    'Status',
    'Bouquets',
    'Total Qty',
    'Graduand Name',
    'Buyer Name',
    'Phone',
    'Email',
    'Fulfillment Type',
    'Graduation / Area',
    'Pickup Point / Address',
    'Delivery Date',
    'Time Window',
    'Delivery Fee (KSh)',
    'Total (KSh)',
    'Agent / Ref Code',
    'Fulfillment Route',
  ]

  const lines = [headers.map(csvEscape).join(',')]
  for (const order of orders) {
    const bouquets = order.items
      .map((i) => `${i.quantity}x ${i.name} (${i.ribbonColor})`)
      .join('; ')
    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0)
    lines.push(
      [
        order.id,
        order.createdAt,
        order.status,
        bouquets,
        totalQty,
        order.delivery.graduandName ?? '',
        order.delivery.recipientName,
        order.delivery.recipientPhone,
        order.delivery.recipientEmail || order.userEmail,
        order.delivery.fulfillmentType ?? 'event-pickup',
        order.delivery.campusOrVenue,
        order.delivery.venueAddress,
        order.delivery.deliveryDate,
        order.delivery.ceremonyTimeSlot,
        order.summary.deliveryFee ?? 0,
        order.summary.total,
        order.referrer ?? '',
        order.fulfillment?.route ?? '',
      ]
        .map(csvEscape)
        .join(','),
    )
  }

  return lines.join('\r\n')
}
