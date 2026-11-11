import { createContext } from 'react'
import type {
  CartItem,
  CartSummary,
  QuickOrderOptions,
} from '../types/cart.types'

export interface CartContextValue {
  items: CartItem[]
  itemCount: number
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  summary: CartSummary
  quickOrder: { isOpen: boolean } & QuickOrderOptions
  openQuickOrder: (options?: QuickOrderOptions) => void
  closeQuickOrder: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
