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
  Truck,
  Tag,
  CheckCircle2,
} from 'lucide-react'
import {
  KENYAN_PICKUP_STATIONS,
  type CeremonyTimeSlot,
  type DeliveryDetails,
  type FulfillmentType,
} from '../types/checkout.types'
import { DeliveryDetailsSchema } from '../types/checkout.schema'
import { useReferral } from '@/shared/referral/useReferral'
import { validateReferralCode } from '@/shared/referral/referral.api'
import { SITE_CONFIG } from '@/shared/config/site.config'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { formatKsh } from '@/shared/utils/currency'
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
    title: 'Morning Window',
    hours: '7:00 AM – 9:30 AM',
    description: 'Ready before morning assembly / early delivery',
  },
  {
    id: 'midday-ceremony',
    title: 'Midday Window',
    hours: '10:00 AM – 1:00 PM',
    description: 'Peak graduation handoff or midday dispatch',
  },
  {
    id: 'afternoon-ceremony',
    title: 'Afternoon Window',
    hours: '1:30 PM – 4:30 PM',
    description: 'Afternoon photo call or afternoon delivery',
  },
  {
    id: 'evening-banquet',
    title: 'Evening Window',
    hours: '5:00 PM – 7:30 PM',
    description: 'Evening pickup or delivery for family celebrations',
  },
]

function getDefaultDeliveryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0] ?? ''
}

export function DeliveryStep({ initialValues, onSubmit }: DeliveryStepProps) {
  const { referrer, setReferrer, clearReferrer } = useReferral()

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    initialValues.fulfillmentType || 'event-pickup',
  )
  const [recipientName, setRecipientName] = useState(
    initialValues.recipientName,
  )
  const [graduandName, setGraduandName] = useState(
    initialValues.graduandName || '',
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

  // Referral / Agent code box
  const [refInput, setRefInput] = useState(referrer ?? '')
  const [refStatus, setRefStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >(referrer ? 'valid' : 'idle')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFulfillmentChange = (mode: FulfillmentType) => {
    setFulfillmentType(mode)
    if (mode === 'event-pickup') {
      const first = KENYAN_PICKUP_STATIONS[0]!
      setCampusOrVenue(first.campus)
      setVenueAddress(first.stationName)
      setDeliveryDate(first.nextGraduationDate)
    } else {
      setCampusOrVenue('')
      setVenueAddress('')
    }
  }

  const handleSelectStationPreset = (
    campus: string,
    stationName: string,
    nextDate: string,
  ) => {
    setCampusOrVenue(campus)
    setVenueAddress(stationName)
    if (nextDate) setDeliveryDate(nextDate)
  }

  const handleApplyReferralCode = async () => {
    const trimmed = refInput.trim()
    if (!trimmed) {
      clearReferrer()
      setRefStatus('idle')
      return
    }
    setRefStatus('checking')
    const result = await validateReferralCode(trimmed)
    if (result.valid && result.code) {
      setReferrer(result.code)
      setRefInput(result.code)
      setRefStatus('valid')
    } else {
      clearReferrer()
      setRefStatus('invalid')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      const validated = DeliveryDetailsSchema.parse({
        fulfillmentType,
        recipientName,
        graduandName: graduandName.trim() || undefined,
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

  const isDelivery = fulfillmentType === 'address-delivery'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          1. Pickup or Delivery Details
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Choose graduation event pickup or doorstep delivery to your address
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

      {/* Fulfillment Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleFulfillmentChange('event-pickup')}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            !isDelivery
              ? 'border-rose-600 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/50 ring-2 ring-rose-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                Pick up at Graduation
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Connects you with an available vendor on graduation day.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFulfillmentChange('address-delivery')}
          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            isDelivery
              ? 'border-rose-600 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/50 ring-2 ring-rose-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                Deliver to an Address
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                +{formatKsh(SITE_CONFIG.sameDayDeliveryFeeKsh)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Same-day if in stock, or 2–4 days when freshly sourced.
            </p>
          </div>
        </button>
      </div>

      {/* Quick Graduation Selector Pills (only for event pickup) */}
      {!isDelivery && (
        <div>
          <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Select Graduation Ceremony:
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
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="recipient-name"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Your Name (Buyer) *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="recipient-name"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Mary Wanjiru"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="graduand-name"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Graduand&apos;s Name
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="graduand-name"
              type="text"
              value={graduandName}
              onChange={(e) => setGraduandName(e.target.value)}
              placeholder="e.g. Faith Njeri"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="you@example.com"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="recipient-phone"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Phone / WhatsApp Number (07... / 01...) *
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
            {isDelivery ? 'Area / Estate / Town *' : 'University / Ceremony *'}
          </label>
          <div className="relative">
            {isDelivery ? (
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            ) : (
              <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            )}
            <input
              id="campus-venue"
              type="text"
              required
              value={campusOrVenue}
              onChange={(e) => setCampusOrVenue(e.target.value)}
              placeholder={
                isDelivery
                  ? 'e.g. Kilimani, Westlands, Juja, Rongai'
                  : 'e.g. TUK, KISE, KCA University'
              }
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="venue-address"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {isDelivery
              ? 'Street / Building / Apartment *'
              : 'Preferred Pickup Point *'}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="venue-address"
              type="text"
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder={
                isDelivery
                  ? 'e.g. Argwings Kodhek Rd, Apt 4B'
                  : 'Exact pickup point confirmed via WhatsApp'
              }
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Agent / Referral Code Box */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-2">
        <label
          htmlFor="checkout-ref-code"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Agent or Referral Code (Optional — e.g. PETTI)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="checkout-ref-code"
              type="text"
              value={refInput}
              onChange={(e) => {
                setRefInput(e.target.value)
                setRefStatus('idle')
              }}
              placeholder="Enter seller code (e.g. PETTI)"
              className="w-full pl-10 pr-3.5 py-2 text-sm uppercase font-mono rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:normal-case placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={refStatus === 'checking'}
            onClick={handleApplyReferralCode}
          >
            Apply Code
          </Button>
        </div>
        {refStatus === 'valid' && referrer && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Code @{referrer.toUpperCase()} verified and applied.</span>
          </p>
        )}
        {refStatus === 'invalid' && (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Code not found — double-check the spelling with your agent, or leave
            blank to continue.
          </p>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label
            htmlFor="delivery-date"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {isDelivery
              ? 'Preferred Delivery Date *'
              : 'Graduation / Collection Date *'}
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
            {isDelivery ? 'Select Delivery Window *' : 'Select Pickup Window *'}
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
          Delivery or Pickup Notes (Optional)
        </label>
        <textarea
          id="special-instructions"
          rows={2}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Call 0712... on arrival, or preferred landmark."
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
