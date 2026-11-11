import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import {
  UpsertSellerSchema,
  type UpsertSellerInput,
} from '../types/staff.schema'
import type { SellerRecord, SellerPerformanceRow } from '../types/staff.types'
import type { Order } from '@/features/checkout/types/checkout.types'
import type { LeadDoc } from '@/features/leads/types/leads.types'

export const DEFAULT_SELLERS: SellerRecord[] = [
  {
    code: 'wanjiku',
    name: 'Wanjiku Kamau',
    phone: '0712345678',
    station: 'UoN — Great Court Station',
    allocatedStock: 50,
    manualSoldCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'kelvin',
    name: 'Kelvin Mwangi',
    phone: '0722334455',
    station: 'JKUAT — Gate A Station',
    allocatedStock: 60,
    manualSoldCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'amina',
    name: 'Amina Hassan',
    phone: '0733445566',
    station: 'Strathmore — Madaraka Gate',
    allocatedStock: 45,
    manualSoldCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'brian',
    name: 'Brian Ochieng',
    phone: '0745667788',
    station: 'KU — Main Gate Station',
    allocatedStock: 55,
    manualSoldCount: 0,
    updatedAt: new Date().toISOString(),
  },
]

export async function fetchSellers(): Promise<SellerRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'sellers'))
    if (snap.empty) {
      return DEFAULT_SELLERS
    }
    const records: SellerRecord[] = snap.docs.map((d) => {
      const raw = d.data() as Partial<SellerRecord>
      return {
        code: raw.code || d.id,
        name: raw.name || d.id,
        phone: raw.phone || '0700000000',
        station: raw.station || 'Campus Station',
        allocatedStock:
          typeof raw.allocatedStock === 'number' ? raw.allocatedStock : 40,
        manualSoldCount:
          typeof raw.manualSoldCount === 'number' ? raw.manualSoldCount : 0,
        updatedAt: raw.updatedAt || new Date().toISOString(),
      }
    })
    return records
  } catch (error) {
    logError(normalizeError(error, 'Could not fetch sellers list.'), {
      feature: 'staff',
      action: 'fetchSellers',
    })
    return DEFAULT_SELLERS
  }
}

export async function upsertSeller(
  input: UpsertSellerInput,
): Promise<SellerRecord> {
  const validated = UpsertSellerSchema.parse(input)
  const record: SellerRecord = {
    ...validated,
    updatedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, 'sellers', record.code), record, { merge: true })
  return record
}

export function computeSellerLeaderboard(
  sellers: SellerRecord[],
  orders: Order[],
  leads: LeadDoc[],
): SellerPerformanceRow[] {
  const map = new Map<string, SellerRecord>()
  for (const s of sellers) {
    map.set(s.code.toLowerCase(), s)
  }

  // Also include any dynamic ?ref=name codes that appeared in orders or leads
  for (const o of orders) {
    if (o.referrer) {
      const code = o.referrer.toLowerCase()
      if (!map.has(code)) {
        map.set(code, {
          code,
          name: `@${code}`,
          phone: '—',
          station: o.delivery.campusOrVenue,
          allocatedStock: 30,
          manualSoldCount: 0,
          updatedAt: o.createdAt,
        })
      }
    }
  }

  for (const l of leads) {
    if (l.referrer) {
      const code = l.referrer.toLowerCase()
      if (!map.has(code)) {
        map.set(code, {
          code,
          name: `@${code}`,
          phone: '—',
          station: l.locationOrCampus,
          allocatedStock: 30,
          manualSoldCount: 0,
          updatedAt: l.createdAt,
        })
      }
    }
  }

  const rows: SellerPerformanceRow[] = []

  for (const seller of map.values()) {
    const code = seller.code.toLowerCase()
    const sellerOrders = orders.filter(
      (o) => (o.referrer ?? '').toLowerCase() === code,
    )
    const sellerLeads = leads.filter(
      (l) => (l.referrer ?? '').toLowerCase() === code,
    )

    const ordersCount = sellerOrders.length
    const onlineItemsSold = sellerOrders.reduce(
      (sum, o) => sum + o.items.reduce((q, item) => q + item.quantity, 0),
      0,
    )
    const itemsSoldCount = onlineItemsSold + seller.manualSoldCount
    const totalSalesKsh = sellerOrders.reduce(
      (sum, o) => sum + o.summary.total,
      0,
    )
    const leadsCount = sellerLeads.length
    const remainingStock = Math.max(0, seller.allocatedStock - itemsSoldCount)

    // Points formula: 10 pts per order + 1 pt per KSh 100 sold + 15 pts per lead + 5 pts per manual bouquet sold
    const points =
      ordersCount * 10 +
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
      itemsSoldCount,
      remainingStock,
      totalSalesKsh,
      leadsCount,
      points,
    })
  }

  return rows.sort((a, b) => b.points - a.points)
}
