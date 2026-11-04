import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { CartItem, CartSummary, PromoCode } from '../types/cart.types'
import { CartItemListSchema } from '../types/cart.schema'
import { CartContext, type CartContextValue } from './cart.context'

const CART_STORAGE_KEY = 'grad_flowers_cart_v1'

const VALID_PROMO_CODES: Record<string, PromoCode> = {
  GRAD2026: {
    code: 'GRAD2026',
    discountPercentage: 15,
    description: '15% Off Graduation Commencement Special',
  },
  CAMPUS: {
    code: 'CAMPUS',
    discountPercentage: 0,
    freeDelivery: true,
    description: 'Free Direct Campus Ceremony Delivery',
  },
  HONORS10: {
    code: 'HONORS10',
    discountPercentage: 10,
    description: '10% Honor Society & Alumni Discount',
  },
}

export interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (!stored) return []
      const parsed = JSON.parse(stored)
      const validated = CartItemListSchema.safeParse(parsed)
      return validated.success ? validated.data : []
    } catch {
      return []
    }
  })

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)

  // Persist items to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota errors
    }
  }, [items])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'id' | 'totalPrice'>) => {
      const addOnsTotal = newItem.addOns.reduce(
        (sum, addOn) => sum + addOn.price,
        0,
      )
      const singleItemPrice = newItem.unitPrice + addOnsTotal
      const totalPrice = singleItemPrice * newItem.quantity

      const id = `${newItem.flowerId}-${newItem.tier}-${newItem.ribbonColor}-${Date.now()}`

      const fullItem: CartItem = {
        ...newItem,
        id,
        totalPrice,
      }

      setItems((prev) => {
        // If exact same config exists, increment quantity
        const existingIndex = prev.findIndex(
          (p) =>
            p.flowerId === newItem.flowerId &&
            p.tier === newItem.tier &&
            p.ribbonColor === newItem.ribbonColor &&
            (p.ribbonCustomText ?? '') === (newItem.ribbonCustomText ?? '') &&
            (p.cardMessage ?? '') === (newItem.cardMessage ?? '') &&
            p.addOns.length === newItem.addOns.length &&
            p.addOns.every(
              (addOn, index) => addOn.id === newItem.addOns[index]?.id,
            ),
        )

        if (existingIndex > -1) {
          const updated = [...prev]
          const existing = updated[existingIndex]
          if (existing) {
            const nextQty = existing.quantity + newItem.quantity
            const nextTotalPrice = singleItemPrice * nextQty
            updated[existingIndex] = {
              ...existing,
              quantity: nextQty,
              totalPrice: nextTotalPrice,
            }
          }
          return updated
        }

        return [...prev, fullItem]
      })

      // Open drawer on add for immediate visual feedback
      setIsDrawerOpen(true)
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const addOnsTotal = item.addOns.reduce((s, a) => s + a.price, 0)
          const singlePrice = item.unitPrice + addOnsTotal
          return {
            ...item,
            quantity,
            totalPrice: singlePrice * quantity,
          }
        }
        return item
      }),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setAppliedPromo(null)
  }, [])

  const applyPromoCode = useCallback((code: string): boolean => {
    const normalized = code.trim().toUpperCase()
    if (normalized in VALID_PROMO_CODES) {
      setAppliedPromo(VALID_PROMO_CODES[normalized] ?? null)
      return true
    }
    return false
  }, [])

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null)
  }, [])

  // Calculate totals and summary
  const summary: CartSummary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    let discountAmount = 0

    if (appliedPromo && appliedPromo.discountPercentage > 0) {
      discountAmount = (subtotal * appliedPromo.discountPercentage) / 100
    }

    // Free delivery over $75 or with promo code
    const baseDelivery = subtotal > 75 || appliedPromo?.freeDelivery ? 0 : 9.99
    const deliveryFee = items.length === 0 ? 0 : baseDelivery

    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const estimatedTax = items.length === 0 ? 0 : taxableAmount * 0.08

    const total = Math.max(
      0,
      subtotal - discountAmount + deliveryFee + estimatedTax,
    )

    return {
      subtotal,
      discountAmount,
      deliveryFee,
      estimatedTax,
      total,
    }
  }, [items, appliedPromo])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const value: CartContextValue = {
    items,
    itemCount,
    isDrawerOpen,
    setIsDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    summary,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
