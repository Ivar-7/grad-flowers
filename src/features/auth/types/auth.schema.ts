import { z } from 'zod'

export const AuthCredentialsSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
})

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>

export const SignUpSchema = AuthCredentialsSchema.extend({
  displayName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Name is too long'),
})

export type SignUpInput = z.infer<typeof SignUpSchema>

