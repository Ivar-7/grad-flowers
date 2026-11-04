import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  LogIn,
  ShoppingBag,
  Package,
  Menu,
  X,
  Check,
  Copy,
} from 'lucide-react'
import { useAuth } from '@/features/auth/state/useAuth'
import { useCart } from '@/features/cart/state/useCart'
import { ThemeToggle } from '../theme/ThemeToggle'
import { cn } from '../utils/cn'

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const { itemCount, openDrawer } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [copiedPromo, setCopiedPromo] = useState(false)

  const handleCopyPromo = () => {
    navigator.clipboard?.writeText('GRAD2026').catch(() => undefined)
    setCopiedPromo(true)
    setTimeout(() => setCopiedPromo(false), 2000)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors px-3 py-1.5 rounded-lg',
      isActive
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800',
    )

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || 'Graduate'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/85 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/85">
      {/* Top Commencement Announcement Strip */}
      <div className="bg-indigo-600 dark:bg-indigo-950 text-white border-b border-indigo-500/30 dark:border-indigo-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span className="font-medium truncate">
              Commencement 2026: Free Campus Gate Delivery over $75 or 15% off
              with code <strong className="font-bold">GRAD2026</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyPromo}
            className="ml-3 shrink-0 inline-flex items-center gap-1 rounded-md bg-white/15 hover:bg-white/25 px-2 py-0.5 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {copiedPromo ? (
              <>
                <Check className="h-3 w-3 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy GRAD2026</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold text-lg tracking-tight"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {/* Commencement Mortarboard Cap */}
                <path
                  d="M12 3L2.5 7.75L12 12.5L21.5 7.75L12 3Z"
                  fill="currentColor"
                />
                {/* Gold Tassel */}
                <path
                  d="M19.5 8.75V14.5"
                  stroke="#FBBF24"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="19.5" cy="15.25" r="1.25" fill="#FBBF24" />
                {/* Ceremonial Bouquet Petals & Laurel Base */}
                <path
                  d="M6.5 13.5C6.5 16.8 8.9 19.5 12 20.5C15.1 19.5 17.5 16.8 17.5 13.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <path
                  d="M12 14.5C10.5 14.5 9.25 15.75 9.25 17.25C10.75 17.25 12 16 12 14.5ZM12 14.5C13.5 14.5 14.75 15.75 14.75 17.25C13.25 17.25 12 16 12 14.5Z"
                  fill="#FBBF24"
                />
              </svg>
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
              Bouquets & Leis
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                <span>Orders</span>
              </span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open shopping cart (${itemCount} items)`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          {/* Account Button */}
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors',
                isAuthenticated
                  ? 'border-indigo-200 bg-indigo-50/60 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                isActive && 'ring-2 ring-indigo-500/30',
              )
            }
          >
            {isAuthenticated ? (
              <>
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:inline max-w-32 truncate">
                  {displayName}
                </span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </NavLink>

          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              isMobileMenuOpen ? 'Close navigation' : 'Open navigation'
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 md:hidden overflow-hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Home
              </NavLink>
              <NavLink
                to="/flowers"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Bouquets & Leis
              </NavLink>
              <NavLink
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClass}
              >
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  <span>Orders</span>
                </span>
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
