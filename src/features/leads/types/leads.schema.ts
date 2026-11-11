import { z } from 'zod'
import { normalizeKenyanPhone } from '@/features/checkout/types/checkout.schema'

export const LeadTypeSchema = z.enum([
  'weekly-supply',
  'stockist',
  'photo-booking',
])

export const LeadStatusSchema = z.enum(['new', 'contacted', 'converted'])

export const CreateLeadSchema = z.object({
  type: LeadTypeSchema,
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name or business name')
    .max(80),
  phone: z
    .string()
    .trim()
    .transform(normalizeKenyanPhone)
    .refine(
      (val) => /^(07|01)\d{8}$/.test(val),
      'Enter a valid Kenyan phone number, e.g. 0712345678',
    ),
  locationOrCampus: z
    .string()
    .trim()
    .min(2, 'Please enter your town, estate, or university campus')
    .max(120),
  details: z
    .string()
    .trim()
    .min(3, 'Please share a few details about what you need')
    .max(300),
  preferredDateOrSchedule: z.string().trim().max(100).optional(),
  referrer: z.string().nullable().default(null),
})
