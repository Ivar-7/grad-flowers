import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { Button } from './Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-6">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </div>

      <span className="text-sm font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400 mb-2">
        404 Not Found
      </span>

      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-4">
        Page not found
      </h1>

      <p className="max-w-md text-base text-neutral-600 dark:text-neutral-400 mb-8">
        Sorry, we could not find the page you are looking for. Perhaps you are
        looking for our graduation bouquets?
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/flowers">
          <Button variant="outline">Browse Bouquets</Button>
        </Link>
      </div>
    </div>
  )
}
