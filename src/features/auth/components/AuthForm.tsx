import { useState, type FormEvent } from 'react'
import { LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../state/useAuth'
import type { AuthMode } from '../types/auth.types'
import { AuthCredentialsSchema, SignUpSchema } from '../types/auth.schema'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

export function AuthForm() {
  const { user, login, register, logout } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        const validated = SignUpSchema.parse({ email, password, displayName })
        await register(validated)
        setSuccessMessage('Welcome! Your graduate account has been created.')
      } else {
        const validated = AuthCredentialsSchema.parse({ email, password })
        await login(validated)
        setSuccessMessage('Welcome back! You are now signed in.')
      }
    } catch (err) {
      const normalized = normalizeError(err)
      setErrorMessage(normalized.userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If already authenticated, show user profile overview & sign-out
  if (user) {
    return (
      <Card className="max-w-md w-full mx-auto p-8 text-center border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
          <CheckCircle className="h-7 w-7" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
          Graduation Account Active
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Signed in as{' '}
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
            {user.email}
          </span>
        </p>

        <Button variant="outline" onClick={logout} className="w-full">
          Sign Out
        </Button>
      </Card>
    )
  }

  return (
    <Card className="max-w-md w-full mx-auto p-8 border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {mode === 'signin'
            ? 'Sign In to Your Account'
            : 'Create Graduate Account'}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {mode === 'signin'
            ? 'Manage your commencement bouquet reservations'
            : 'Track ceremonies, custom ribbons, and delivery updates'}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label
              htmlFor="auth-name"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Full Name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Email Address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="graduate@university.edu"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
          leftIcon={
            mode === 'signin' ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )
          }
        >
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        {mode === 'signin' ? (
          <p>
            Do not have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMessage(null)
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMessage(null)
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </Card>
  )
}
