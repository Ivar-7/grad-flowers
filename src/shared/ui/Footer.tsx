import { Heart, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_CONFIG } from '@/shared/config/site.config'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold text-lg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 via-amber-600 to-rose-800 text-white shadow-sm shadow-rose-500/20 ring-1 ring-white/20">
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
              <span>{SITE_CONFIG.fullBrandName}</span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              Fresh Kenyan rose bouquets for graduation day. Pay with M-Pesa for
              pickup at your graduation event or delivery to your address.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                TUK • KISE • KCA • UoN • KU • JKUAT
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Instant M-Pesa Checkout
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Bouquet Menu
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link
                  to="/flowers/single"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Single — 1 rose, ribbon
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers/mini"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Mini — 3 roses, filler, wrap
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers/mini-candy"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Mini Candy — +Chocolate &amp; card
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers/classic"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Classic — 6 roses, QR card
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers/classic-candy"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Classic Candy — +Eclairs &amp; toffees
                </Link>
              </li>
              <li>
                <Link
                  to="/flowers/premium"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Premium — 12 roses, double wrap, QR
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Orders &amp; Support
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link
                  to="/orders"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  My Orders &amp; Collection Pass
                </Link>
              </li>
              <li>
                <Link
                  to="/leads"
                  className="hover:text-rose-600 dark:hover:text-white transition-colors"
                >
                  Weekly Flower Supply &amp; Photo Booking
                </Link>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp {SITE_CONFIG.whatsappDisplay}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 dark:text-neutral-500">
          <p>
            © {currentYear} {SITE_CONFIG.fullBrandName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            <span>Hand-tied with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>for Kenyan graduates &amp; proud families.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
