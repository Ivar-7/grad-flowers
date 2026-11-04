import {
  Palette,
  Sparkles,
  MapPin,
  Star,
  Quote,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'

const PROCESS_STEPS = [
  {
    step: '01',
    icon: Palette,
    title: 'Select Stems & School Ribbon',
    description:
      'Choose a commencement bouquet or Hawaiian orchid lei, pick your alma mater satin ribbon color, and enter your custom gold-foil inscription.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Dawn Conditioning & Foil Pressing',
    description:
      'At 5:00 AM on ceremony morning, our master florists hydrate your stems in cooling wraps and hot-press your graduate’s name and honors in 24K gold foil.',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Stadium & Auditorium Gate Handoff',
    description:
      'Skip parking-lot flower runs. Pick up directly at our campus gate courier tent or receive live SMS coordination for direct family handoff before processional.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Our courier met us right outside the Greek Theatre North Gate 45 minutes before processional. The Navy & Gold foil ribbon with "Summa Cum Laude" made my daughter tear up!',
    author: 'Elena & Marcus Vance',
    role: 'Parents of Class of 2025 Graduate',
    campus: 'UC Berkeley',
    bouquet: 'Summa Cum Laude Sunflowers',
    rating: 5,
  },
  {
    quote:
      'The double purple dendrobium orchid lei was still cool and misted when I picked it up before walking across the stage. It looked incredible in every diploma photo.',
    author: 'Kaito Nakamura, M.S.',
    role: 'Engineering Graduate',
    campus: 'University of Washington',
    bouquet: 'Double Purple Orchid Lei',
    rating: 5,
  },
  {
    quote:
      'Being able to update our ceremony gate time the night before when the department moved halls saved us so much stress. Truly a five-star commencement service.',
    author: 'Dr. Patricia Sterling',
    role: 'Proud Aunt & Faculty Member',
    campus: 'Harvard University',
    bouquet: 'Valedictorian Crimson Roses',
    rating: 5,
  },
]

export function CeremonyProcessSection() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-neutral-950 border-t border-neutral-200/70 dark:border-neutral-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* How Ceremony Day Delivery Works */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="purple" className="mb-3 gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Stress-Free Commencement Morning</span>
          </Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            How Campus Ceremony Delivery Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Designed around packed stadium schedules so your family can focus on
            celebrating the graduate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PROCESS_STEPS.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.step}
                hoverable
                className="relative flex flex-col justify-between p-6 sm:p-8 border-neutral-200 dark:border-neutral-800"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-3xl font-extrabold text-neutral-200 dark:text-neutral-800 select-none">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Family & Graduate Testimonials */}
        <div className="pt-16 border-t border-neutral-200/70 dark:border-neutral-800/70">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                Loved by Graduates & Proud Families
              </h3>
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                Verified reviews from recent university commencement ceremonies.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-xs font-semibold text-amber-900 dark:text-amber-300">
              <div className="flex items-center text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
              </div>
              <span>4.95 / 5.0 from 1,420+ Ceremony Orders</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.author}
                className="flex flex-col justify-between p-6 bg-neutral-50/70 dark:bg-neutral-900/60 border-neutral-200/90 dark:border-neutral-800"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-indigo-300 dark:text-indigo-800" />
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/70 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                        <span>{t.author}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t.role}
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {t.campus}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
