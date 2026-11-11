import { z } from 'zod'

export const CartItemAddOnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
})

export const CartItemSchema = z.object({
  id: z.string().min(1),
  flowerId: z.string().min(1),
  name: z.string().min(1),
  whatsInIt: z.string().optional(),
  imageUrl: z.string().url(),
  category: z.string().min(1),
  basePrice: z.number().positive(),
  tier: z.enum(['standard', 'deluxe', 'grand']),
  tierLabel: z.string().min(1),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive().max(100),
  ribbonColor: z.string().min(1),
  ribbonCustomText: z.string().max(40, 'Ribbon text max 40 chars').optional(),
  cardMessage: z.string().max(250, 'Card message max 250 chars').optional(),
  qrMessageId: z.string().optional(),
  addOns: z.array(CartItemAddOnSchema).default([]),
  totalPrice: z.number().positive(),
})

export const CartItemListSchema = z.array(CartItemSchema)
