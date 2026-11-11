import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { useCart } from '@/features/cart/state/useCart'
import { KENYAN_PICKUP_STATIONS } from '@/features/checkout/types/checkout.types'
import { SEEDED_FLOWERS } from '@/features/flowers/api/flowers.api'
import type { Flower } from '@/features/flowers/types/flower.types'
import { Button } from '@/shared/ui/Button'
import { formatKsh } from '@/shared/utils/currency'
import type { UpcomingGraduation } from '../state/useUpcomingGraduations'
import { GraduationTicket } from './GraduationTicket'
import { PriceList } from './PriceList'

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1523693916903-027d144a2b7d?auto=format&fit=crop&q=75'

const MENU_PRICES = SEEDED_FLOWERS.map((flower) => flower.price)
const LOWEST_PRICE = formatKsh(Math.min(...MENU_PRICES))
const HIGHEST_PRICE = formatKsh(Math.max(...MENU_PRICES))

const PROMISES = [
  'Pay with M-Pesa',
  `${KENYAN_PICKUP_STATIONS.length} campus pick-up stations`,
  'No account needed',
]

export interface HeroSectionProps {
  flowers: Flower[]
  isLoadingFlowers: boolean
  nextGraduation: UpcomingGraduation | null
}

export function HeroSection({
  flowers,
  isLoadingFlowers,
  nextGraduation,
}: HeroSectionProps) {
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
              Fresh rose bouquets from {LOWEST_PRICE} to {HIGHEST_PRICE}. Pay
              with M-Pesa now, then collect at our station outside the
              graduation gate on the morning.
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
                See the menu
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
            className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none"
          >
            <img
              src={`${HERO_PHOTO}&w=900`}
              srcSet={`${HERO_PHOTO}&w=600 600w, ${HERO_PHOTO}&w=900 900w, ${HERO_PHOTO}&w=1400 1400w`}
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt="A bouquet of pink roses in white wrap, ready to hand over"
              fetchPriority="high"
              className="aspect-square w-full rounded-3xl bg-orange-100 object-cover sm:aspect-4/5 dark:bg-neutral-900"
            />
            <PriceList
              flowers={flowers}
              isLoading={isLoadingFlowers}
              className="relative mx-4 -mt-20 -rotate-1 sm:mx-8 lg:absolute lg:bottom-8 lg:-left-8 lg:mx-0 xl:-left-12 lg:mt-0 lg:w-72"
            />
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
