import { ZodError } from 'zod'
import { AppError } from './app-error'

const FIREBASE_AUTH_ERROR_MAP: Record<string, string> = {
  'auth/invalid-email': 'Please provide a valid email address.',
  'auth/user-disabled':
    'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password':
    'Password is too weak. Please choose at least 6 characters.',
  'auth/operation-not-allowed': 'Sign-in provider is not enabled.',
  'auth/too-many-requests':
    'Too many unsuccessful attempts. Please try again later.',
  'auth/network-request-failed':
    'Network connection issue. Please check your internet.',
  'auth/popup-closed-by-user': 'Sign-in cancelled before completing.',
}

const FIRESTORE_ERROR_MAP: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested item was not found.',
  'already-exists': 'This item already exists.',
  'resource-exhausted': 'Resource limit exceeded. Please try again shortly.',
  cancelled: 'The operation was cancelled.',
  'deadline-exceeded': 'The request timed out. Please try again.',
  unavailable:
    'Service is temporarily unavailable. Please try again in a moment.',
  unauthenticated: 'Please sign in to continue.',
}

export function normalizeError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.',
): AppError {
  if (error instanceof AppError) {
    return error
  }

  // Zod Validation Error
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0]
    const userMessage = firstIssue
      ? `${firstIssue.path.join('.') || 'Field'}: ${firstIssue.message}`
      : 'Validation failed on input.'

    return new AppError({
      code: 'VALIDATION_ERROR',
      userMessage,
      technicalMessage: error.message,
      statusCode: 422,
      severity: 'warning',
      cause: error,
    })
  }

  // Firebase Error (duck typing code and message)
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const fbError = error as { code: unknown; message?: unknown }
    const code =
      typeof fbError.code === 'string' ? fbError.code : 'FIREBASE_ERROR'
    const techMsg =
      typeof fbError.message === 'string' ? fbError.message : String(error)

    if (code.startsWith('auth/')) {
      const userMessage =
        FIREBASE_AUTH_ERROR_MAP[code] ??
        'Authentication failed. Please try again.'
      return new AppError({
        code,
        userMessage,
        technicalMessage: techMsg,
        statusCode: 401,
        severity: 'warning',
        cause: error,
      })
    }

    if (code in FIRESTORE_ERROR_MAP) {
      return new AppError({
        code: `FIRESTORE_${code.toUpperCase().replace(/-/g, '_')}`,
        userMessage: FIRESTORE_ERROR_MAP[code],
        technicalMessage: techMsg,
        statusCode:
          code === 'permission-denied' ? 403 : code === 'not-found' ? 404 : 500,
        severity: 'error',
        cause: error,
      })
    }

    return new AppError({
      code,
      userMessage: fallbackMessage,
      technicalMessage: techMsg,
      statusCode: 500,
      severity: 'error',
      cause: error,
    })
  }

  // Standard JS Error
  if (error instanceof Error) {
    // Detect fetch / network errors
    if (
      error.name === 'TypeError' &&
      error.message.toLowerCase().includes('fetch')
    ) {
      return new AppError({
        code: 'NETWORK_ERROR',
        userMessage: 'Network error. Please check your internet connection.',
        technicalMessage: error.message,
        statusCode: 503,
        severity: 'warning',
        cause: error,
      })
    }

    return new AppError({
      code: error.name.toUpperCase().replace(/\s+/g, '_'),
      userMessage: fallbackMessage,
      technicalMessage: error.message,
      statusCode: 500,
      severity: 'error',
      cause: error,
    })
  }

  // Fallback for unknown primitive
  return new AppError({
    code: 'UNKNOWN_ERROR',
    userMessage: fallbackMessage,
    technicalMessage: String(error),
    statusCode: 500,
    severity: 'error',
    cause: error,
  })
}
