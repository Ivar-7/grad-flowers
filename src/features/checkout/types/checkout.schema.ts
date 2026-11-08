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

export function normalizeKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('254')) return `0${digits.slice(3)}`
  if (digits.length === 9) return `0${digits}`
  return digits
}

export const PaymentDetailsSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .transform(normalizeKenyanPhone)
    .refine(
      (value) => /^(07|01)\d{8}$/.test(value),
      'Enter a valid M-Pesa number, e.g. 0712345678',
    ),
})

export const PaymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'cancelled',
])

export const StartPaymentResponseSchema = z.object({
  paymentId: z.string().min(1),
})
