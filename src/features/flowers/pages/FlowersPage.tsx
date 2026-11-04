import { useSearchParams } from 'react-router-dom'
import { Badge } from '@/shared/ui/Badge'
import { Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { useFlowers } from '../state/useFlowers'
import { FlowerFilter } from '../components/FlowerFilter'
import { FlowerGrid } from '../components/FlowerGrid'
import type { FlowerCategory } from '../types/flower.types'

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
  const {
    flowers,
    totalCount,
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
      <div className="mb-8">
        <Badge variant="purple" className="mb-3 gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Curated for commencement season</span>
        </Badge>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Graduation Floral Collection
            </h1>
            <p className="mt-2 max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
              Hand-tied commencement bouquets, honor cord pairings, and custom
              ribbons for every graduate and school color.
            </p>
          </div>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {totalCount} {totalCount === 1 ? 'arrangement' : 'arrangements'}{' '}
            available
          </span>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm dark:border-indigo-950/60 dark:bg-indigo-950/20 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Truck className="h-4 w-4 shrink-0" />
          <span>Ceremony-day campus delivery</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Freshness guarantee on every order</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>Personalize ribbons and keepsakes</span>
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
