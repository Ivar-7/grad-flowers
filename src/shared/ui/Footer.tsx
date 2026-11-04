import { Heart, Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold text-lg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-sm shadow-indigo-500/20 ring-1 ring-white/20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
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
              <span>GradFlowers</span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              Dedicated exclusively to graduation commencement floral
              celebrations. Hand-tied bouquets, customized gold foil school
              ribbons, and direct ceremony venue gate delivery.
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2">
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-indigo-500" />
                Campus Venue Delivery
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Freshness Guaranteed
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Commencement Shop
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link
                  to="/flowers"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  All Graduation Bouquets
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers?category=sunflowers"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Commencement Sunflowers
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers?category=roses"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Valedictorian Roses
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers?category=leis"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Hawaiian Orchid Leis
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers?category=boutonnieres"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Gown Corsages & Lapels
                </Link>
              </li>
            </ul>
          </div>

          {/* Orders & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Reservations & Orders
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link
                  to="/cart"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  View Ceremony Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Track Delivery Status
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Graduate Account
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium pt-1">
                  <Sparkles className="h-3 w-3" />
                  Promo Code: GRAD2026
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 dark:text-neutral-500">
          <p>© {currentYear} GradFlowers Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>for graduates and families everywhere.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
