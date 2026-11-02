import { HeroSection } from '../components/HeroSection'
import { FeaturesHighlight } from '../components/FeaturesHighlight'

export function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <HeroSection />
      <FeaturesHighlight />
    </div>
  )
}

export default HomePage

