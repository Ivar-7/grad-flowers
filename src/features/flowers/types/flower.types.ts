export type FlowerCategory =
  'all' | 'bestsellers' | 'roses' | 'sunflowers' | 'orchids' | 'mixed'

export interface Flower {
  id: string
  name: string
  description: string
  price: number
  category: FlowerCategory
  imageUrl: string
  isFeatured: boolean
  inStock: boolean
  ribbonColors: string[]
  flowerCount: number
}

export type FlowerSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

export interface FlowerFilterOptions {
  category: FlowerCategory
  searchQuery: string
  sortBy: FlowerSortOption
}
