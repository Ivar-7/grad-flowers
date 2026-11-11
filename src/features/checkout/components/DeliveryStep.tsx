import { useState, type FormEvent } from 'react'
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import {
  KENYAN_PICKUP_STATIONS,
  type CeremonyTimeSlot,
  type DeliveryDetails,
} from '../types/checkout.types'
import { DeliveryDetailsSchema } from '../types/checkout.schema'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { Button } from '@/shared/ui/Button'

export interface DeliveryStepProps {
  initialValues: DeliveryDetails
  onSubmit: (details: DeliveryDetails) => void
}

const TIME_SLOTS: {
  id: CeremonyTimeSlot
  title: string
  hours: string
  description: string
}[] = [
  {
    id: 'morning-ceremony',
    title: 'Morning Processional',
    hours: '7:00 AM – 9:30 AM',
    description: 'Ready at the station before morning assembly',
  },
  {
    id: 'midday-ceremony',
    title: 'Midday Graduation',
    hours: '10:00 AM – 1:00 PM',
    description: 'Peak graduation square & main gate handoff',
  },
  {
    id: 'afternoon-ceremony',
    title: 'Afternoon Photo Session',
    hours: '1:30 PM – 4:30 PM',
    description: 'Collected right after hooding & certificate call',
  },
  {
    id: 'evening-banquet',
    title: 'Evening Family Dinner',
    hours: '5:00 PM – 7:30 PM',
    description: 'Evening pickup for graduation dinners & parties',
  },
]

function getDefaultDeliveryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0] ?? ''
}

export function DeliveryStep({ initialValues, onSubmit }: DeliveryStepProps) {
  const [recipientName, setRecipientName] = useState(
    initialValues.recipientName,
  )
  const [recipientEmail, setRecipientEmail] = useState(
    initialValues.recipientEmail,
  )
  const [recipientPhone, setRecipientPhone] = useState(
    initialValues.recipientPhone,
  )
  const [campusOrVenue, setCampusOrVenue] = useState(
    initialValues.campusOrVenue || KENYAN_PICKUP_STATIONS[0]!.campus,
  )
  const [venueAddress, setVenueAddress] = useState(
    initialValues.venueAddress || KENYAN_PICKUP_STATIONS[0]!.stationName,
  )
  const [deliveryDate, setDeliveryDate] = useState(
    () => initialValues.deliveryDate || getDefaultDeliveryDate(),
  )
  const [ceremonyTimeSlot, setCeremonyTimeSlot] = useState<CeremonyTimeSlot>(
    initialValues.ceremonyTimeSlot || 'morning-ceremony',
  )
  const [specialInstructions, setSpecialInstructions] = useState(
    initialValues.specialInstructions || '',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSelectStationPreset = (
    campus: string,
    stationName: string,
    nextDate: string,
  ) => {
    setCampusOrVenue(campus)
    setVenueAddress(stationName)
    if (nextDate) setDeliveryDate(nextDate)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      const validated = DeliveryDetailsSchema.parse({
        recipientName,
        recipientEmail,
        recipientPhone,
        campusOrVenue,
        venueAddress,
        deliveryDate,
        ceremonyTimeSlot,
        specialInstructions,
      })
      onSubmit(validated)
    } catch (err) {
      const normalized = normalizeError(err)
      setErrorMessage(normalized.userMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          1. Campus Station & Collection Details
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Pick one of our Kenyan university stations or enter your graduation
          venue
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Kenyan Station Selector Pills */}
      <div>
        <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          Quick-Select Our Graduation Stations:
        </span>
        <div className="flex flex-wrap gap-2">
          {KENYAN_PICKUP_STATIONS.map((st) => {
            const isSelected = campusOrVenue === st.campus
            return (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  handleSelectStationPreset(
                    st.campus,
                    st.stationName,
                    st.nextGraduationDate,
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
                }`}
              >
                {st.campus}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="recipient-name"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Graduate or Buyer Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="recipient-name"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Wanjiku Kamau"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="recipient-email"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="recipient-email"
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="wanjiku@example.com"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="recipient-phone"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Phone Number (07... / 01...) *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="recipient-phone"
              type="tel"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="0712345678"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="campus-venue"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            University / Institution *
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="campus-venue"
              type="text"
              required
              value={campusOrVenue}
              onChange={(e) => setCampusOrVenue(e.target.value)}
              placeholder="e.g. University of Nairobi (UoN)"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="venue-address"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Station / Gate / Pickup Point *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="venue-address"
              type="text"
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Main Gate / Great Court Station"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label
            htmlFor="delivery-date"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Graduation / Collection Date *
          </label>
          <div className="relative max-w-xs">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="delivery-date"
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Select Collection Window *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => {
              const isSelected = ceremonyTimeSlot === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setCeremonyTimeSlot(slot.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/60 ring-2 ring-rose-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {slot.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <Clock className="h-3 w-3" />
                      {slot.hours}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {slot.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="special-instructions"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          Station Collection Notes (Optional)
        </label>
        <textarea
          id="special-instructions"
          rows={2}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Collecting near Gate A tent; call 0712... when ready."
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue to M-Pesa Payment
        </Button>
      </div>
    </form>
  )
}
