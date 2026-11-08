import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Palette, ArrowRight, Sparkles, Tag, Check } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'

interface SchoolPreset {
  school: string
  colors: string
  campuses: string
  primaryClass: string
  secondaryClass: string
  ribbonBgClass: string
  query: string
  recommendedBouquet: {
    id: string
    name: string
    price: string
    imageUrl: string
  }
}

const PRESETS: SchoolPreset[] = [
  {
    school: 'Blue & Gold',
    colors: 'Navy Blue & Metallic Gold',
    campuses: 'UC Berkeley, UCLA, Michigan, Pitt, Notre Dame',
    primaryClass: 'bg-blue-800',
    secondaryClass: 'bg-amber-400',
    ribbonBgClass: 'bg-blue-900 border-amber-400/50 text-amber-300',
    query: 'Blue',
    recommendedBouquet: {
      id: 'grad-grand-chancellor',
      name: 'Chancellor Grand 36-Stem Celebration Cascade',
      price: 'KSh 14,000',
      imageUrl:
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    school: 'Crimson & Silver',
    colors: 'Crimson Velvet & Silver Mist',
    campuses: 'Harvard, Stanford, Alabama, Cornell, Indiana',
    primaryClass: 'bg-red-800',
    secondaryClass: 'bg-neutral-300',
    ribbonBgClass: 'bg-rose-950 border-amber-300/50 text-amber-200',
    query: 'Crimson',
    recommendedBouquet: {
      id: 'grad-crimson-roses',
      name: 'Valedictorian Crimson Velvet Roses',
      price: 'KSh 9,000',
      imageUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    school: 'Purple & White',
    colors: 'Royal Purple & Pearl White',
    campuses: 'NYU, Northwestern, UW, TCU, Amherst',
    primaryClass: 'bg-purple-800',
    secondaryClass: 'bg-neutral-100',
    ribbonBgClass: 'bg-purple-950 border-amber-300/50 text-amber-300',
    query: 'Purple',
    recommendedBouquet: {
      id: 'grad-double-orchid-lei',
      name: 'Commencement Double Purple Orchid Lei',
      price: 'KSh 6,000',
      imageUrl:
        'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    school: 'Emerald & Gold',
    colors: 'Deep Emerald & Champagne Gold',
    campuses: 'Baylor, Oregon, USF, Dartmouth, Cal Poly',
    primaryClass: 'bg-emerald-800',
    secondaryClass: 'bg-amber-300',
    ribbonBgClass: 'bg-emerald-950 border-amber-400/50 text-amber-300',
    query: 'Green',
    recommendedBouquet: {
      id: 'grad-pure-white-roses',
      name: 'Alumni Pure White Avalanche Roses',
      price: 'KSh 6,900',
      imageUrl:
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    school: 'Black & Gold',
    colors: 'Classic Black & Golden Radiance',
    campuses: 'Purdue, Vanderbilt, Wake Forest, Iowa, UCF',
    primaryClass: 'bg-neutral-900',
    secondaryClass: 'bg-amber-400',
    ribbonBgClass: 'bg-neutral-950 border-amber-400/60 text-amber-400',
    query: 'Gold',
    recommendedBouquet: {
      id: 'grad-golden-sunburst',
      name: 'Scholar Petite Golden Sunburst',
      price: 'KSh 5,000',
      imageUrl:
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
    },
  },
]

const SAMPLE_INSCRIPTIONS = [
  'Class of 2026 • Summa Cum Laude',
  'Congratulations Graduate! So Proud of You',
  'Class of 2026 • B.S. Honors',
]

export function SchoolColorsMatcher() {
  const [selectedPreset, setSelectedPreset] = useState<SchoolPreset>(
    PRESETS[0]!,
  )
  const [customRibbonText, setCustomRibbonText] = useState<string>(
    SAMPLE_INSCRIPTIONS[0]!,
  )

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-neutral-950 dark:via-indigo-950/20 dark:to-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Header, Alma Mater Selector & Live Inscription Input */}
          <div className="lg:col-span-6 text-left">
            <Badge variant="info" className="mb-4 gap-1.5 px-3 py-1">
              <Palette className="h-3.5 w-3.5" />
              <span>Interactive School Color & Ribbon Studio</span>
            </Badge>

            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Match Bouquets with Your Alma Mater
            </h2>

            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every commencement is defined by university tradition. Choose your
              school palette below and test-drive our complimentary 24K gold
              foil ribbon embossing.
            </p>

            {/* Step 1: Choose Palette */}
            <div className="mt-7">
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                1. Select University Color Palette
              </span>
              <div className="flex flex-wrap gap-2.5">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset.school === preset.school
                  return (
                    <button
                      key={preset.school}
                      type="button"
                      onClick={() => setSelectedPreset(preset)}
                      className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm ring-2 ring-indigo-500/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <span className="flex -space-x-1.5">
                        <span
                          className={`h-4 w-4 rounded-full border border-white dark:border-neutral-900 ${preset.primaryClass}`}
                        />
                        <span
                          className={`h-4 w-4 rounded-full border border-white dark:border-neutral-900 ${preset.secondaryClass}`}
                        />
                      </span>
                      <span>{preset.school}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">
                Popular with:{' '}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {selectedPreset.campuses}
                </span>
              </p>
            </div>

            {/* Step 2: Live Gold Foil Ribbon Text Preview */}
            <div className="mt-6 pt-6 border-t border-neutral-200/80 dark:border-neutral-800">
              <label
                htmlFor="home-ribbon-preview"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2"
              >
                2. Preview Custom Gold Foil Ribbon Text
              </label>
              <div className="relative max-w-md">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="home-ribbon-preview"
                  type="text"
                  maxLength={40}
                  value={customRibbonText}
                  onChange={(e) => setCustomRibbonText(e.target.value)}
                  placeholder="Type graduate name, class year, or honors..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SAMPLE_INSCRIPTIONS.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setCustomRibbonText(sample)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Ribbon & Matching Bouquet Preview Card */}
          <div className="lg:col-span-6">
            <Card className="w-full p-6 sm:p-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="flex -space-x-1.5">
                    <motion.span
                      key={`dot1-${selectedPreset.primaryClass}`}
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      className={`h-5 w-5 rounded-full border-2 border-white dark:border-neutral-900 shadow-xs ${selectedPreset.primaryClass}`}
                    />
                    <motion.span
                      key={`dot2-${selectedPreset.secondaryClass}`}
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      className={`h-5 w-5 rounded-full border-2 border-white dark:border-neutral-900 shadow-xs ${selectedPreset.secondaryClass}`}
                    />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                    {selectedPreset.colors}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>24K Foil Included</span>
                </span>
              </div>

              {/* Simulated Satin Ribbon Banner */}
              <div className="my-6">
                <span className="block text-xs text-neutral-400 mb-2">
                  Live Satin Drape & Metallic Inscription Preview:
                </span>
                <motion.div
                  key={selectedPreset.ribbonBgClass}
                  initial={{ opacity: 0.85, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative overflow-hidden rounded-2xl border-2 px-5 py-4 text-center shadow-md ${selectedPreset.ribbonBgClass}`}
                >
                  <div className="text-xs uppercase tracking-widest opacity-75 mb-1">
                    Commencement Honors Satin Ribbon
                  </div>
                  <div className="text-sm sm:text-base font-extrabold tracking-widest uppercase break-words">
                    ★ {customRibbonText.trim() || 'CLASS OF 2026'} ★
                  </div>
                </motion.div>
              </div>

              {/* Recommended Pairing Preview */}
              <div className="mb-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedPreset.recommendedBouquet.imageUrl}
                    alt={selectedPreset.recommendedBouquet.name}
                    className="h-16 w-16 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block">
                      Top {selectedPreset.school} Pairing
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {selectedPreset.recommendedBouquet.name}
                    </h3>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      Starting at {selectedPreset.recommendedBouquet.price}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/flowers/${selectedPreset.recommendedBouquet.id}`}
                  className="shrink-0"
                >
                  <Button variant="outline" size="sm">
                    Customize
                  </Button>
                </Link>
              </div>

              <Link
                to={`/flowers?color=${encodeURIComponent(selectedPreset.query)}`}
                className="block w-full"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-md shadow-indigo-600/20"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Browse All {selectedPreset.school} Bouquets
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
