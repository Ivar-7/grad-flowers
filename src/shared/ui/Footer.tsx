import { Flower, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Flower className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              GradFlowers
            </span>
            <span>
              — Celebrate milestones with timeless floral arrangements.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
            <Link
              to="/"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/flowers"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Catalog
            </Link>
            <Link
              to="/auth"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <p>© {currentYear} GradFlowers. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>for graduates everywhere.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
