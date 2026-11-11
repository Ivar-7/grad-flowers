import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const FAQS = [
  {
    id: 'ordering',
    question: 'Do I need an account to order?',
    answer:
      'No. Tap “Order in 60 seconds”, pick a bouquet and your university station, then enter your 07… or 01… M-Pesa number. You approve the payment prompt on your phone and get your order code straight away.',
  },
  {
    id: 'collection',
    question: 'Where do I collect on graduation day?',
    answer:
      'At our station outside the main graduation gate. We set up at UoN, KU, JKUAT, Strathmore, USIU-Africa, MKU, Daystar and TUK / KCA. Show your order code and the bouquet is yours.',
  },
  {
    id: 'qr-card',
    question: 'How does the QR message card work?',
    answer:
      'Classic, Classic Candy and Premium come with a printed QR card. When you order you can record a voice note or upload a video. The graduate scans the card with their phone camera and your message plays.',
  },
  {
    id: 'candy',
    question: 'What is the difference between a Mini and a Mini Candy?',
    answer:
      'The flowers are the same. Mini Candy adds a chocolate and a success card to the Mini. Classic Candy adds Eclairs, toffees, a biscuit and a gift card to the Classic.',
  },
]

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0]!.id)

  return (
    <section className="bg-neutral-50 py-16 sm:py-24 dark:bg-neutral-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-4">
          <p className="text-sm font-semibold tracking-widest text-rose-700 uppercase dark:text-rose-400">
            Questions
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-5xl dark:text-white">
            Asked at the gate, answered here.
          </h2>
        </div>

        <div className="border-t border-neutral-300 lg:col-span-8 dark:border-neutral-700">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id
            return (
              <div
                key={faq.id}
                className="border-b border-neutral-300 dark:border-neutral-700"
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-${faq.id}-button`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${faq.id}-panel`}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-neutral-900 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none dark:text-white"
                  >
                    {faq.question}
                    <Plus
                      aria-hidden="true"
                      className={cn(
                        'h-5 w-5 shrink-0 text-rose-600 transition-transform duration-200 dark:text-rose-400',
                        isOpen && 'rotate-45',
                      )}
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${faq.id}-panel`}
                      role="region"
                      aria-labelledby={`faq-${faq.id}-button`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
