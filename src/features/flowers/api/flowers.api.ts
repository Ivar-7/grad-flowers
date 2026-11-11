import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import { FlowerSchema, FlowersListSchema } from '../types/flower.schema'
import type { Flower, FlowerCategory } from '../types/flower.types'

export const OFFICIAL_PRODUCT_IDS = new Set([
  'single',
  'mini',
  'mini-candy',
  'classic',
  'classic-candy',
  'premium',
])

export const SEEDED_FLOWERS: Flower[] = [
  {
    id: 'single',
    name: 'Single',
    whatsInIt: '1 rose, ribbon',
    description:
      'One fresh Kenyan long-stem rose tied with a satin ribbon in your school colours. Simple, sweet, and ready to hand over at the graduation square.',
    price: 50,
    category: 'single',
    imageUrl:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    inStock: true,
    ribbonColors: [
      'Crimson Red',
      'Royal Blue',
      'Gold',
      'Emerald Green',
      'White',
    ],
    schoolColorTags: ['Red', 'Blue', 'Gold', 'Green', 'White'],
    flowerCount: 1,
    includesQrCard: false,
    hasCandy: false,
    meaning: 'Hongera! A quick, heartfelt gesture for a friend or classmate.',
  },
  {
    id: 'mini',
    name: 'Mini',
    whatsInIt: '3 roses, 1 chrysanthemum or gypsophila, wrap',
    description:
      'Three vibrant Kenyan roses paired with fresh white chrysanthemum or delicate gypsophila filler in a crisp celebratory wrap and school ribbon.',
    price: 350,
    category: 'mini',
    imageUrl:
      'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: [
      'Royal Blue',
      'Gold',
      'Crimson Red',
      'Purple',
      'Emerald Green',
    ],
    schoolColorTags: ['Blue', 'Gold', 'Red', 'Purple', 'Green'],
    flowerCount: 4,
    includesQrCard: false,
    hasCandy: false,
    candyUpgradeTargetId: 'mini-candy',
    candyUpgradeLabel: 'Upgrade to Mini Candy (+Chocolate & Success Card)',
    candyUpgradePriceDiff: 150,
    meaning: 'Bright pride and joy — easy to hold for graduation photos.',
  },
  {
    id: 'mini-candy',
    name: 'Mini Candy',
    whatsInIt: 'A Mini plus a chocolate and a success card',
    description:
      'Everything in the Mini bouquet (3 roses, 1 chrysanthemum or gypsophila, wrap) tucked with a treat chocolate bar and a printed graduation success card.',
    price: 500,
    category: 'candy',
    imageUrl:
      'https://images.unsplash.com/photo-1572454591674-2739f30d8c40?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: ['Gold', 'Crimson Red', 'Royal Blue', 'Purple', 'White'],
    schoolColorTags: ['Gold', 'Red', 'Blue', 'Purple', 'White'],
    flowerCount: 4,
    includesQrCard: false,
    hasCandy: true,
    candyBaseId: 'mini',
    meaning: 'Sweet success — blooms, chocolate, and warm wishes in one wrap.',
  },
  {
    id: 'classic',
    name: 'Classic',
    whatsInIt: '6 roses, 3 chrysanthemums or gypsophila, wrap, QR card',
    description:
      'Six rich Kenyan roses arranged with three lush chrysanthemums or gypsophila sprays in signature wrap, complete with a scannable QR voice/video message card.',
    price: 600,
    category: 'classic',
    imageUrl:
      'https://images.unsplash.com/photo-1523693916903-027d144a2b7d?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: [
      'Royal Blue',
      'Gold',
      'Crimson Red',
      'Emerald Green',
      'Purple',
    ],
    schoolColorTags: ['Blue', 'Gold', 'Red', 'Green', 'Purple'],
    flowerCount: 9,
    includesQrCard: true,
    hasCandy: false,
    candyUpgradeTargetId: 'classic-candy',
    candyUpgradeLabel:
      'Upgrade to Classic Candy (+Eclairs, Toffees, Biscuit & Gift Card)',
    candyUpgradePriceDiff: 150,
    meaning:
      'Our signature graduation bouquet with a personal QR voice or video message.',
  },
  {
    id: 'classic-candy',
    name: 'Classic Candy',
    whatsInIt: 'A Classic plus Eclairs, toffees, a biscuit and a gift card',
    description:
      'Our Classic 6-rose & 3-chrysanthemum bouquet with QR message card, loaded with Eclairs, assorted toffees, a celebratory biscuit pack, and a keepsake gift card.',
    price: 750,
    category: 'candy',
    imageUrl:
      'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: [
      'Crimson Red',
      'Gold',
      'Royal Blue',
      'Purple',
      'Emerald Green',
    ],
    schoolColorTags: ['Red', 'Gold', 'Blue', 'Purple', 'Green'],
    flowerCount: 9,
    includesQrCard: true,
    hasCandy: true,
    candyBaseId: 'classic',
    meaning:
      'The ultimate crowd-pleaser — fresh roses, sweet treats, and a QR video/voice message.',
  },
  {
    id: 'premium',
    name: 'Premium',
    whatsInIt: '12 roses, 5 chrysanthemums, double wrap, QR card',
    description:
      'A full dozen long-stem Kenyan roses and five full chrysanthemums dressed in a statement double wrap with satin school ribbon and a scannable QR voice/video message card.',
    price: 1500,
    category: 'premium',
    imageUrl:
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    inStock: true,
    ribbonColors: [
      'Gold & Navy',
      'Crimson & Gold',
      'Emerald & Gold',
      'Royal Purple',
      'Pure White',
    ],
    schoolColorTags: ['Gold', 'Blue', 'Red', 'Green', 'Purple', 'White'],
    flowerCount: 17,
    includesQrCard: true,
    hasCandy: false,
    meaning:
      'Hongera Sana! Our grandest statement bouquet for a once-in-a-lifetime milestone.',
  },
]

function filterCatalogItems(
  items: Flower[],
  category?: FlowerCategory,
  schoolColor?: string,
): Flower[] {
  let data = [...items].sort((a, b) => a.price - b.price)

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

  return data
}

export async function fetchFlowers(
  category?: FlowerCategory,
  schoolColor?: string,
): Promise<Flower[]> {
  try {
    const flowersRef = collection(db, 'flowers')
    const snapshot = await getDocs(flowersRef)

    if (!snapshot.empty) {
      const validDocs: Flower[] = []
      for (const docSnap of snapshot.docs) {
        if (!OFFICIAL_PRODUCT_IDS.has(docSnap.id)) continue
        const parsed = FlowerSchema.safeParse({
          id: docSnap.id,
          ...docSnap.data(),
        })
        if (parsed.success) {
          validDocs.push(parsed.data)
        }
      }

      if (validDocs.length > 0) {
        // Merge any missing official products from SEEDED_FLOWERS so all 6 are always present
        const byId = new Map(validDocs.map((f) => [f.id, f]))
        const merged = SEEDED_FLOWERS.map((seed) => byId.get(seed.id) ?? seed)
        return filterCatalogItems(merged, category, schoolColor)
      }
    }

    return filterCatalogItems(
      FlowersListSchema.parse(SEEDED_FLOWERS),
      category,
      schoolColor,
    )
  } catch (error) {
    const appError = normalizeError(
      error,
      'Unable to load flower bouquets at this time.',
    )
    logError(appError, { feature: 'flowers', action: 'fetchFlowers' })
    return filterCatalogItems(
      FlowersListSchema.parse(SEEDED_FLOWERS),
      category,
      schoolColor,
    )
  }
}

export async function fetchFlowerById(id: string): Promise<Flower | null> {
  try {
    if (OFFICIAL_PRODUCT_IDS.has(id)) {
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

export async function upsertFlowerProduct(flower: Flower): Promise<Flower> {
  const validated = FlowerSchema.parse(flower)
  await setDoc(doc(db, 'flowers', validated.id), validated, { merge: true })
  return validated
}

export async function syncOfficialMenuToFirestore(): Promise<Flower[]> {
  const flowersRef = collection(db, 'flowers')
  const existingSnap = await getDocs(flowersRef)

  // Remove any legacy prototype docs not in OFFICIAL_PRODUCT_IDS
  await Promise.all(
    existingSnap.docs
      .filter((d) => !OFFICIAL_PRODUCT_IDS.has(d.id))
      .map((d) => deleteDoc(doc(db, 'flowers', d.id))),
  )

  // Write the 6 official products
  await Promise.all(
    SEEDED_FLOWERS.map((product) =>
      setDoc(doc(db, 'flowers', product.id), product, { merge: true }),
    ),
  )

  return SEEDED_FLOWERS
}

export async function uploadFlowerPhoto(
  flowerId: string,
  file: File,
): Promise<string> {
  const safeExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storageRef = ref(
    storage,
    `flowers/${flowerId}-${Date.now()}.${safeExt}`,
  )
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}
