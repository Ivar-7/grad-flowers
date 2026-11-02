import { z } from 'zod'

export const FlowerCategorySchema = z.enum([
  'all',
  'bestsellers',
  'roses',
  'sunflowers',
  'orchids',
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
  flowerCount: z.number().int().positive().default(12),
})

export const FlowersListSchema = z.array(FlowerSchema)

