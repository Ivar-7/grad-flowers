import { useSearchParams } from 'react-router-dom'
import { useFlowers } from '../state/useFlowers'
import { FlowerFilter } from '../components/FlowerFilter'
import { FlowerGrid } from '../components/FlowerGrid'
import type { FlowerCategory } from '../types/flower.types'

export function FlowersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam =
    (searchParams.get('category') as FlowerCategory) || 'all'

  const {
    flowers,
    isLoading,
    isEmpty,
    error,
    refetch,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useFlowers({ initialCategory: categoryParam })

  const handleCategoryChange = (category: FlowerCategory) => {
    setSelectedCategory(category)
    if (category === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSearchQuery('')
    searchParams.delete('category')
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-2">
          Graduation Floral Collection
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          Hand-tied commencement bouquets, honor cords pairings, and custom
          ribbons for high school, college, and doctoral graduates.
        </p>
      </div>

      <FlowerFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
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
