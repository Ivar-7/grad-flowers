import { z } from 'zod'
import { normalizeKenyanPhone } from '@/features/checkout/types/checkout.schema'
import { SITE_CONFIG } from '@/shared/config/site.config'

export const UpsertSellerSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_-]{2,32}$/,
      'Referral code must be 2–32 lowercase letters, numbers, or hyphens (e.g. petti)',
    ),
  name: z.string().trim().min(2, 'Agent or seller name is required').max(80),
  phone: z
    .string()
    .trim()
    .transform(normalizeKenyanPhone)
    .refine(
      (v) => /^(07|01)\d{8}$/.test(v),
      'Enter a valid Kenyan phone number (07... or 01...)',
    ),
  station: z.string().trim().min(2, 'Campus or area is required').max(100),
  allocatedStock: z.number().int().nonnegative('Stock cannot be negative'),
  manualSoldCount: z.number().int().nonnegative().default(0),
  commissionPerOrderKsh: z
    .number()
    .nonnegative('Commission cannot be negative')
    .default(SITE_CONFIG.referralCommissionPerOrderKsh),
  available: z.boolean().default(true),
})

export type UpsertSellerInput = z.input<typeof UpsertSellerSchema>
