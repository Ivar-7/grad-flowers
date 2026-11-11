import { ArrowRight } from 'lucide-react'
import { useCart } from '@/features/cart/state/useCart'

const ROSES_PHOTO =
  'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1600&q=70'

export function OrderCta() {
  const { openQuickOrder } = useCart()

  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <img
        src={ROSES_PHOTO}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-neutral-950/65"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
            Their name gets called once.{' '}
            <em className="block text-amber-200">
              Be the one holding flowers.
            </em>
          </h2>
          <p className="mt-5 text-lg text-neutral-200">
            Pick a bouquet, pay with M-Pesa, collect at the gate.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openQuickOrder()}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-4 text-base font-semibold text-neutral-900 transition-colors hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
        >
          Order in 60 seconds
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
