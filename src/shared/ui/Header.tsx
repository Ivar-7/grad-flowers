import { Link, NavLink } from 'react-router-dom'
import { Flower, Sparkles, User } from 'lucide-react'
import { ThemeToggle } from '../theme/ThemeToggle'
import { cn } from '../utils/cn'

export function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors px-3 py-1.5 rounded-lg',
      isActive
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800',
    )

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold text-lg tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
              <Flower className="h-5 w-5" />
            </span>
            <span className="flex items-center gap-1.5">
              <span>GradFlowers</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/flowers" className={navLinkClass}>
              Bouquets & Gifts
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
                isActive &&
                  'border-indigo-500 text-indigo-600 dark:text-indigo-400',
              )
            }
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </NavLink>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
