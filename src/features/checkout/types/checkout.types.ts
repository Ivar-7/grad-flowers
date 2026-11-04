import type { CartItem, CartSummary } from '@/features/cart/types/cart.types'

export type CeremonyTimeSlot =
  | 'morning-ceremony' // 7:30 AM - 9:30 AM
  | 'midday-ceremony' // 11:30 AM - 1:30 PM
  | 'afternoon-ceremony' // 3:00 PM - 5:00 PM
  | 'evening-banquet' // 6:00 PM - 8:00 PM

export interface DeliveryDetails {
  recipientName: string
  recipientPhone: string
  campusOrVenue: string
  venueAddress: string
  deliveryDate: string
  ceremonyTimeSlot: CeremonyTimeSlot
  specialInstructions?: string
}

export type PaymentMethodType = 'card' | 'apple-pay' | 'cash-on-pickup'

export interface PaymentDetails {
  method: PaymentMethodType
  cardNumber?: string
  cardExp?: string
  cardCvc?: string
  billingZip?: string
}

export type OrderStatus =
  | 'confirmed'
  | 'florist-arranging'
  | 'ribbon-embossed'
  | 'out-for-delivery'
  | 'delivered'

export interface Order {
  id: string
  userId: string | null
  userEmail: string
  items: CartItem[]
  summary: CartSummary
  delivery: DeliveryDetails
  paymentMethod: PaymentMethodType
  status: OrderStatus
  createdAt: string
  estimatedDeliveryWindow: string
}
