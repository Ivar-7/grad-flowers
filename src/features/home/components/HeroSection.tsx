import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Sparkles, GraduationCap } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-neutral-950 dark:to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant="purple"
              className="mb-6 px-3.5 py-1 text-xs sm:text-sm gap-1.5"
            >
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Graduation Season 2026 Specials</span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl max-w-4xl leading-tight"
          >
            Honor Every Milestone with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Handcrafted Blooms
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed"
          >
            Celebrate diplomas, degrees, and academic triumphs. Choose from
            curated graduation bouquets with commemorative ribbons, school
            colors, and campus delivery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/flowers">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Explore Bouquets
              </Button>
            </Link>
            <Link to="/flowers?category=bestsellers">
              <Button
                size="lg"
                variant="outline"
                leftIcon={<Sparkles className="h-5 w-5 text-amber-500" />}
              >
                Graduation Bestsellers
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
