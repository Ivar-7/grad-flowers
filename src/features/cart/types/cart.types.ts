export interface CartItemAddOn {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: string
  flowerId: string
  name: string
  imageUrl: string
  category: string
  basePrice: number
  tier: 'standard' | 'deluxe' | 'grand'
  tierLabel: string
  unitPrice: number
  quantity: number
  ribbonColor: string
  ribbonCustomText?: string
  cardMessage?: string
  addOns: CartItemAddOn[]
  totalPrice: number
}

export interface PromoCode {
  code: string
  discountPercentage: number
  freeDelivery?: boolean
  description: string
}

export interface CartSummary {
  subtotal: number
  discountAmount: number
  deliveryFee: number
  estimatedTax: number
  total: number
}
