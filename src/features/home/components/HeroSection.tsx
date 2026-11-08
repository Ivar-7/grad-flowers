import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Star,
  MapPin,
  Award,
  ShieldCheck,
  Flower2,
} from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'

interface HeroShowcaseItem {
  id: string
  title: string
  subtitle: string
  price: string
  stems: string
  imageUrl: string
  ribbonLabel: string
  ribbonColorClass: string
  inscription: string
  campusTag: string
}

const HERO_SHOWCASE_ITEMS: HeroShowcaseItem[] = [
  {
    id: 'grad-grand-chancellor',
    title: 'Chancellor Celebration Bouquet',
    subtitle: 'Garden roses, calla lilies and delphiniums in a grand cascade',
    price: 'KSh 14,000',
    stems: '36 Fresh Stems',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80',
    ribbonLabel: 'Navy & Gold Foil',
    ribbonColorClass: 'bg-blue-900 text-amber-300 border-amber-400/40',
    inscription: 'CLASS OF 2026 • HIGHEST HONORS',
    campusTag: 'North Gate Kiosk Ready',
  },
  {
    id: 'grad-crimson-roses',
    title: 'Valedictorian Crimson Roses',
    subtitle: 'Two dozen velvety long-stem red roses in parchment',
    price: 'KSh 9,000',
    stems: '24 Long Stems',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    ribbonLabel: 'Crimson & Gold Foil',
    ribbonColorClass: 'bg-rose-950 text-amber-300 border-amber-400/40',
    inscription: 'VALEDICTORIAN HONORS • 2026',
    campusTag: 'Main Quad Tent Delivery',
  },
  {
    id: 'grad-double-orchid-lei',
    title: 'Double Purple Orchid Lei',
    subtitle: 'Hand-strung with over 100 fresh dendrobium blooms',
    price: 'KSh 6,000',
    stems: '100+ Orchid Blooms',
    imageUrl:
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=900&q=80',
    ribbonLabel: 'Royal Purple & Gold',
    ribbonColorClass: 'bg-purple-950 text-amber-300 border-amber-400/40',
    inscription: 'ALOHA & CONGRATULATIONS GRAD',
    campusTag: 'Stadium Entrance Handoff',
  },
]

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = HERO_SHOWCASE_ITEMS[activeIndex] ?? HERO_SHOWCASE_ITEMS[0]!

  return (
    <section className="relative overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-28 bg-gradient-to-b from-indigo-50/80 via-white to-neutral-50/50 dark:from-indigo-950/30 dark:via-neutral-950 dark:to-neutral-900/30 border-b border-neutral-200/70 dark:border-neutral-800/70">
      {/* Decorative Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-10 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl dark:bg-purple-500/10"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Editorial Messaging & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Badge
                variant="purple"
                className="mb-6 px-3.5 py-1.5 text-xs sm:text-sm gap-2 shadow-xs border border-purple-200/80 dark:border-purple-800/60"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Commencement Season 2026 Reservations Open</span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl leading-tight"
            >
              Honor Every Milestone with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 dark:from-indigo-400 dark:via-purple-400 dark:to-amber-400">
                Ceremonial Blooms
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="mt-5 max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed"
            >
              Celebrate diplomas, degrees, and academic triumphs with hand-tied
              commencement bouquets, custom embossed gold-foil school ribbons,
              and guaranteed stadium or auditorium gate delivery.
            </motion.p>

            {/* Value Highlights Pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Free Gold Foil Ribbon Inscription</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Direct Campus Gate Handoff</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% Morning Freshness Guarantee</span>
              </span>
            </motion.div>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto"
            >
              <Link to="/flowers" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="w-full sm:w-auto shadow-lg shadow-indigo-600/25 px-6"
                >
                  Explore Bouquets & Leis
                </Button>
              </Link>
              <Link
                to="/flowers?category=bestsellers"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/80 dark:bg-neutral-900/80"
                  leftIcon={<Sparkles className="h-5 w-5 text-amber-500" />}
                >
                  Commencement Bestsellers
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-10 pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full"
            >
              <div>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  5,200+
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Graduates Honored
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  48+
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Campuses Served
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-1">
                  <span>4.95</span>
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Family Rating (1.4k+ reviews)
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>100%</span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  On-Time Gate Arrival
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Commencement Bouquet Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-2xl shadow-indigo-950/10">
              {/* Top Kiosk Status Pill */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <Flower2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Signature Ceremony Presentation</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{activeItem.campusTag}</span>
                </span>
              </div>

              {/* Main Image Frame */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeItem.id}
                    src={activeItem.imageUrl}
                    alt={activeItem.title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Top Left Stem Count Pill */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>{activeItem.stems}</span>
                  </span>
                </div>

                {/* Simulated Embossed Gold Foil Ribbon Overlay */}
                <div className="absolute bottom-3 inset-x-3">
                  <div
                    className={`rounded-xl border px-3.5 py-2 shadow-lg backdrop-blur-md ${activeItem.ribbonColorClass}`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-80 mb-0.5">
                      <span>Embossed Satin Ribbon Preview</span>
                      <span>{activeItem.ribbonLabel}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold tracking-widest uppercase truncate">
                      ★ {activeItem.inscription} ★
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Bouquet Details & Quick Link */}
              <div className="mt-4 flex items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    {activeItem.title}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {activeItem.subtitle}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xs text-neutral-400">From</span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                    {activeItem.price}
                  </span>
                </div>
              </div>

              {/* Interactive Arrangement Switcher Tabs */}
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {HERO_SHOWCASE_ITEMS.map((item, idx) => {
                    const isSelected = idx === activeIndex
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {idx === 0
                          ? 'Mixed Bouquet'
                          : idx === 1
                            ? 'Crimson Roses'
                            : 'Orchid Lei'}
                      </button>
                    )
                  })}
                </div>

                <Link
                  to={`/flowers/${activeItem.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Customize</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
