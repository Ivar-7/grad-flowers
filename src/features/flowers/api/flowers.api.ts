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
import type { Flower, FlowerCategory } from '../types/flower.types'

const SEEDED_FLOWERS: Flower[] = [
  {
    id: 'grad-sunflower-joy',
    name: 'Summa Cum Laude Sunflower Bouquet',
    description:
      'Bright premium sunflowers accented with royal blue graduation ribbons and golden statice.',
    price: 64.99,
    category: 'sunflowers',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Navy Blue', 'Gold', 'Classic Black'],
    flowerCount: 15,
  },
  {
    id: 'grad-crimson-roses',
    name: 'Valedictorian Crimson Roses',
    description:
      'Two dozen velvety long-stem red roses wrapped in crisp parchment with custom gold lettering.',
    price: 89.99,
    category: 'roses',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Crimson', 'Silver', 'Gold'],
    flowerCount: 24,
  },
  {
    id: 'grad-regal-orchids',
    name: 'Honor Society Purple Orchids',
    description:
      'Exotic phalaenopsis orchids combined with white lilies and eucalyptus stems.',
    price: 79.99,
    category: 'orchids',
    imageUrl:
      'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Royal Purple', 'Pearl White'],
    flowerCount: 10,
  },
  {
    id: 'grad-milestone-mix',
    name: 'Diplomat Pastel Mixed Meadow',
    description:
      'Pastel peonies, garden roses, and snapdragons celebrating high honors and future journeys.',
    price: 74.99,
    category: 'mixed',
    imageUrl:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Rose Gold', 'Lavender', 'Champagne'],
    flowerCount: 18,
  },
  {
    id: 'grad-pure-white-roses',
    name: 'Alumni Pure White Roses',
    description:
      'Pure white avalanche roses signifying new beginnings and boundless graduate potential.',
    price: 68.99,
    category: 'roses',
    imageUrl:
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Ivory', 'Gold', 'Forest Green'],
    flowerCount: 16,
  },
  {
    id: 'grad-golden-sunburst',
    name: 'Scholar Golden Sunburst',
    description:
      'Mini sunflowers, yellow spray roses, and solidago in an easy-to-carry commencement sheath.',
    price: 54.99,
    category: 'sunflowers',
    imageUrl:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: ['Gold', 'Black'],
    flowerCount: 12,
  },
]

export async function fetchFlowers(
  category?: FlowerCategory,
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
      // Boundary validation
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

    // Fallback to validated seeded catalog
    let data = SEEDED_FLOWERS
    if (category === 'bestsellers') {
      data = data.filter((item) => item.isFeatured)
    } else if (category && category !== 'all') {
      data = data.filter((item) => item.category === category)
    }
    return FlowersListSchema.parse(data)
  } catch (error) {
    const appError = normalizeError(
      error,
      'Unable to load flower bouquets at this time.',
    )
    logError(appError, { feature: 'flowers', action: 'fetchFlowers' })
    // Return fallback seeds rather than leaving the user blocked
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
