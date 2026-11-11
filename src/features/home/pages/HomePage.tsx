import { MotionConfig } from 'motion/react'
import { useFlowers } from '@/features/flowers/state/useFlowers'
import { useUpcomingGraduations } from '../state/useUpcomingGraduations'
import { HeroSection } from '../components/HeroSection'
import { MenuSection } from '../components/MenuSection'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { GraduationCalendar } from '../components/GraduationCalendar'
import { RibbonSection } from '../components/RibbonSection'
import { JokeSection } from '../components/JokeSection'
import { FaqSection } from '../components/FaqSection'
import { MoreServices } from '../components/MoreServices'
import { OrderCta } from '../components/OrderCta'

export function HomePage() {
  const catalog = useFlowers()
  const graduations = useUpcomingGraduations()

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-1 flex-col">
        <HeroSection
          flowers={catalog.flowers}
          isLoadingFlowers={catalog.isLoading}
          nextGraduation={graduations[0] ?? null}
        />
        <MenuSection
          flowers={catalog.flowers}
          isLoading={catalog.isLoading}
          error={catalog.error}
          onRetry={catalog.refetch}
        />
        <HowItWorksSection flowers={catalog.flowers} />
        <GraduationCalendar graduations={graduations} />
        <RibbonSection />
        <JokeSection />
        <FaqSection />
        <MoreServices />
        <OrderCta />
      </div>
    </MotionConfig>
  )
}

export default HomePage
