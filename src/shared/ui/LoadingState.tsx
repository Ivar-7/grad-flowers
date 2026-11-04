import { Loader2 } from 'lucide-react'

export interface LoadingStateProps {
  message?: string
  className?: string
  fullPage?: boolean
}

export function LoadingState({
  message = 'Loading...',
  className = '',
  fullPage = false,
}: LoadingStateProps) {
  const containerClasses = fullPage
    ? 'min-h-96 py-20 flex flex-col items-center justify-center'
    : 'py-12 flex flex-col items-center justify-center'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerClasses} ${className}`}
    >
      <Loader2
        className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
      <span className="sr-only">Loading</span>
    </div>
  )
}
