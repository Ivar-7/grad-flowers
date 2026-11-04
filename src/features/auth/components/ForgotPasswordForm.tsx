import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../state/useAuth'
import { ForgotPasswordSchema } from '../types/auth.schema'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { Button } from '@/shared/ui/Button'

export interface ForgotPasswordFormProps {
  onBackToSignIn: () => void
}

export function ForgotPasswordForm({
  onBackToSignIn,
}: ForgotPasswordFormProps) {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const validated = ForgotPasswordSchema.parse({ email })
      await sendPasswordReset(validated)
      setIsSuccess(true)
    } catch (err) {
      const normalized = normalizeError(err)
      setErrorMessage(normalized.userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4"
        >
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </motion.div>

        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
          Reset Link Sent
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto mb-6">
          We have sent a secure password reset link to{' '}
          <span className="font-semibold text-neutral-900 dark:text-white">
            {email}
          </span>
          . Please check your inbox (and spam folder) to choose a new password.
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            size="md"
            onClick={onBackToSignIn}
            className="w-full"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Return to Sign In
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false)
              setErrorMessage(null)
            }}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:underline cursor-pointer"
          >
            Did not receive the email? Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onBackToSignIn}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to sign in</span>
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Reset Your Password
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Enter your registered email address and we will send you a reset link
        </p>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="reset-email"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="graduate@university.edu"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
          leftIcon={<Send className="h-4 w-4" />}
        >
          Send Reset Instructions
        </Button>
      </form>
    </div>
  )
}
