import { z } from 'zod'

export const QrMediaTypeSchema = z.enum(['audio', 'video', 'note'])

export const QrMessageDocSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().optional(),
  recipientName: z.string().min(1, 'Graduate name is required').max(80),
  senderName: z.string().min(1, 'Your name is required').max(80),
  writtenNote: z.string().max(400).default('Hongera Sana on your graduation!'),
  mediaType: QrMediaTypeSchema.default('note'),
  mediaUrl: z.string().nullable().default(null),
  bouquetName: z.string().optional(),
  createdAt: z.string(),
})

export const CreateQrMessageSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(1, 'Please enter the graduate’s name')
    .max(80),
  senderName: z.string().trim().min(1, 'Please enter your name (from)').max(80),
  writtenNote: z
    .string()
    .trim()
    .max(400, 'Note must be under 400 characters')
    .default('Hongera Sana on your graduation!'),
  mediaType: QrMediaTypeSchema,
  bouquetName: z.string().optional(),
  orderId: z.string().optional(),
})
