export interface CartItemAddOn {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: string
  flowerId: string
  name: string
  whatsInIt?: string
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
  qrMessageId?: string
  addOns: CartItemAddOn[]
  totalPrice: number
}

export interface CartSummary {
  subtotal: number
  total: number
}

export interface QuickOrderOptions {
  flowerId?: string
  venue?: string
  date?: string
  schoolColor?: string
}
