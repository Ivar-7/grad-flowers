import { z } from 'zod'

export const FlowerCategorySchema = z.enum([
  'all',
  'bestsellers',
  'single',
  'mini',
  'classic',
  'candy',
  'premium',
])

export const FlowerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  whatsInIt: z.string().min(1, 'Contents summary is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  category: FlowerCategorySchema,
  imageUrl: z.string().url('Must be a valid image URL'),
  isFeatured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  ribbonColors: z.array(z.string()).default([]),
  schoolColorTags: z.array(z.string()).default([]),
  flowerCount: z.number().int().positive().default(1),
  includesQrCard: z.boolean().default(false),
  hasCandy: z.boolean().default(false),
  candyUpgradeTargetId: z.string().optional(),
  candyUpgradeLabel: z.string().optional(),
  candyUpgradePriceDiff: z.number().nonnegative().optional(),
  candyBaseId: z.string().optional(),
  meaning: z.string().default('Hongera! Celebrating your graduation milestone'),
})

export const FlowersListSchema = z.array(FlowerSchema)
