import { Minus, Plus, Trash2, Tag, QrCode, MessageSquare } from 'lucide-react'
import type { CartItem } from '../types/cart.types'
import { Badge } from '@/shared/ui/Badge'
import { formatKsh } from '@/shared/utils/currency'

export interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800/80">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {item.name}
              </h4>
              {item.whatsInIt && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.whatsInIt}
                </p>
              )}
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white whitespace-nowrap">
              {formatKsh(item.totalPrice)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant="purple" className="text-xs py-0 px-2 gap-1">
              <Tag className="h-2.5 w-2.5" />
              <span>{item.ribbonColor} Ribbon</span>
            </Badge>
            {item.qrMessageId && (
              <Badge variant="success" className="text-xs py-0 px-2 gap-1">
                <QrCode className="h-2.5 w-2.5" />
                <span>QR Message Attached</span>
              </Badge>
            )}
          </div>

          {item.ribbonCustomText && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium line-clamp-1">
              Ribbon note: &ldquo;{item.ribbonCustomText}&rdquo;
            </p>
          )}

          {item.cardMessage && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 italic line-clamp-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3 shrink-0" />
              <span>&ldquo;{item.cardMessage}&rdquo;</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="p-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-neutral-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="p-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
