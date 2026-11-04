import { z } from 'zod'

export const FlowerCategorySchema = z.enum([
  'all',
  'bestsellers',
  'sunflowers',
  'roses',
  'orchids',
  'leis',
  'boutonnieres',
  'mixed',
])

export const FlowerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  category: FlowerCategorySchema,
  imageUrl: z.string().url('Must be a valid image URL'),
  isFeatured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  ribbonColors: z.array(z.string()).default([]),
  schoolColorTags: z.array(z.string()).default([]),
  flowerCount: z.number().int().positive().default(12),
  rating: z.number().min(0).max(5).default(4.9),
  reviewCount: z.number().int().nonnegative().default(24),
  meaning: z.string().default('Celebration of Academic Achievement'),
})

export const FlowersListSchema = z.array(FlowerSchema)
