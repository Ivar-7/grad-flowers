import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../state/useAuth'
import { AuthCredentialsSchema } from '../types/auth.schema'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { Button } from '@/shared/ui/Button'

export interface LoginFormProps {
  onSwitchToSignUp: () => void
  onSwitchToForgotPassword: () => void
  onSuccess?: () => void
}

export function LoginForm({
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onSuccess,
}: LoginFormProps) {
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const validated = AuthCredentialsSchema.parse({ email, password })
      await login(validated)
      onSuccess?.()
    } catch (err) {
      const normalized = normalizeError(err)
      setErrorMessage(normalized.userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setIsGoogleSubmitting(true)

    try {
      await loginWithGoogle()
      onSuccess?.()
    } catch (err) {
      const normalized = normalizeError(err)
      setErrorMessage(normalized.userMessage)
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Sign in to manage your commencement bouquets & ceremony orders
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

      {/* Google OAuth Provider */}
      <button
        type="button"
        disabled={isSubmitting || isGoogleSubmitting}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer shadow-xs mb-5"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {isGoogleSubmitting
            ? 'Signing in with Google...'
            : 'Continue with Google'}
        </span>
      </button>

      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
        <span className="bg-white dark:bg-neutral-900 px-3 text-xs uppercase tracking-wider text-neutral-400 font-medium">
          or with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="login-email"
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={isGoogleSubmitting}
          className="w-full mt-2"
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <span>Do not have an account yet? </span>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          Create graduate account
        </button>
      </div>
    </div>
  )
}
