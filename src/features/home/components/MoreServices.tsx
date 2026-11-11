import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const SERVICES = [
  {
    title: 'Weekly flowers',
    body: 'Fresh stems for your home, office, hotel or church, every week.',
  },
  {
    title: 'Stock our bouquets',
    body: 'Wholesale bouquets, wraps and ribbons for your shop or graduation stand.',
  },
  {
    title: 'Graduation photos',
    body: 'A portrait photographer to meet you at the graduation square.',
  },
]

export function MoreServices() {
  return (
    <section className="bg-white py-16 sm:py-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          More than graduation day.
        </h2>

        <ul className="mt-8 grid border-t border-neutral-200 md:grid-cols-3 md:gap-10 dark:border-neutral-800">
          {SERVICES.map((service) => (
            <li
              key={service.title}
              className="border-b border-neutral-200 md:border-b-0 dark:border-neutral-800"
            >
              <Link
                to="/leads"
                className="group block py-6 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                <span className="flex items-center justify-between gap-3 text-lg font-semibold text-neutral-900 dark:text-white">
                  {service.title}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-400"
                  />
                </span>
                <span className="mt-2 block leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {service.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
