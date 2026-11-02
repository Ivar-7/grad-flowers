import { Search } from 'lucide-react'
import type { FlowerCategory, FlowerSortOption } from '../types/flower.types'
import { cn } from '@/shared/utils/cn'

export interface FlowerFilterProps {
  selectedCategory: FlowerCategory
  onCategoryChange: (category: FlowerCategory) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: FlowerSortOption
  onSortChange: (sort: FlowerSortOption) => void
}

const CATEGORIES: { id: FlowerCategory; label: string }[] = [
  { id: 'all', label: 'All Bouquets' },
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'roses', label: 'Roses' },
  { id: 'sunflowers', label: 'Sunflowers' },
  { id: 'orchids', label: 'Orchids' },
  { id: 'mixed', label: 'Mixed Meadows' },
]

export function FlowerFilter({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: FlowerFilterProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roses, sunflowers, honors ribbons..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="flower-sort"
            className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="flower-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as FlowerSortOption)}
            className="px-3 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
