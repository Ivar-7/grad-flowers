import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import { FlowerSchema, FlowersListSchema } from '../types/flower.schema'
import type {
  Flower,
  FlowerCategory,
  FlowerAddOn,
  StemTierOption,
} from '../types/flower.types'

export const STEM_TIER_OPTIONS: StemTierOption[] = [
  {
    tier: 'standard',
    label: 'Standard Ceremony',
    stemCount: 12,
    priceMultiplier: 1.0,
  },
  {
    tier: 'deluxe',
    label: 'Deluxe Celebration (+50% stems)',
    stemCount: 18,
    priceMultiplier: 1.35,
  },
  {
    tier: 'grand',
    label: 'Grand Honors (+100% stems)',
    stemCount: 24,
    priceMultiplier: 1.7,
  },
]

export const FLOWER_ADD_ONS: FlowerAddOn[] = [
  {
    id: 'addon-grad-bear',
    name: 'Class of 2026 Plush Graduate Bear',
    price: 14.99,
    description:
      'Adoral keepsake bear wearing miniature mortarboard cap & diploma',
  },
  {
    id: 'addon-crystal-vase',
    name: 'Commemorative Glass Presentation Vase',
    price: 18.99,
    description:
      'Heavy fluted glass vase to keep stems fresh during family banquets',
  },
  {
    id: 'addon-grad-balloon',
    name: 'Foil "Congrats Grad!" Helium Balloon',
    price: 6.99,
    description: '18-inch metallic star balloon with shimmering satin ribbon',
  },
  {
    id: 'addon-honor-cord',
    name: 'Decorative Gold Honor Cord Charm',
    price: 9.99,
    description:
      'Braided ceremonial double-tassel woven directly into the bouquet wrap',
  },
]

export const SEEDED_FLOWERS: Flower[] = [
  {
    id: 'grad-sunflower-joy',
    name: 'Summa Cum Laude Sunflower Bouquet',
    description:
      'Lush golden sunflowers symbolizing bright futures and optimism, hand-tied with royal blue satin ribbon and solidago spray.',
    price: 64.99,
    category: 'sunflowers',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Navy Blue', 'Gold', 'Classic Black', 'Forest Green'],
    schoolColorTags: ['Blue', 'Gold', 'Navy', 'Yellow'],
    flowerCount: 15,
    rating: 4.95,
    reviewCount: 148,
    meaning: 'Adoration, Loyalty, and a Bright Bright Future Ahead',
  },
  {
    id: 'grad-crimson-roses',
    name: 'Valedictorian Crimson Velvet Roses',
    description:
      'Two dozen velvety long-stem red roses in crisp parchment wrap with custom embossed gold commencement lettering.',
    price: 89.99,
    category: 'roses',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Crimson Red', 'Silver', 'Gold', 'Black'],
    schoolColorTags: ['Red', 'Crimson', 'Silver', 'White'],
    flowerCount: 24,
    rating: 4.98,
    reviewCount: 232,
    meaning: 'Deep Respect, Distinction, and High Academic Honors',
  },
  {
    id: 'grad-regal-orchids',
    name: 'Honor Society Purple Dendrobium Orchids',
    description:
      'Exquisite spray of purple dendrobium orchids, baby eucalyptus, and white snapdragons for distinction and regal elegance.',
    price: 79.99,
    category: 'orchids',
    imageUrl:
      'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Royal Purple', 'Pearl White', 'Silver'],
    schoolColorTags: ['Purple', 'White', 'Silver'],
    flowerCount: 16,
    rating: 4.88,
    reviewCount: 94,
    meaning: 'Elegance, Pride, Dignity, and Unwavering Dedication',
  },
  {
    id: 'grad-milestone-mix',
    name: 'Diplomat Pastel Mixed Meadow',
    description:
      'Joyous harmony of garden peonies, ranunculus, peach roses, and fragrant stock celebrating milestone diplomas.',
    price: 74.99,
    category: 'mixed',
    imageUrl:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Rose Gold', 'Lavender', 'Champagne', 'Blush'],
    schoolColorTags: ['Pink', 'Peach', 'Gold', 'White'],
    flowerCount: 18,
    rating: 4.92,
    reviewCount: 165,
    meaning: 'Celebration, Everlasting Friendship, and Boundless Joy',
  },
  {
    id: 'grad-pure-white-roses',
    name: 'Alumni Pure White Avalanche Roses',
    description:
      'Immaculate Ecuadorian white avalanche roses accented with seeded eucalyptus, signifying integrity and fresh beginnings.',
    price: 68.99,
    category: 'roses',
    imageUrl:
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Ivory White', 'Gold', 'Forest Green', 'Navy'],
    schoolColorTags: ['White', 'Ivory', 'Gold', 'Green'],
    flowerCount: 16,
    rating: 4.89,
    reviewCount: 112,
    meaning: 'New Beginnings, Wisdom, Integrity, and Boundless Potential',
  },
  {
    id: 'grad-golden-sunburst',
    name: 'Scholar Petite Golden Sunburst',
    description:
      'Easy-to-carry hand bouquet designed specifically for graduates walking across the stage or tossing caps.',
    price: 49.99,
    category: 'sunflowers',
    imageUrl:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Gold', 'Black', 'Emerald Green'],
    schoolColorTags: ['Gold', 'Black', 'Yellow'],
    flowerCount: 10,
    rating: 4.85,
    reviewCount: 79,
    meaning: 'Radiant Achievement, Joy, and Boundless Hope',
  },
  {
    id: 'grad-double-orchid-lei',
    name: 'Commencement Double Purple Orchid Lei',
    description:
      'Fresh Hawaiian-style ceremonial orchid lei hand-strung with over 100 purple dendrobium florets. The ultimate commencement honor.',
    price: 59.99,
    category: 'leis',
    imageUrl:
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Royal Purple', 'Navy Blue', 'Crimson Red', 'Gold'],
    schoolColorTags: ['Purple', 'Navy', 'Gold'],
    flowerCount: 100,
    rating: 4.97,
    reviewCount: 310,
    meaning: 'Aloha, Deep Honor, Blessing, and Milestone Respect',
  },
  {
    id: 'grad-sunshine-kukui-lei',
    name: 'Island Sunshine Orchid & Kukui Nut Lei',
    description:
      'Traditional polished brown kukui nuts interwoven with yellow spray orchid blooms and celebratory ribbons.',
    price: 64.99,
    category: 'leis',
    imageUrl:
      'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Maize Gold', 'Forest Green', 'Black'],
    schoolColorTags: ['Gold', 'Green', 'Brown'],
    flowerCount: 40,
    rating: 4.91,
    reviewCount: 88,
    meaning: 'Wisdom, Protection, Enlightenment, and Prosperity',
  },
  {
    id: 'grad-gold-corsage-set',
    name: 'Commencement Gown Corsage & Boutonniere Set',
    description:
      'Matching wrist corsage and magnetic lapel boutonniere crafted with white spray roses, gold ribbon, and Italian ruscus.',
    price: 42.99,
    category: 'boutonnieres',
    imageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Gold', 'Silver', 'Navy', 'Burgundy'],
    schoolColorTags: ['White', 'Gold', 'Silver'],
    flowerCount: 6,
    rating: 4.86,
    reviewCount: 64,
    meaning: 'Grace, Elegance, and Formal Ceremony Poise',
  },
  {
    id: 'grad-sapphire-roses',
    name: 'Sapphire & Gold Honors Rose Bouquet',
    description:
      'Two-tone tinted blue and golden cream roses celebrating university pride and honorary academic degrees.',
    price: 84.99,
    category: 'roses',
    imageUrl:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Navy Blue', 'Gold', 'White'],
    schoolColorTags: ['Blue', 'Gold', 'Navy'],
    flowerCount: 20,
    rating: 4.94,
    reviewCount: 142,
    meaning: 'Academic Excellence, Truth, and High Distinction',
  },
  {
    id: 'grad-orchid-boutonniere',
    name: 'Royal Honors Dendrobium Lapel Boutonniere',
    description:
      'Single pristine purple dendrobium orchid with satin ribbon collar and magnetic backing to protect graduation gowns.',
    price: 24.99,
    category: 'boutonnieres',
    imageUrl:
      'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Purple', 'Navy', 'Silver', 'Gold'],
    schoolColorTags: ['Purple', 'Silver'],
    flowerCount: 3,
    rating: 4.82,
    reviewCount: 52,
    meaning: 'Dignity, Academic Focus, and High Commendation',
  },
  {
    id: 'grad-grand-chancellor',
    name: 'Chancellor Grand 36-Stem Celebration Cascade',
    description:
      'Our crowning glory: 36 stems of garden roses, calla lilies, sunflowers, and delphiniums in a massive celebratory cascade.',
    price: 139.99,
    category: 'mixed',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Double Gold & Navy', 'Crimson & Silver', 'Imperial Purple'],
    schoolColorTags: ['Gold', 'Blue', 'Purple', 'Red'],
    flowerCount: 36,
    rating: 5.0,
    reviewCount: 96,
    meaning: 'Highest Honors, Pinnacle of Success, and Supreme Pride',
  },
]

export async function fetchFlowers(
  category?: FlowerCategory,
  schoolColor?: string,
): Promise<Flower[]> {
  try {
    const flowersRef = collection(db, 'flowers')
    const q =
      category && category !== 'all' && category !== 'bestsellers'
        ? query(flowersRef, where('category', '==', category))
        : flowersRef

    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const rawData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      const parsed = FlowersListSchema.safeParse(rawData)
      if (parsed.success) {
        return parsed.data
      }
      logError(
        normalizeError(
          parsed.error,
          'Invalid flower data received from remote database.',
        ),
      )
    }

    // Fallback to seeded catalog
    let data = [...SEEDED_FLOWERS]

    if (category === 'bestsellers') {
      data = data.filter((item) => item.isFeatured)
    } else if (category && category !== 'all') {
      data = data.filter((item) => item.category === category)
    }

    if (schoolColor && schoolColor !== 'all') {
      const colorLower = schoolColor.toLowerCase()
      data = data.filter((item) =>
        item.schoolColorTags.some((tag) => tag.toLowerCase() === colorLower),
      )
    }

    return FlowersListSchema.parse(data)
  } catch (error) {
    const appError = normalizeError(
      error,
      'Unable to load flower bouquets at this time.',
    )
    logError(appError, { feature: 'flowers', action: 'fetchFlowers' })
    return FlowersListSchema.parse(SEEDED_FLOWERS)
  }
}

export async function fetchFlowerById(id: string): Promise<Flower | null> {
  try {
    const flowerDoc = await getDoc(doc(db, 'flowers', id))
    if (flowerDoc.exists()) {
      const parsed = FlowerSchema.safeParse({
        id: flowerDoc.id,
        ...flowerDoc.data(),
      })
      if (parsed.success) {
        return parsed.data
      }
    }

    const fallback = SEEDED_FLOWERS.find((f) => f.id === id)
    return fallback ? FlowerSchema.parse(fallback) : null
  } catch (error) {
    const appError = normalizeError(error, 'Unable to load bouquet details.')
    logError(appError, {
      feature: 'flowers',
      action: 'fetchFlowerById',
      metadata: { id },
    })
    const fallback = SEEDED_FLOWERS.find((f) => f.id === id)
    return fallback ? FlowerSchema.parse(fallback) : null
  }
}
