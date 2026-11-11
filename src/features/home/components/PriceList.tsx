import { useCart } from '@/features/cart/state/useCart'
import type { Flower } from '@/features/flowers/types/flower.types'
import { formatKsh } from '@/shared/utils/currency'
import { cn } from '@/shared/utils/cn'

const SKELETON_ROWS = ['a', 'b', 'c', 'd', 'e', 'f']

export interface PriceListProps {
  flowers: Flower[]
  isLoading: boolean
  className?: string
}

export function PriceList({ flowers, isLoading, className }: PriceListProps) {
  const { openQuickOrder } = useCart()

  if (!isLoading && flowers.length === 0) return null

  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-neutral-900/5 dark:bg-neutral-900 dark:ring-white/10',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-white">
          Price list
        </h2>
        <span className="text-xs tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          Tap to order
        </span>
      </div>

      {isLoading ? (
        <div role="status" className="space-y-4 pt-4">
          {SKELETON_ROWS.map((row) => (
            <div
              key={row}
              className="h-5 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
          <span className="sr-only">Loading prices</span>
        </div>
      ) : (
        <ul className="pt-1">
          {flowers.map((flower) => (
            <li key={flower.id}>
              <button
                type="button"
                onClick={() => openQuickOrder({ flowerId: flower.id })}
                className="group flex w-full cursor-pointer items-baseline gap-2 rounded-md py-2 text-left focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                <span className="font-display text-lg font-medium text-neutral-900 transition-colors group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400">
                  {flower.name}
                </span>
                <span
                  aria-hidden="true"
                  className="flex-1 border-b border-dotted border-neutral-300 dark:border-neutral-700"
                />
                <span className="text-sm font-semibold text-neutral-900 tabular-nums dark:text-white">
                  {formatKsh(flower.price)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
