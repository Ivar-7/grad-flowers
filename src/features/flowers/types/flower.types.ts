export type FlowerCategory =
  'all' | 'bestsellers' | 'single' | 'mini' | 'classic' | 'candy' | 'premium'

export interface Flower {
  id: string
  name: string
  whatsInIt: string
  description: string
  price: number
  category: FlowerCategory
  imageUrl: string
  isFeatured: boolean
  inStock: boolean
  ribbonColors: string[]
  schoolColorTags: string[]
  flowerCount: number
  includesQrCard: boolean
  hasCandy: boolean
  candyUpgradeTargetId?: string
  candyUpgradeLabel?: string
  candyUpgradePriceDiff?: number
  candyBaseId?: string
  meaning: string
}

export type FlowerSortOption = 'price-asc' | 'price-desc' | 'featured' | 'name'

export interface FlowerFilterOptions {
  category: FlowerCategory
  searchQuery: string
  sortBy: FlowerSortOption
  schoolColor?: string
}
