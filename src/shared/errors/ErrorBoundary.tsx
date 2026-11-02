import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'
import { AppError } from './app-error'
import { normalizeError } from './error-normalizer'
import { logError } from './error-logger'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: AppError, reset: () => void) => ReactNode
  onCatch?: (error: AppError) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const appError = normalizeError(
      error,
      'An unexpected error occurred in this view.',
    )
    return { hasError: true, error: appError }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    const appError = normalizeError(error, 'An unexpected view error occurred.')
    logError(appError, {
      feature: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: { componentStack: info.componentStack ?? '' },
    })
    this.props.onCatch?.(appError)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = (): void => {
    this.handleReset()
    window.location.href = '/'
  }

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mb-5">
              <AlertOctagon className="h-7 w-7" aria-hidden="true" />
            </div>

            <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Application Error
            </h1>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
              {this.state.error.userMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
