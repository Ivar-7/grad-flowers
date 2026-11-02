import { Award, Clock, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Card } from '@/shared/ui/Card'

const highlights = [
  {
    icon: Award,
    title: 'Commemorative Ribbons',
    description:
      'Personalized graduation ribbons printed with year, honors, or graduate name.',
  },
  {
    icon: Clock,
    title: 'Campus Delivery',
    description:
      'Direct on-time delivery to campus ceremony venues, auditoriums, and residences.',
  },
  {
    icon: HeartHandshake,
    title: 'Farm-Fresh Stems',
    description:
      'Ethically grown roses, lilies, and sunflowers arranged on the day of presentation.',
  },
  {
    icon: ShieldCheck,
    title: 'Satisfaction Guaranteed',
    description:
      '100% fresh arrival guarantee so your graduate receives a stunning presentation.',
  },
]

export function FeaturesHighlight() {
  return (
    <section className="py-16 sm:py-20 bg-neutral-50/60 dark:bg-neutral-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Why Families & Graduates Choose Us
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Thoughtfully tailored floral experiences designed specifically for
            commencement ceremonies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.title}
                hoverable
                className="flex flex-col items-start p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-4">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
