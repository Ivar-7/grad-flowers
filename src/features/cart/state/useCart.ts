import { useContext } from 'react'
import { CartContext, type CartContextValue } from './cart.context'
import { AppError } from '@/shared/errors/app-error'

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new AppError({
      code: 'CART_CONTEXT_MISSING',
      userMessage: 'Shopping cart is temporarily unavailable.',
      technicalMessage: 'useCart must be used within a CartProvider',
      statusCode: 500,
      severity: 'fatal',
    })
  }
  return context
}
