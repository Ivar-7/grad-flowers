import { z } from 'zod'

export const CeremonyTimeSlotSchema = z.enum([
  'morning-ceremony',
  'midday-ceremony',
  'afternoon-ceremony',
  'evening-banquet',
])

export function normalizeKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('254') && digits.length === 12) {
    return `0${digits.slice(3)}`
  }
  if (
    digits.length === 9 &&
    (digits.startsWith('7') || digits.startsWith('1'))
  ) {
    return `0${digits}`
  }
  return digits
}

export const DeliveryDetailsSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, 'Graduate or buyer name must be at least 2 characters')
    .max(80, 'Name is too long'),
  recipientEmail: z
    .string()
    .trim()
    .email('Enter a valid email address, e.g. wanjiku@example.com'),
  recipientPhone: z
    .string()
    .trim()
    .transform(normalizeKenyanPhone)
    .refine(
      (val) => /^(07|01)\d{8}$/.test(val),
      'Enter a valid Kenyan phone number, e.g. 0712345678',
    ),
  campusOrVenue: z
    .string()
    .trim()
    .min(2, 'Please specify the university or campus')
    .max(100, 'Campus name is too long'),
  venueAddress: z
    .string()
    .trim()
    .min(3, 'Please select or enter the pickup station or gate')
    .max(150, 'Station name is too long'),
  deliveryDate: z
    .string()
    .min(1, 'Please select your graduation or collection date'),
  ceremonyTimeSlot: CeremonyTimeSlotSchema,
  specialInstructions: z
    .string()
    .max(200, 'Notes cannot exceed 200 characters')
    .optional(),
})

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
