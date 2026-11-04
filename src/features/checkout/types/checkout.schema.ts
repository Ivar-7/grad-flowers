import { z } from 'zod'

export const CeremonyTimeSlotSchema = z.enum([
  'morning-ceremony',
  'midday-ceremony',
  'afternoon-ceremony',
  'evening-banquet',
])

export const DeliveryDetailsSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, 'Graduate name must be at least 2 characters')
    .max(80, 'Name is too long'),
  recipientPhone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number for venue handoff')
    .max(20, 'Phone number is too long'),
  campusOrVenue: z
    .string()
    .trim()
    .min(2, 'Please specify the university, college, or school name')
    .max(100, 'Campus name is too long'),
  venueAddress: z
    .string()
    .trim()
    .min(5, 'Please provide the auditorium, gate, or hall delivery address')
    .max(150, 'Address is too long'),
  deliveryDate: z
    .string()
    .min(1, 'Please select your ceremony or celebration date'),
  ceremonyTimeSlot: CeremonyTimeSlotSchema,
  specialInstructions: z
    .string()
    .max(200, 'Special instructions cannot exceed 200 characters')
    .optional(),
})

export const PaymentMethodTypeSchema = z.enum([
  'card',
  'apple-pay',
  'cash-on-pickup',
])

export const PaymentDetailsSchema = z
  .object({
    method: PaymentMethodTypeSchema,
    cardNumber: z.string().optional(),
    cardExp: z.string().optional(),
    cardCvc: z.string().optional(),
    billingZip: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'card') {
      const cleanCard = (data.cardNumber ?? '').replace(/\s+/g, '')
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid card number',
          path: ['cardNumber'],
        })
      }
      if (!data.cardExp || !data.cardExp.includes('/')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Format MM/YY required',
          path: ['cardExp'],
        })
      }
      if (!data.cardCvc || data.cardCvc.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter 3 or 4 digit CVC',
          path: ['cardCvc'],
        })
      }
      if (!data.billingZip || data.billingZip.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter billing zip/postal code',
          path: ['billingZip'],
        })
      }
    }
  })
