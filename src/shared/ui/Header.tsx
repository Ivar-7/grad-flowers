import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ShoppingBag,
  Package,
  Menu,
  X,
  Users,
  CalendarHeart,
} from 'lucide-react'
import { useAuth } from '@/features/auth/state/useAuth'
import { useCart } from '@/features/cart/state/useCart'
import { useReferral } from '@/shared/referral/useReferral'
import { ThemeToggle } from '../theme/ThemeToggle'
import { cn } from '../utils/cn'

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const { itemCount, openDrawer, openQuickOrder } = useCart()
  const { referrer } = useReferral()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors px-3 py-1.5 rounded-lg',
      isActive
        ? 'text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 font-semibold'
        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800',
    )

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || 'Graduate'

  const referrerBadge = referrer ? (
    <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
      Hunter: @{referrer}
    </span>
  ) : null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold text-lg tracking-tight"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 via-amber-600 to-rose-800 text-white shadow-md shadow-rose-500/20 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M12 3L2.5 7.75L12 12.5L21.5 7.75L12 3Z"
                  fill="currentColor"
                />
                <path
                  d="M19.5 8.75V14.5"
                  stroke="#FBBF24"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="19.5" cy="15.25" r="1.25" fill="#FBBF24" />
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
            <span className="flex items-center gap-1">
              <span>GradFlowers</span>
              <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                KE
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/flowers" className={navLinkClass}>
              Our 6 Products
            </NavLink>
            <NavLink to="/leads" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <CalendarHeart className="h-3.5 w-3.5" />
                <span>Supply & Photos</span>
              </span>
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                <span>Station Pass</span>
              </span>
            </NavLink>
            <NavLink to="/staff" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>Staff</span>
              </span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block">{referrerBadge}</div>
          <button
            type="button"
            onClick={() => openQuickOrder()}
            className="hidden sm:inline-flex items-center rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            Order in 60s
          </button>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open bouquet basket (${itemCount} items)`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          {/* Signed-in Staff/User Pill (No login required for customers) */}
          {isAuthenticated && (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors border-rose-200 bg-rose-50/60 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60',
                  isActive && 'ring-2 ring-rose-500/30',
                )
              }
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="hidden lg:inline max-w-28 truncate">
                {displayName}
              </span>
            </NavLink>
          )}

          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              isMobileMenuOpen ? 'Close navigation' : 'Open navigation'
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 lg:hidden cursor-pointer"
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
            className="border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden overflow-hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {referrerBadge && (
                <div className="px-3 pb-1 sm:hidden">{referrerBadge}</div>
              )}
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
                Our 6 Products (KSh 50 – 1,500)
              </NavLink>
              <NavLink
                to="/leads"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Weekly Supply, Stockists & Photos
              </NavLink>
              <NavLink
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Station Pass & Orders
              </NavLink>
              <NavLink
                to="/staff"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navLinkClass}
              >
                Staff & Hunters Dashboard
              </NavLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
