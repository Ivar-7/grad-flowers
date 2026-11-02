import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { AppError } from './app-error'

export interface ErrorStateProps {
  error: AppError | string
  title?: string
  onRetry?: () => void
  actionLabel?: string
  className?: string
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  onRetry,
  actionLabel = 'Try Again',
  className = '',
}: ErrorStateProps) {
  const displayMessage = typeof error === 'string' ? error : error.userMessage

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 mb-4">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mb-5">
        {displayMessage}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}
