import { AppError } from './app-error'

export interface DiagnosticContext {
  feature?: string
  action?: string
  metadata?: Record<string, unknown>
}

export function logError(error: AppError, context?: DiagnosticContext): void {
  const payload = {
    timestamp: new Date().toISOString(),
    name: error.name,
    code: error.code,
    severity: error.severity,
    userMessage: error.userMessage,
    technicalMessage: error.technicalMessage,
    statusCode: error.statusCode,
    context,
    cause: error.cause instanceof Error ? error.cause.message : error.cause,
  }

  if (import.meta.env.DEV) {
    console.error(
      `[DiagnosticLog:${error.severity.toUpperCase()}] ${error.code}:`,
      payload,
    )
  } else if (error.severity === 'fatal' || error.severity === 'error') {
    // In production, integrate with remote monitoring service (e.g. Firebase Crashlytics / Sentry)
    console.error(`[DiagnosticLog] ${error.code}: ${error.technicalMessage}`)
  }
}
