import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../state/useAuth'
import type { AuthMode } from '../types/auth.types'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { UserProfileCard } from './UserProfileCard'
import { Card } from '@/shared/ui/Card'
import { LoadingState } from '@/shared/ui/LoadingState'

export interface AuthFormProps {
  initialMode?: AuthMode
  onSuccess?: () => void
}

export function AuthForm({ initialMode = 'signin', onSuccess }: AuthFormProps) {
  const { user, isLoading } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)

  if (isLoading) {
    return <LoadingState message="Verifying session..." />
  }

  if (user) {
    return <UserProfileCard />
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 sm:p-8 border-neutral-200 dark:border-neutral-800 shadow-md">
      {/* Brand Icon Banner */}
      <div className="flex justify-center mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'signin' && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
          >
            <LoginForm
              onSwitchToSignUp={() => setMode('signup')}
              onSwitchToForgotPassword={() => setMode('forgot-password')}
              onSuccess={onSuccess}
            />
          </motion.div>
        )}

        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            <SignUpForm
              onSwitchToSignIn={() => setMode('signin')}
              onSuccess={onSuccess}
            />
          </motion.div>
        )}

        {mode === 'forgot-password' && (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            <ForgotPasswordForm onBackToSignIn={() => setMode('signin')} />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
