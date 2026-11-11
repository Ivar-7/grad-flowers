import { useSearchParams } from 'react-router-dom'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { MapPin, QrCode, Candy, Zap, Sparkles } from 'lucide-react'
import { useFlowers } from '../state/useFlowers'
import { FlowerFilter } from '../components/FlowerFilter'
import { FlowerGrid } from '../components/FlowerGrid'
import { SEEDED_FLOWERS } from '../api/flowers.api'
import type { FlowerCategory } from '../types/flower.types'
import { useCart } from '@/features/cart/state/useCart'
import { formatKsh } from '@/shared/utils/currency'

export function FlowersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam =
    (searchParams.get('category') as FlowerCategory) || 'all'
  const colorParam = searchParams.get('color') || 'all'

  return (
    <FlowersCatalog
      key={`${categoryParam}-${colorParam}`}
      categoryParam={categoryParam}
      colorParam={colorParam}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    />
  )
}

interface FlowersCatalogProps {
  categoryParam: FlowerCategory
  colorParam: string
  searchParams: URLSearchParams
  setSearchParams: ReturnType<typeof useSearchParams>[1]
}

function FlowersCatalog({
  categoryParam,
  colorParam,
  searchParams,
  setSearchParams,
}: FlowersCatalogProps) {
  const { openQuickOrder } = useCart()
  const {
    flowers,
    isLoading,
    isEmpty,
    error,
    refetch,
    selectedCategory,
    setSelectedCategory,
    selectedColor,
    setSelectedColor,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useFlowers({ initialCategory: categoryParam, initialColor: colorParam })

  const handleCategoryChange = (category: FlowerCategory) => {
    setSelectedCategory(category)
    if (category === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    if (color === 'all') {
      searchParams.delete('color')
    } else {
      searchParams.set('color', color)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSelectedColor('all')
    setSearchQuery('')
    searchParams.delete('category')
    searchParams.delete('color')
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-3 gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Hongera! Official Graduation Menu</span>
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Six Products. One Clear Price List.
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Fresh Kenyan roses, candy upgrades, and scannable QR voice/video
            message cards — ready for collection at your campus graduation
            station.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => openQuickOrder()}
          leftIcon={<Zap className="h-5 w-5" />}
          className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
        >
          Order in 60 Seconds
        </Button>
      </div>

      {/* Official Price List Table */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <div className="bg-neutral-50 dark:bg-neutral-950 px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Official Menu & Price List (No Hidden Fees)
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Pay via M-Pesa • Collect at Station
          </span>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {SEEDED_FLOWERS.map((prod) => (
            <div
              key={prod.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-neutral-900 dark:text-white w-32 shrink-0">
                  {prod.name}
                </span>
                <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  {prod.whatsInIt}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {formatKsh(prod.price)}
                </span>
                <button
                  type="button"
                  onClick={() => openQuickOrder({ flowerId: prod.id })}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Buy Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-xs sm:text-sm dark:border-rose-950/60 dark:bg-rose-950/20 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
          <Candy className="h-4 w-4 text-amber-500 shrink-0" />
          <span>1-Tap Candy Upgrade on Mini & Classic (+KSh 150)</span>
        </div>
        <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
          <QrCode className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Voice & Video QR Cards on Classic & Premium</span>
        </div>
        <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Instant M-Pesa Checkout & Campus Station Pickup</span>
        </div>
      </div>

      <FlowerFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <FlowerGrid
        flowers={flowers}
        isLoading={isLoading}
        isEmpty={isEmpty}
        error={error}
        onRetry={refetch}
        onResetFilter={handleResetFilters}
      />
    </div>
  )
}

export default FlowersPage
