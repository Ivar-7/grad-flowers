import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'

const CATEGORY_TILES = [
  {
    title: 'Commencement Sunflowers',
    tagline: 'Radiant optimism for bright futures ahead',
    meaning: 'Adoration & Loyalty',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    category: 'sunflowers',
    stemInfo: 'From KSh 5,000',
  },
  {
    title: 'Valedictorian Roses',
    tagline: 'Velvety crimson & pure white avalanche stems',
    meaning: 'High Academic Honors',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    category: 'roses',
    stemInfo: 'From KSh 6,900',
  },
  {
    title: 'Ceremonial Orchid Leis',
    tagline: 'Authentic 100-bloom Hawaiian graduation leis',
    meaning: 'Aloha & Milestone Respect',
    imageUrl:
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
    category: 'leis',
    stemInfo: 'From KSh 6,000',
  },
  {
    title: 'Gown Corsages & Boutonnieres',
    tagline: 'Magnetic lapel pins that protect graduation gowns',
    meaning: 'Formal Ceremony Poise',
    imageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    category: 'boutonnieres',
    stemInfo: 'From KSh 2,500',
  },
]

export function CategoryShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="default" className="mb-3 gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Curated Floral Traditions</span>
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Shop by Graduation Tradition
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Hand-tied bouquets, ceremonial orchid leis, and magnetic gown
              corsages crafted for ceremony stages.
            </p>
          </div>

          <Link
            to="/flowers"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View all 12 arrangements</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.title}
              to={`/flowers?category=${cat.category}`}
              className="group block"
            >
              <Card
                hoverable
                className="overflow-hidden p-0 border-neutral-200 dark:border-neutral-800 h-full flex flex-col"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-white">
                    {cat.meaning}
                  </span>
                  <span className="absolute bottom-3 left-3 text-xs font-bold text-white">
                    {cat.stemInfo}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {cat.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Shop Collection</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
