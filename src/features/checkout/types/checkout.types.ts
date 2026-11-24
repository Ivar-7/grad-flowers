import type { CartItem, CartSummary } from '@/features/cart/types/cart.types'

export type FulfillmentType = 'event-pickup' | 'address-delivery'

export type CeremonyTimeSlot =
  | 'morning-ceremony' // 7:00 AM - 9:30 AM
  | 'midday-ceremony' // 10:00 AM - 1:00 PM
  | 'afternoon-ceremony' // 1:30 PM - 4:30 PM
  | 'evening-banquet' // 5:00 PM - 7:30 PM

export interface DeliveryDetails {
  fulfillmentType: FulfillmentType
  recipientName: string
  graduandName?: string
  recipientEmail: string
  recipientPhone: string
  campusOrVenue: string
  venueAddress: string
  deliveryDate: string
  ceremonyTimeSlot: CeremonyTimeSlot
  specialInstructions?: string
}

export interface PaymentDetails {
  phoneNumber: string
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export type OrderStatus =
  | 'pending-payment'
  | 'confirmed'
  | 'florist-arranging'
  | 'ribbon-embossed'
  | 'out-for-delivery'
  | 'delivered'

export type FulfillmentRoute =
  'vendor-connected' | 'same-day-delivery' | 'scheduled-2-4-days'

export interface FulfillmentAssignment {
  route: FulfillmentRoute
  assignedVendorCode?: string
  assignedVendorName?: string
  assignedVendorStation?: string
  estimatedDeliveryFeeKsh?: number
  estimatedTimeline: string
}

export interface Order {
  id: string
  userId: string | null
  userEmail: string
  referrer?: string | null
  qrMessageId?: string
  items: CartItem[]
  summary: CartSummary
  delivery: DeliveryDetails
  fulfillment?: FulfillmentAssignment
  paymentMethod: 'mpesa'
  paymentId?: string
  status: OrderStatus
  createdAt: string
  estimatedDeliveryWindow: string
}

export interface PickupStationPreset {
  id: string
  campus: string
  stationName: string
  nextGraduationDate: string
  schoolColors: string
}

export const KENYAN_PICKUP_STATIONS: PickupStationPreset[] = [
  {
    id: 'tuk',
    campus: 'Technical University of Kenya (TUK)',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-11-24',
    schoolColors: 'Emerald Green & Gold',
  },
  {
    id: 'kise',
    campus: 'Kenya Institute of Special Education (KISE)',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-11-25',
    schoolColors: 'Royal Blue & White',
  },
  {
    id: 'kca',
    campus: 'KCA University',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-11-27',
    schoolColors: 'Navy Blue & Gold',
  },
  {
    id: 'jkuat-juja',
    campus: 'JKUAT (Juja)',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-11-27',
    schoolColors: 'Emerald Green & Gold',
  },
  {
    id: 'usiu-africa',
    campus: 'USIU-Africa',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-11-28',
    schoolColors: 'Gold & Royal Blue',
  },
  {
    id: 'mku-thika',
    campus: 'Mount Kenya University (MKU)',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-12-04',
    schoolColors: 'Royal Blue & White',
  },
  {
    id: 'uon-main',
    campus: 'University of Nairobi (UoN)',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-12-11',
    schoolColors: 'Royal Blue & Gold',
  },
  {
    id: 'ku-main',
    campus: 'Kenyatta University (KU)',
    stationName: 'Graduation Event Pickup (exact spot shared via WhatsApp)',
    nextGraduationDate: '2026-12-18',
    schoolColors: 'Navy Blue & Gold',
  },
]
