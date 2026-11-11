import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

interface Joke {
  id: string
  setup: string
  punchline: string
}

const JOKES: Joke[] = [
  {
    id: 'helb',
    setup: 'What did the HELB loan say to the graduate on ceremony morning?',
    punchline:
      '“Hongera sana! Take all the photos today. We’ll talk on Monday.”',
  },
  {
    id: 'group-leader',
    setup: 'How do you spot the group project leader at the graduation square?',
    punchline:
      'Their shoulders are still strong from carrying four group members since second year.',
  },
  {
    id: 'parents',
    setup: 'Why do Kenyan parents arrive at the graduation gate at 5:30 AM?',
    punchline:
      'To make sure the Registrar didn’t misplace that one CAT from 2023.',
  },
  {
    id: 'gown',
    setup: 'Why is a graduation gown the most expensive outfit in Nairobi?',
    punchline:
      'It comes with four years of sukuma wiki, group work and sleepless CAT nights.',
  },
  {
    id: 'project',
    setup:
      'What is the difference between a first year and a final year project?',
    punchline: 'The project eventually gets bound and submitted on time.',
  },
  {
    id: 'ladder',
    setup: 'Why did the graduate bring a ladder to the graduation square?',
    punchline: 'They heard the degree was of the highest level: First Class.',
  },
]

const ONE_DAY = 86_400_000

export function JokeSection() {
  const [index, setIndex] = useState(
    () => Math.floor(Date.now() / ONE_DAY) % JOKES.length,
  )
  const joke = JOKES[index] ?? JOKES[0]!

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-24 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <p className="text-sm font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
            Joke of the day
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-5xl dark:text-white">
            Happy tears are fine. So is a laugh.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
            Campus jokes from our bouquet cards. Only a comrade will fully
            understand.
          </p>
        </div>

        <div className="lg:col-span-7">
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % JOKES.length)}
            className="block w-full -rotate-1 cursor-pointer rounded-2xl bg-amber-100 p-7 text-left text-neutral-900 shadow-xl transition-transform duration-200 hover:rotate-0 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-4 focus-visible:outline-none sm:p-10 dark:bg-amber-200 dark:focus-visible:ring-offset-neutral-950"
          >
            <span aria-live="polite" className="block min-h-48 sm:min-h-44">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={joke.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <span className="block font-display text-2xl leading-snug font-semibold sm:text-3xl">
                    {joke.setup}
                  </span>
                  <span className="mt-4 block text-lg leading-relaxed text-neutral-800">
                    {joke.punchline}
                  </span>
                </motion.span>
              </AnimatePresence>
            </span>

            <span className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-900/15 pt-4 text-sm font-semibold">
              <span className="text-neutral-600 tabular-nums">
                Card {index + 1} of {JOKES.length}
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-700">
                Another one
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
