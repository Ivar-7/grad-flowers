export type FlowerCategory =
  | 'all'
  | 'bestsellers'
  | 'sunflowers'
  | 'roses'
  | 'orchids'
  | 'leis'
  | 'boutonnieres'
  | 'mixed'

export type StemTier = 'standard' | 'deluxe' | 'grand'

export interface StemTierOption {
  tier: StemTier
  label: string
  stemCount: number
  priceMultiplier: number
}

export interface FlowerAddOn {
  id: string
  name: string
  price: number
  description: string
}

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
  schoolColorTags: string[]
  flowerCount: number
  rating: number
  reviewCount: number
  meaning: string
}

export type FlowerSortOption =
  'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name'

export interface FlowerFilterOptions {
  category: FlowerCategory
  searchQuery: string
  sortBy: FlowerSortOption
  schoolColor?: string
  priceRange?: [number, number]
}
