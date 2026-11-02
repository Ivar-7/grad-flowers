import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, ArrowRight } from 'lucide-react'
import type { Flower } from '../types/flower.types'
import { Badge } from '@/shared/ui/Badge'
import { Card } from '@/shared/ui/Card'

export interface FlowerCardProps {
  flower: Flower
}

export function FlowerCard({ flower }: FlowerCardProps) {
  return (
    <Card
      hoverable
      className="group flex flex-col h-full overflow-hidden p-0 border-neutral-200 dark:border-neutral-800"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={flower.imageUrl}
          alt={flower.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {flower.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge variant="purple" className="shadow-sm gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Graduation Pick</span>
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="default" className="capitalize text-xs">
            {flower.category}
          </Badge>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {flower.flowerCount} stems
          </span>
        </div>

        <h3 className="text-base font-semibold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {flower.name}
        </h3>

        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 flex-1">
          {flower.description}
        </p>

        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
              From
            </span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              ${flower.price.toFixed(2)}
            </span>
          </div>

          <Link to={`/flowers/${flower.id}`}>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <span>View Bouquet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.div>
          </Link>
        </div>
      </div>
    </Card>
  )
}
