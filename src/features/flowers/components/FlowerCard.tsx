import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { QrCode, Plus, Check, Candy, Zap } from 'lucide-react'
import type { Flower } from '../types/flower.types'
import { SEEDED_FLOWERS } from '../api/flowers.api'
import { useCart } from '@/features/cart/state/useCart'
import { Badge } from '@/shared/ui/Badge'
import { Card } from '@/shared/ui/Card'
import { formatKsh } from '@/shared/utils/currency'

export interface FlowerCardProps {
  flower: Flower
}

export function FlowerCard({ flower }: FlowerCardProps) {
  const { addItem, openQuickOrder } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [candyUpgradeOn, setCandyUpgradeOn] = useState(false)

  // If this flower has a candy upgrade target (e.g. Mini -> Mini Candy, Classic -> Classic Candy)
  const upgradeTarget = flower.candyUpgradeTargetId
    ? (SEEDED_FLOWERS.find((f) => f.id === flower.candyUpgradeTargetId) ?? null)
    : null

  const activeFlower = candyUpgradeOn && upgradeTarget ? upgradeTarget : flower

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      flowerId: activeFlower.id,
      name: activeFlower.name,
      whatsInIt: activeFlower.whatsInIt,
      imageUrl: activeFlower.imageUrl,
      category: activeFlower.category,
      basePrice: activeFlower.price,
      tier: 'standard',
      tierLabel: activeFlower.whatsInIt,
      unitPrice: activeFlower.price,
      quantity: 1,
      ribbonColor: activeFlower.ribbonColors[0] || 'Crimson Red',
      addOns: [],
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  const handleBuyIn60s = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickOrder({ flowerId: activeFlower.id })
  }

  return (
    <Card
      hoverable
      className="group flex flex-col h-full overflow-hidden p-0 border-neutral-200 dark:border-neutral-800"
    >
      <Link
        to={`/flowers/${activeFlower.id}`}
        className="block relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        <img
          src={activeFlower.imageUrl}
          alt={activeFlower.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {activeFlower.includesQrCard && (
            <Badge
              variant="default"
              className="bg-neutral-900/80 text-white border-white/20 backdrop-blur-md gap-1 text-xs"
            >
              <QrCode className="h-3 w-3 text-amber-300" />
              <span>QR Voice/Video Card</span>
            </Badge>
          )}
          {activeFlower.hasCandy && (
            <Badge
              variant="warning"
              className="bg-amber-500 text-neutral-950 dark:bg-amber-500 dark:text-neutral-950 font-bold gap-1 text-xs"
            >
              <Candy className="h-3 w-3" />
              <span>Candy Combo</span>
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
          <span className="rounded-lg bg-black/65 backdrop-blur-md px-2.5 py-1">
            {activeFlower.whatsInIt}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/flowers/${activeFlower.id}`}>
            <h3 className="font-display text-2xl leading-tight font-semibold text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              {activeFlower.name}
            </h3>
          </Link>
          <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
            {formatKsh(activeFlower.price)}
          </span>
        </div>

        <div className="mt-1.5 flex-1">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
            {activeFlower.description}
          </p>
        </div>

        {/* Interactive Candy Upgrade Toggle for Mini & Classic */}
        {upgradeTarget && (
          <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setCandyUpgradeOn((prev) => !prev)}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                candyUpgradeOn
                  ? 'border-amber-500 bg-amber-50/90 text-amber-950 dark:bg-amber-950/40 dark:border-amber-500/70 dark:text-amber-200 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:border-amber-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Candy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>
                  {candyUpgradeOn
                    ? `Upgraded to ${upgradeTarget.name} (${formatKsh(upgradeTarget.price)})`
                    : `Add Candy Upgrade (+${formatKsh(flower.candyUpgradePriceDiff ?? 150)})`}
                </span>
              </span>
              <span
                className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  candyUpgradeOn
                    ? 'bg-amber-500 justify-end'
                    : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-white shadow-2xs" />
              </span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handleBuyIn60s}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Buy in 60s</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handleQuickAdd}
            aria-label={`Add ${activeFlower.name} to basket`}
            className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              justAdded
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                <span>Basket</span>
              </>
            )}
          </motion.button>

          <Link
            to={`/flowers/${activeFlower.id}`}
            className="inline-flex items-center px-2 py-2 rounded-xl text-xs font-semibold text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:decoration-neutral-700 dark:hover:text-white transition-colors"
            aria-label={`${activeFlower.name} details: ribbon and QR message`}
          >
            Details
          </Link>
        </div>
      </div>
    </Card>
  )
}
