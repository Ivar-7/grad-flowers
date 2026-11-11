import { useState } from 'react'
import { useCart } from '@/features/cart/state/useCart'
import { KENYAN_PICKUP_STATIONS } from '@/features/checkout/types/checkout.types'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/utils/cn'

const BOUQUET_PHOTO =
  'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?auto=format&fit=crop&w=900&q=75'

interface RibbonOption {
  /** Must match a ribbon colour offered in the order form. */
  name: string
  bandClass: string
  swatchClass: string
}

const RIBBONS: RibbonOption[] = [
  {
    name: 'Royal Blue',
    bandClass: 'bg-blue-800 text-white',
    swatchClass: 'bg-blue-800',
  },
  {
    name: 'Gold',
    bandClass: 'bg-amber-400 text-neutral-900',
    swatchClass: 'bg-amber-400',
  },
  {
    name: 'Crimson Red',
    bandClass: 'bg-red-700 text-white',
    swatchClass: 'bg-red-700',
  },
  {
    name: 'Emerald Green',
    bandClass: 'bg-emerald-700 text-white',
    swatchClass: 'bg-emerald-700',
  },
  {
    name: 'Purple',
    bandClass: 'bg-purple-800 text-white',
    swatchClass: 'bg-purple-800',
  },
  {
    name: 'White',
    bandClass: 'bg-white text-neutral-900',
    swatchClass: 'bg-white',
  },
]

function getMatchingCampuses(ribbonName: string): string[] {
  return KENYAN_PICKUP_STATIONS.filter((station) =>
    station.schoolColors.includes(ribbonName),
  ).map((station) => station.campus)
}

export function RibbonSection() {
  const { openQuickOrder } = useCart()
  const [selected, setSelected] = useState<RibbonOption>(RIBBONS[0]!)
  const matchingCampuses = getMatchingCampuses(selected.name)

  return (
    <section className="bg-orange-50 py-16 sm:py-24 dark:bg-neutral-900">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl lg:max-w-none">
          <img
            src={BOUQUET_PHOTO}
            alt="A wrapped bouquet of pale roses"
            loading="lazy"
            decoding="async"
            className="aspect-square w-full bg-orange-100 object-cover dark:bg-neutral-800"
          />
          <div
            className={cn(
              'absolute -inset-x-6 bottom-1/4 -rotate-3 py-3.5 text-center text-sm font-semibold tracking-widest uppercase shadow-lg transition-colors duration-300',
              selected.bandClass,
            )}
          >
            {selected.name} ribbon
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
            School colours
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-5xl dark:text-white">
            Tied in their colours.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
            Every bouquet is finished with a ribbon. Pick the one that matches
            the gown and we&rsquo;ll tie it on, at no extra cost.
          </p>

          <div
            role="group"
            aria-label="Ribbon colour"
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {RIBBONS.map((ribbon) => {
              const isSelected = ribbon.name === selected.name
              return (
                <button
                  key={ribbon.name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(ribbon)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-900',
                    isSelected
                      ? 'border-neutral-900 bg-white text-neutral-900 dark:border-white dark:bg-neutral-800 dark:text-white'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-5 shrink-0 rounded-full ring-1 ring-neutral-900/15 dark:ring-white/25',
                      ribbon.swatchClass,
                    )}
                  />
                  {ribbon.name}
                </button>
              )
            })}
          </div>

          <p
            aria-live="polite"
            className="mt-5 min-h-10 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
          >
            {matchingCampuses.length > 0
              ? `Worn at ${matchingCampuses.join(', ')}.`
              : 'Not a school colour at our current stations, but we carry it.'}
          </p>

          <Button
            size="lg"
            onClick={() => openQuickOrder({ schoolColor: selected.name })}
            className="mt-4 w-full rounded-xl px-7 py-3.5 font-semibold sm:w-auto"
          >
            Order with a {selected.name} ribbon
          </Button>
        </div>
      </div>
    </section>
  )
}
