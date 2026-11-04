import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, HelpCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui/Button'

const FAQS = [
  {
    q: 'How does campus ceremony delivery work?',
    a: 'On ceremony day, our dedicated florists station courier delivery kiosks at primary venue gates and auditorium entrances. We coordinate directly with campus security and call/text the graduate or family upon arrival for a seamless handoff.',
  },
  {
    q: 'Can I personalize the ribbon with school honors?',
    a: 'Yes! Every bouquet comes with your choice of satin school ribbon color and complimentary gold foil embossing. You can print the graduate’s name, graduation year (e.g., "Class of 2026"), or academic honors like "Summa Cum Laude".',
  },
  {
    q: 'What if the ceremony timing or venue changes?',
    a: 'Commencement schedules often shift. Simply update your order details or notify our support team up to 12 hours before ceremony morning, and we will adjust the delivery call time and gate location without extra charge.',
  },
  {
    q: 'What is your 100% Fresh Arrival Guarantee?',
    a: 'Graduation flowers are conditioned in cool hydration wraps right up until ceremony presentation. If any stem does not look absolutely vibrant upon delivery, our campus tent replaces the bouquet on the spot.',
  },
]

export function CeremonyFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 sm:py-24 bg-neutral-50/60 dark:bg-neutral-900/40 border-t border-neutral-200/80 dark:border-neutral-800/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Ceremony Questions Answered</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Frequently Asked Commencement Questions
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Everything you need to know about celebrating your graduate
            worry-free.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen
                        ? 'rotate-180 text-indigo-600 dark:text-indigo-400'
                        : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Bottom Commencement Reservation Callout Banner */}
        <div className="mt-14 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl shadow-indigo-600/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-amber-200 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Use Code GRAD2026 for 15% Off Ceremony Pre-Orders</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready to Reserve Your Graduate’s Bouquet?
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-indigo-100 max-w-xl">
              Lock in your ceremony gate time slot and custom embossed school
              ribbon today with our 100% Fresh Arrival Guarantee.
            </p>
          </div>

          <Link to="/flowers" className="shrink-0">
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="bg-white text-indigo-700 hover:bg-indigo-50 dark:bg-white dark:text-indigo-700 dark:hover:bg-indigo-50 font-bold shadow-md"
            >
              Reserve Flowers Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
