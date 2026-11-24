import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { useCart } from '@/features/cart/state/useCart'
import { Button } from '@/shared/ui/Button'
import type { UpcomingGraduation } from '../state/useUpcomingGraduations'
import { GraduationTicket } from './GraduationTicket'

const HERO_PHOTO = '/images/bouquets/grand-pink-roses.jpg'
const SAMPLE_THUMBNAILS = [
  {
    src: '/images/bouquets/black-red-roses.jpg',
    alt: 'Red roses with baby’s breath in black and gold wrap',
  },
  {
    src: '/images/bouquets/blush-luxury.jpg',
    alt: 'Blush pink and cream rose graduation bouquet',
  },
  {
    src: '/images/bouquets/hatbox.jpg',
    alt: 'Red and white roses arranged in a black hatbox',
  },
]

const PROMISES = [
  'Pay with M-Pesa',
  'Graduation pickup or doorstep delivery',
  'No account needed',
]

export interface HeroSectionProps {
  nextGraduation: UpcomingGraduation | null
}

export function HeroSection({ nextGraduation }: HeroSectionProps) {
  const { openQuickOrder } = useCart()

  return (
    <section className="bg-orange-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-16 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 lg:pr-8"
          >
            <p className="flex items-center gap-3 text-sm font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              Hongera, Class of 2026
            </p>

            <h1 className="mt-5 font-display text-5xl leading-none font-semibold tracking-tight text-balance text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
              They did the four years.{' '}
              <em className="block text-rose-600 dark:text-rose-400">
                You bring the flowers.
              </em>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              Hand-tied Kenyan rose bouquets for graduation day. Pay with M-Pesa
              and choose graduation event pickup or delivery straight to your
              address.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => openQuickOrder()}
                rightIcon={
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                }
                className="rounded-xl px-7 py-3.5 font-semibold shadow-lg shadow-rose-600/20"
              >
                Order in 60 seconds
              </Button>
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-7 py-3.5 text-base font-semibold text-neutral-800 transition-colors hover:border-neutral-900 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-neutral-300 dark:focus-visible:ring-offset-neutral-950"
              >
                See our bouquets
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-2">
                  <Check
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  {promise}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-md space-y-3 lg:col-span-5 lg:max-w-none"
          >
            <img
              src={HERO_PHOTO}
              alt="Fresh pink and cream graduation rose bouquet in blush wrap"
              fetchPriority="high"
              className="aspect-square w-full rounded-3xl bg-orange-100 object-cover shadow-xl sm:aspect-4/5 dark:bg-neutral-900"
            />
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_THUMBNAILS.map((thumb) => (
                <img
                  key={thumb.src}
                  src={thumb.src}
                  alt={thumb.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-2xl bg-orange-100 object-cover shadow-sm ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {nextGraduation && (
          <GraduationTicket
            graduation={nextGraduation}
            className="mt-12 lg:mt-16"
          />
        )}
      </div>
    </section>
  )
}
