import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, ArrowRight, Star, Plus, Check, Tag } from 'lucide-react'
import type { Flower } from '../types/flower.types'
import { useCart } from '@/features/cart/state/useCart'
import { Badge } from '@/shared/ui/Badge'
import { Card } from '@/shared/ui/Card'

export interface FlowerCardProps {
  flower: Flower
}

export function FlowerCard({ flower }: FlowerCardProps) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      flowerId: flower.id,
      name: flower.name,
      imageUrl: flower.imageUrl,
      category: flower.category,
      basePrice: flower.price,
      tier: 'standard',
      tierLabel: 'Standard Ceremony (12 stems)',
      unitPrice: flower.price,
      quantity: 1,
      ribbonColor: flower.ribbonColors[0] || 'Gold',
      addOns: [],
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <Card
      hoverable
      className="group flex flex-col h-full overflow-hidden p-0 border-neutral-200 dark:border-neutral-800"
    >
      <Link
        to={`/flowers/${flower.id}`}
        className="block relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        <img
          src={flower.imageUrl}
          alt={flower.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        {flower.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge variant="purple" className="shadow-xs gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Graduation Pick</span>
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
          <span className="rounded-full bg-black/55 backdrop-blur-md px-2.5 py-0.5">
            {flower.flowerCount}{' '}
            {flower.category === 'leis' ? 'Blooms' : 'Stems'}
          </span>
          {flower.ribbonColors.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-0.5">
              <Tag className="h-3 w-3 text-amber-300" />
              <span>{flower.ribbonColors.length} Ribbon Colors</span>
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="default" className="capitalize text-xs">
            {flower.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span>{flower.rating.toFixed(2)}</span>
            <span className="text-neutral-400 font-normal">
              ({flower.reviewCount})
            </span>
          </div>
        </div>

        <Link to={`/flowers/${flower.id}`}>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {flower.name}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 flex-1">
          {flower.description}
        </p>

        {/* School color ribbon preview tags */}
        {flower.schoolColorTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1">
            {flower.schoolColorTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
              From
            </span>
            <span className="text-lg font-extrabold text-neutral-900 dark:text-white">
              ${flower.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickAdd}
              aria-label={`Quick add ${flower.name} to cart`}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </motion.button>

            <Link
              to={`/flowers/${flower.id}`}
              aria-label={`Customize ${flower.name}`}
              className="inline-flex items-center p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
