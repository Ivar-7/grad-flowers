import { useCart } from '@/features/cart/state/useCart'
import { Button } from '@/shared/ui/Button'
import type { UpcomingGraduation } from '../state/useUpcomingGraduations'

export interface GraduationCalendarProps {
  graduations: UpcomingGraduation[]
}

export function GraduationCalendar({ graduations }: GraduationCalendarProps) {
  const { openQuickOrder } = useCart()

  return (
    <section
      id="graduations"
      className="scroll-mt-20 bg-white py-16 sm:py-24 dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
            Graduation calendar
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-5xl dark:text-white">
            Find your ceremony.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
            We set up outside the gate on graduation morning. Pre-order now and
            collect with your order code on the day.
          </p>
        </div>

        {graduations.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-8 sm:p-10 dark:border-neutral-700">
            <p className="font-display text-2xl font-medium text-neutral-900 dark:text-white">
              This season&rsquo;s ceremonies are done.
            </p>
            <p className="mt-2 max-w-xl text-neutral-600 dark:text-neutral-400">
              New dates go up as universities announce them. You can still order
              for any date and choose your station.
            </p>
            <Button
              className="mt-6 rounded-xl font-semibold"
              onClick={() => openQuickOrder()}
            >
              Order for another date
            </Button>
          </div>
        ) : (
          <ol className="mt-10 border-t border-neutral-200 lg:columns-2 lg:gap-12 dark:border-neutral-800">
            {graduations.map((graduation, index) => (
              <li
                key={graduation.id}
                className="flex break-inside-avoid items-center gap-3 border-b border-neutral-200 py-5 sm:gap-6 dark:border-neutral-800"
              >
                <div className="w-14 shrink-0 text-center">
                  <span className="block font-display text-4xl leading-none font-semibold text-neutral-900 tabular-nums dark:text-white">
                    {graduation.day}
                  </span>
                  <span className="mt-1 block text-xs font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
                    {graduation.month}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-neutral-900 dark:text-white">
                    {graduation.campus}
                    {index === 0 && (
                      <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-semibold text-neutral-900">
                        {graduation.hasStarted ? 'Today' : 'Next up'}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {graduation.weekday} · {graduation.stationName}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-500">
                    {graduation.schoolColors}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openQuickOrder({
                      venue: graduation.campus,
                      date: graduation.nextGraduationDate,
                    })
                  }
                  aria-label={`Pre-order for ${graduation.campus}`}
                  className="shrink-0 cursor-pointer rounded-xl border border-neutral-300 px-3 py-2.5 text-sm sm:px-4 font-semibold text-neutral-900 transition-colors hover:border-rose-600 hover:bg-rose-600 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:text-white dark:hover:border-rose-600 dark:focus-visible:ring-offset-neutral-950"
                >
                  Pre-order
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
