import { MapPin } from 'lucide-react'
import { useCart } from '@/features/cart/state/useCart'
import { cn } from '@/shared/utils/cn'
import { useNow } from '../state/useNow'
import type { UpcomingGraduation } from '../state/useUpcomingGraduations'

const ONE_SECOND = 1000

function getCountdown(remainingMs: number) {
  const totalSeconds = Math.floor(Math.max(0, remainingMs) / 1000)
  return [
    { label: 'days', value: Math.floor(totalSeconds / 86_400) },
    { label: 'hrs', value: Math.floor((totalSeconds / 3600) % 24) },
    { label: 'min', value: Math.floor((totalSeconds / 60) % 60) },
    { label: 'sec', value: totalSeconds % 60 },
  ]
}

export interface GraduationTicketProps {
  graduation: UpcomingGraduation
  className?: string
}

export function GraduationTicket({
  graduation,
  className,
}: GraduationTicketProps) {
  const { openQuickOrder } = useCart()
  const now = useNow(ONE_SECOND)
  const hasStarted = now >= graduation.startsAt

  return (
    <div
      className={cn(
        'relative rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 dark:ring-1 dark:ring-white/10',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-orange-50 dark:bg-neutral-950"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-orange-50 dark:bg-neutral-950"
      />

      <div className="grid gap-6 px-7 py-7 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold tracking-widest text-amber-300 uppercase">
            {hasStarted ? 'At the gate today' : 'Next graduation we serve'}
          </p>
          <p className="mt-2 font-display text-2xl leading-tight font-semibold sm:text-3xl">
            {graduation.campus}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {graduation.weekday} {graduation.day} {graduation.month} ·{' '}
              {graduation.stationName}
            </span>
          </p>
        </div>

        <div className="border-t border-dashed border-white/25 pt-6 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {hasStarted ? (
            <p className="font-display text-2xl leading-snug font-medium">
              We&rsquo;re set up outside the gate right now.
            </p>
          ) : (
            <div
              role="timer"
              aria-label={`Time until the ${graduation.campus} graduation`}
              className="flex gap-6"
            >
              {getCountdown(graduation.startsAt - now).map((unit) => (
                <div key={unit.label} className="flex flex-col">
                  <span className="font-display text-4xl font-medium tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="text-xs tracking-widest text-neutral-400 uppercase">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 lg:text-right">
          <button
            type="button"
            onClick={() =>
              openQuickOrder({
                venue: graduation.campus,
                date: graduation.nextGraduationDate,
              })
            }
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 focus-visible:outline-none sm:w-auto"
          >
            {hasStarted ? 'Order for today' : 'Pre-order for this ceremony'}
          </button>
        </div>
      </div>
    </div>
  )
}
