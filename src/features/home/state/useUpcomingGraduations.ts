import {
  KENYAN_PICKUP_STATIONS,
  type PickupStationPreset,
} from '@/features/checkout/types/checkout.types'
import { useNow } from './useNow'

export interface UpcomingGraduation extends PickupStationPreset {
  /** Ceremony morning, 08:00 Nairobi time. */
  startsAt: number
  hasStarted: boolean
  weekday: string
  day: string
  month: string
}

const ONE_MINUTE = 60_000

const dayFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Africa/Nairobi',
})

function getDateParts(timestamp: number) {
  const parts = dayFormatter.formatToParts(timestamp)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return { weekday: pick('weekday'), day: pick('day'), month: pick('month') }
}

/**
 * Stations with a ceremony still ahead (or under way today), soonest first.
 * A station drops off the list once its ceremony day is over.
 */
export function useUpcomingGraduations(): UpcomingGraduation[] {
  const now = useNow(ONE_MINUTE)

  return KENYAN_PICKUP_STATIONS.map((station) => {
    const startsAt = Date.parse(`${station.nextGraduationDate}T08:00:00+03:00`)
    const endsAt = Date.parse(`${station.nextGraduationDate}T18:00:00+03:00`)
    return { station, startsAt, endsAt }
  })
    .filter(({ endsAt }) => endsAt > now)
    .sort((a, b) => a.startsAt - b.startsAt)
    .map(({ station, startsAt }) => ({
      ...station,
      startsAt,
      hasStarted: now >= startsAt,
      ...getDateParts(startsAt),
    }))
}
