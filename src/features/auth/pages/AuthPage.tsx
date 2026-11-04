import { useSearchParams } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import type { AuthMode } from '../types/auth.types'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const rawMode = searchParams.get('mode')
  const initialMode: AuthMode =
    rawMode === 'signup' || rawMode === 'forgot-password' ? rawMode : 'signin'

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-16 px-4 bg-gradient-to-b from-transparent via-neutral-50/50 to-transparent dark:via-neutral-900/20">
      <div className="w-full max-w-md">
        <AuthForm initialMode={initialMode} />
      </div>
    </div>
  )
}

export default AuthPage
