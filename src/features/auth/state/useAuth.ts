import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './auth.context'
import { AppError } from '@/shared/errors/app-error'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new AppError({
      code: 'AUTH_CONTEXT_MISSING',
      userMessage: 'Authentication services are unavailable.',
      technicalMessage: 'useAuth must be used within an AuthProvider',
      statusCode: 500,
      severity: 'fatal',
    })
  }
  return context
}
