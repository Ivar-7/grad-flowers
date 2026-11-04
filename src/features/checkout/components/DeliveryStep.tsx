import { useState, type FormEvent } from 'react'
import {
  User,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import type { CeremonyTimeSlot, DeliveryDetails } from '../types/checkout.types'
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
    title: 'Morning Ceremony',
    hours: '7:30 AM – 9:30 AM',
    description: 'Arrives before early commencement processional',
  },
  {
    id: 'midday-ceremony',
    title: 'Midday Commencement',
    hours: '11:30 AM – 1:30 PM',
    description: 'Perfect for main quad & afternoon stadium ceremonies',
  },
  {
    id: 'afternoon-ceremony',
    title: 'Afternoon Diploma Call',
    hours: '3:00 PM – 5:00 PM',
    description: 'Delivered before departmental ceremonies & photo calls',
  },
  {
    id: 'evening-banquet',
    title: 'Evening Celebration',
    hours: '6:00 PM – 8:00 PM',
    description: 'Delivered to honors dinner, banquet hall, or restaurant',
  },
]

function getDefaultDeliveryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  return date.toISOString().split('T')[0] ?? ''
}

export function DeliveryStep({ initialValues, onSubmit }: DeliveryStepProps) {
  const [recipientName, setRecipientName] = useState(
    initialValues.recipientName,
  )
  const [recipientPhone, setRecipientPhone] = useState(
    initialValues.recipientPhone,
  )
  const [campusOrVenue, setCampusOrVenue] = useState(
    initialValues.campusOrVenue,
  )
  const [venueAddress, setVenueAddress] = useState(initialValues.venueAddress)
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      const validated = DeliveryDetailsSchema.parse({
        recipientName,
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
          1. Ceremony & Delivery Information
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Tell us where and when to hand over the bouquet on graduation day
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

      {/* Graduate Recipient Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="recipient-name"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Graduate Name (Recipient) *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="recipient-name"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Maya Chen"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="recipient-phone"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Handoff Contact Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="recipient-phone"
              type="tel"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="(555) 234-5678"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Campus / Venue Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="campus-venue"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            University / School / Institution *
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="campus-venue"
              type="text"
              required
              value={campusOrVenue}
              onChange={(e) => setCampusOrVenue(e.target.value)}
              placeholder="e.g. University of California, Berkeley"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="venue-address"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Hall, Gate, or Campus Address *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="venue-address"
              type="text"
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Greek Theatre, North Gate Entrance"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Date & Time Slot */}
      <div className="space-y-4 pt-2">
        <div>
          <label
            htmlFor="delivery-date"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Ceremony Date *
          </label>
          <div className="relative max-w-xs">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="delivery-date"
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Select Ceremony Delivery Window *
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
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {slot.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
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

      {/* Special Instructions */}
      <div>
        <label
          htmlFor="special-instructions"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          Courier Venue Notes (Optional)
        </label>
        <textarea
          id="special-instructions"
          rows={2}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Call parent cell when arriving; graduate wearing crimson gown near section B."
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue to Payment
        </Button>
      </div>
    </form>
  )
}
