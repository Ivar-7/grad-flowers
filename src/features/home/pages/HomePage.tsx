import { HeroSection } from '../components/HeroSection'
import { FeaturedBouquetsSection } from '../components/FeaturedBouquetsSection'
import { CategoryShowcase } from '../components/CategoryShowcase'
import { SchoolColorsMatcher } from '../components/SchoolColorsMatcher'
import { CeremonyProcessSection } from '../components/CeremonyProcessSection'
import { FeaturesHighlight } from '../components/FeaturesHighlight'
import { CeremonyFaq } from '../components/CeremonyFaq'

export function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <HeroSection />
      <FeaturedBouquetsSection />
      <CategoryShowcase />
      <SchoolColorsMatcher />
      <CeremonyProcessSection />
      <FeaturesHighlight />
      <CeremonyFaq />
    </div>
  )
}

export default HomePage
