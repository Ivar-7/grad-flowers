export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal'

export interface AppErrorOptions {
  code: string
  userMessage: string
  technicalMessage?: string
  statusCode?: number
  severity?: ErrorSeverity
  cause?: unknown
}

export class AppError extends Error {
  readonly code: string
  readonly userMessage: string
  readonly technicalMessage: string
  readonly statusCode: number
  readonly severity: ErrorSeverity
  override readonly cause?: unknown

  constructor(options: AppErrorOptions) {
    super(options.userMessage)
    this.name = 'AppError'
    this.code = options.code
    this.userMessage = options.userMessage
    this.technicalMessage = options.technicalMessage ?? options.userMessage
    this.statusCode = options.statusCode ?? 500
    this.severity = options.severity ?? 'error'
    this.cause = options.cause

    // Maintains proper stack trace for where error was instantiated
    const errorConstructor = Error as unknown as {
      captureStackTrace?: (
        targetObject: object,
        constructorOpt?: unknown,
      ) => void
    }
    if (typeof errorConstructor.captureStackTrace === 'function') {
      errorConstructor.captureStackTrace(this, AppError)
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      statusCode: this.statusCode,
      severity: this.severity,
    }
  }
}
