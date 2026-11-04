import { z } from 'zod'

export const AuthCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
})

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>

export const SignUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpInput = z.infer<typeof SignUpSchema>

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
