import type { CartItem, CartSummary } from '@/features/cart/types/cart.types'

export type CeremonyTimeSlot =
  | 'morning-ceremony' // 7:00 AM - 9:30 AM
  | 'midday-ceremony' // 10:00 AM - 1:00 PM
  | 'afternoon-ceremony' // 1:30 PM - 4:30 PM
  | 'evening-banquet' // 5:00 PM - 7:30 PM

export interface DeliveryDetails {
  recipientName: string
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

export interface Order {
  id: string
  userId: string | null
  userEmail: string
  referrer?: string | null
  qrMessageId?: string
  items: CartItem[]
  summary: CartSummary
  delivery: DeliveryDetails
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
    id: 'uon-main',
    campus: 'University of Nairobi (UoN)',
    stationName: 'Main Gate / Great Court Station (University Way)',
    nextGraduationDate: '2026-12-11',
    schoolColors: 'Royal Blue & Gold',
  },
  {
    id: 'ku-main',
    campus: 'Kenyatta University (KU)',
    stationName: 'Main Gate / Amphitheatre Station (Thika Superhighway)',
    nextGraduationDate: '2026-12-18',
    schoolColors: 'Navy Blue & Gold',
  },
  {
    id: 'jkuat-juja',
    campus: 'JKUAT (Juja Main Campus)',
    stationName: 'Gate A / Graduation Square Tent',
    nextGraduationDate: '2026-11-27',
    schoolColors: 'Emerald Green & Gold',
  },
  {
    id: 'strathmore',
    campus: 'Strathmore University',
    stationName: 'Madaraka Estate — Ole Sangale Gate Station',
    nextGraduationDate: '2026-11-20',
    schoolColors: 'Crimson Red & Royal Blue',
  },
  {
    id: 'usiu-africa',
    campus: 'USIU-Africa',
    stationName: 'Roysambu — Gate A Pickup Station',
    nextGraduationDate: '2026-11-28',
    schoolColors: 'Gold & Royal Blue',
  },
  {
    id: 'mku-thika',
    campus: 'Mount Kenya University (MKU)',
    stationName: 'Thika Happy Valley Grounds Station',
    nextGraduationDate: '2026-12-04',
    schoolColors: 'Royal Blue & White',
  },
  {
    id: 'daystar',
    campus: 'Daystar University',
    stationName: 'Athi River Main Gate / Valley Road Station',
    nextGraduationDate: '2026-11-21',
    schoolColors: 'Sky Blue & White',
  },
  {
    id: 'tuk-kca',
    campus: 'TUK / KCA University',
    stationName: 'CBD Haile Selassie / Thika Road Ruaraka Station',
    nextGraduationDate: '2026-12-10',
    schoolColors: 'Emerald Green & Navy',
  },
]
