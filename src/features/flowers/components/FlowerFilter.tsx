import { Search, X, Palette } from 'lucide-react'
import type { FlowerCategory, FlowerSortOption } from '../types/flower.types'
import { cn } from '@/shared/utils/cn'

export interface FlowerFilterProps {
  selectedCategory: FlowerCategory
  onCategoryChange: (category: FlowerCategory) => void
  selectedColor: string
  onColorChange: (color: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: FlowerSortOption
  onSortChange: (sort: FlowerSortOption) => void
}

const CATEGORIES: { id: FlowerCategory; label: string }[] = [
  { id: 'all', label: 'All Bouquets' },
  { id: 'bestsellers', label: 'Commencement Bestsellers' },
  { id: 'sunflowers', label: 'Sunflowers' },
  { id: 'roses', label: 'Roses' },
  { id: 'orchids', label: 'Orchids' },
  { id: 'leis', label: 'Graduation Leis' },
  { id: 'boutonnieres', label: 'Corsages & Lapels' },
  { id: 'mixed', label: 'Celebration Meadows' },
]

const SCHOOL_COLORS: { id: string; label: string; dotClass: string }[] = [
  { id: 'all', label: 'All School Colors', dotClass: 'bg-indigo-500' },
  { id: 'Blue', label: 'Navy & Blue', dotClass: 'bg-blue-700' },
  { id: 'Gold', label: 'Gold & Maize', dotClass: 'bg-amber-400' },
  { id: 'Crimson', label: 'Crimson & Red', dotClass: 'bg-red-700' },
  { id: 'Purple', label: 'Royal Purple', dotClass: 'bg-purple-700' },
  { id: 'Green', label: 'Emerald & Forest', dotClass: 'bg-emerald-700' },
  { id: 'White', label: 'White & Silver', dotClass: 'bg-neutral-300' },
]

export function FlowerFilter({
  selectedCategory,
  onCategoryChange,
  selectedColor,
  onColorChange,
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
            placeholder="Search sunflowers, leis, crimson roses, school colors..."
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="flower-sort"
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="flower-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as FlowerSortOption)}
            className="px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="featured">Honors / Featured First</option>
            <option value="rating">Top Rated by Graduates</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

      {/* School Color Ribbon Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 shrink-0 mr-1">
          <Palette className="h-3.5 w-3.5 text-indigo-500" />
          <span>Alma Mater Color:</span>
        </span>
        {SCHOOL_COLORS.map((color) => {
          const isSelected =
            selectedColor.toLowerCase() === color.id.toLowerCase()
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onColorChange(color.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700',
              )}
            >
              {color.id !== 'all' && (
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full border border-black/10',
                    color.dotClass,
                  )}
                />
              )}
              <span>{color.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
