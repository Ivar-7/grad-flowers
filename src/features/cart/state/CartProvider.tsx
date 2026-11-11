import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type {
  CartItem,
  CartSummary,
  QuickOrderOptions,
} from '../types/cart.types'
import { CartItemListSchema } from '../types/cart.schema'
import { CartContext, type CartContextValue } from './cart.context'

const CART_STORAGE_KEY = 'grad_flowers_cart_v2'

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
  const [quickOrder, setQuickOrder] = useState<
    { isOpen: boolean } & QuickOrderOptions
  >({
    isOpen: false,
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota errors
    }
  }, [items])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const openQuickOrder = useCallback((options?: QuickOrderOptions) => {
    setIsDrawerOpen(false)
    setQuickOrder({
      isOpen: true,
      flowerId: options?.flowerId,
      venue: options?.venue,
      date: options?.date,
      schoolColor: options?.schoolColor,
    })
  }, [])

  const closeQuickOrder = useCallback(() => {
    setQuickOrder((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'id' | 'totalPrice'>) => {
      const addOnsTotal = newItem.addOns.reduce(
        (sum, addOn) => sum + addOn.price,
        0,
      )
      const singleItemPrice = newItem.unitPrice + addOnsTotal
      const totalPrice = singleItemPrice * newItem.quantity

      const id = `${newItem.flowerId}-${newItem.ribbonColor}-${Date.now()}`

      const fullItem: CartItem = {
        ...newItem,
        id,
        totalPrice,
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (p) =>
            p.flowerId === newItem.flowerId &&
            p.ribbonColor === newItem.ribbonColor &&
            (p.ribbonCustomText ?? '') === (newItem.ribbonCustomText ?? '') &&
            (p.cardMessage ?? '') === (newItem.cardMessage ?? '') &&
            (p.qrMessageId ?? '') === (newItem.qrMessageId ?? '') &&
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
  }, [])

  const summary: CartSummary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    return {
      subtotal,
      total: subtotal,
    }
  }, [items])

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
    summary,
    quickOrder,
    openQuickOrder,
    closeQuickOrder,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
