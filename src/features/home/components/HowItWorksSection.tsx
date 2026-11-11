import { QrCode } from 'lucide-react'
import { SEEDED_FLOWERS } from '@/features/flowers/api/flowers.api'
import type { Flower } from '@/features/flowers/types/flower.types'
import { formatKsh } from '@/shared/utils/currency'

const MENU_PRICES = SEEDED_FLOWERS.map((flower) => flower.price)

const STEPS = [
  {
    title: 'Pick a bouquet',
    body: `${SEEDED_FLOWERS.length} to choose from, ${formatKsh(Math.min(...MENU_PRICES))} to ${formatKsh(Math.max(...MENU_PRICES))}. No account and no sign-up.`,
  },
  {
    title: 'Pay with M-Pesa',
    body: 'Enter your 07… or 01… number and approve the prompt on your phone. Your order code arrives straight away.',
  },
  {
    title: 'Collect at the gate',
    body: 'Show your order code at our station outside the graduation gate. No detour into town on the morning.',
  },
]

interface CandyUpgrade {
  id: string
  from: string
  to: string
  contents: string
  extra: number
}

function getCandyUpgrades(flowers: Flower[]): CandyUpgrade[] {
  return flowers.flatMap((flower) => {
    const target = flowers.find(
      (candidate) => candidate.id === flower.candyUpgradeTargetId,
    )
    if (!target) return []
    return [
      {
        id: flower.id,
        from: flower.name,
        to: target.name,
        contents: target.whatsInIt,
        extra: target.price - flower.price,
      },
    ]
  })
}

export interface HowItWorksSectionProps {
  flowers: Flower[]
}

export function HowItWorksSection({ flowers }: HowItWorksSectionProps) {
  const candyUpgrades = getCandyUpgrades(flowers)
  const qrBouquets = flowers
    .filter((flower) => flower.includesQrCard)
    .map((flower) => flower.name)

  return (
    <section className="bg-emerald-950 py-16 text-emerald-50 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-amber-300 uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            Order in a minute. Collect at the gate.
          </h2>
        </div>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="border-t border-emerald-800 pt-6 md:pr-6"
            >
              <span
                aria-hidden="true"
                className="font-display text-6xl leading-none font-medium text-amber-300"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-emerald-100/80">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article className="flex flex-col gap-8 rounded-3xl bg-emerald-900 p-7 sm:flex-row sm:items-center sm:p-10">
            <div
              aria-hidden="true"
              className="flex w-36 shrink-0 -rotate-3 flex-col items-center gap-2 rounded-xl bg-orange-50 px-4 py-5 text-neutral-900 shadow-xl"
            >
              <QrCode className="size-20" strokeWidth={1.5} />
              <span className="font-display text-sm font-medium italic">
                Scan to play
              </span>
            </div>
            <div>
              <h3 className="font-display text-3xl leading-tight font-semibold">
                A card that talks.
              </h3>
              <p className="mt-3 leading-relaxed text-emerald-100/80">
                Record a voice note or upload a short video when you order. They
                scan the card tucked into the bouquet and hear it from you.
              </p>
              {qrBouquets.length > 0 && (
                <p className="mt-4 text-sm font-medium text-amber-200">
                  Comes with {qrBouquets.join(', ')}.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-3xl bg-emerald-900 p-7 sm:p-10">
            <h3 className="font-display text-3xl leading-tight font-semibold">
              Add something sweet.
            </h3>
            <p className="mt-3 leading-relaxed text-emerald-100/80">
              Flip the candy switch on a bouquet and we tuck treats in with the
              roses.
            </p>
            {candyUpgrades.length > 0 && (
              <ul className="mt-6 divide-y divide-emerald-800 border-y border-emerald-800">
                {candyUpgrades.map((upgrade) => (
                  <li
                    key={upgrade.id}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <span>
                      <span className="block font-display text-lg font-medium">
                        {upgrade.from} → {upgrade.to}
                      </span>
                      <span className="block text-sm text-emerald-100/70">
                        {upgrade.contents}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-amber-200 tabular-nums">
                      +{formatKsh(upgrade.extra)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
