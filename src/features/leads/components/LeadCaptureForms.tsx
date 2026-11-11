import { useState, type FormEvent } from 'react'
import {
  CalendarHeart,
  Store,
  Camera,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  AlertCircle,
  Send,
} from 'lucide-react'
import { submitLead } from '../api/leads.api'
import type { LeadType, LeadDoc } from '../types/leads.types'
import { useReferral } from '@/shared/referral/useReferral'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { normalizeError } from '@/shared/errors/error-normalizer'

const LEAD_TABS: {
  id: LeadType
  label: string
  icon: typeof CalendarHeart
  headline: string
  subtitle: string
  locationLabel: string
  locationPlaceholder: string
  scheduleLabel: string
  schedulePlaceholder: string
  detailsLabel: string
  detailsPlaceholder: string
}[] = [
  {
    id: 'weekly-supply',
    label: 'Weekly Flower Supply',
    icon: CalendarHeart,
    headline: 'Fresh Kenyan Roses & Stems Delivered Weekly',
    subtitle:
      'Subscribe for fresh home, office, hotel, or church stems straight from the farm every week.',
    locationLabel: 'Estate / Office / Town *',
    locationPlaceholder: 'e.g. Kilimani, Westlands, Thika Road',
    scheduleLabel: 'Preferred Delivery Day',
    schedulePlaceholder: 'e.g. Every Friday morning',
    detailsLabel: 'Stem Preferences & Budget *',
    detailsPlaceholder:
      'e.g. 20 mixed roses + gypsophila every Friday for reception desk (KSh 1,000/week)',
  },
  {
    id: 'stockist',
    label: 'Become a Stockist',
    icon: Store,
    headline: 'Partner as a Campus Vendor or Flower Stockist',
    subtitle:
      'Get wholesale bouquets, wraps, ribbons, and QR cards supplied to your shop or graduation stand.',
    locationLabel: 'Shop Location or Target Campus *',
    locationPlaceholder: 'e.g. Juja Stage, KU Kahawa Sukari, CBD',
    scheduleLabel: 'Expected Weekly / Graduation Volume',
    schedulePlaceholder: 'e.g. 50 Mini + 30 Classic bouquets per ceremony',
    detailsLabel: 'Business / Stand Details *',
    detailsPlaceholder:
      'e.g. Gift shop near campus gate looking for pre-wrapped bouquets and ribbons',
  },
  {
    id: 'photo-booking',
    label: 'Graduation Photo Shoot',
    icon: Camera,
    headline: 'Book a Campus Graduation Photographer',
    subtitle:
      'Pair your fresh bouquet with a dedicated campus portrait photographer at the graduation square.',
    locationLabel: 'University & Graduation Venue *',
    locationPlaceholder: 'e.g. UoN Great Court / JKUAT Pavilion',
    scheduleLabel: 'Graduation Date & Time',
    schedulePlaceholder: 'e.g. Friday 27 Nov, 10:00 AM',
    detailsLabel: 'Photo Package / Group Size *',
    detailsPlaceholder:
      'e.g. Graduate + 4 family members, 15 edited portraits at the graduation square',
  },
]

export function LeadCaptureForms() {
  const { referrer } = useReferral()
  const [activeTab, setActiveTab] = useState<LeadType>('weekly-supply')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [locationOrCampus, setLocationOrCampus] = useState('')
  const [preferredDateOrSchedule, setPreferredDateOrSchedule] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedLead, setSubmittedLead] = useState<LeadDoc | null>(null)

  const currentConfig =
    LEAD_TABS.find((t) => t.id === activeTab) ?? LEAD_TABS[0]!

  const handleTabSwitch = (tab: LeadType) => {
    setActiveTab(tab)
    setErrorMsg(null)
    setSubmittedLead(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const saved = await submitLead({
        type: activeTab,
        name,
        phone,
        locationOrCampus,
        preferredDateOrSchedule,
        details,
        referrer,
      })
      setSubmittedLead(saved)
      setName('')
      setPhone('')
      setLocationOrCampus('')
      setPreferredDateOrSchedule('')
      setDetails('')
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 sm:p-8 border-neutral-200 dark:border-neutral-800 shadow-sm">
      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        {LEAD_TABS.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSwitch(tab.id)}
              className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-rose-600 bg-rose-50/80 text-rose-900 dark:border-rose-500 dark:bg-rose-950/50 dark:text-white font-bold shadow-2xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isSelected
                    ? 'bg-rose-600 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs sm:text-sm font-bold">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {submittedLead ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
            Asante! Your request has been logged ({submittedLead.id})
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
            Our team will call or WhatsApp you on{' '}
            <strong>{submittedLead.phone}</strong> shortly.
            {submittedLead.referrer
              ? ` (Credited to @${submittedLead.referrer})`
              : ''}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSubmittedLead(null)}
          >
            Submit Another Inquiry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                {currentConfig.headline}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {currentConfig.subtitle}
              </p>
            </div>
            {referrer && (
              <Badge variant="success" className="text-xs shrink-0">
                Ref: @{referrer}
              </Badge>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lead-name"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brian Ochieng"
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lead-phone"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Phone / WhatsApp Number (07... / 01...) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="lead-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lead-location"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                {currentConfig.locationLabel}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="lead-location"
                  type="text"
                  required
                  value={locationOrCampus}
                  onChange={(e) => setLocationOrCampus(e.target.value)}
                  placeholder={currentConfig.locationPlaceholder}
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lead-schedule"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                {currentConfig.scheduleLabel}
              </label>
              <input
                id="lead-schedule"
                type="text"
                value={preferredDateOrSchedule}
                onChange={(e) => setPreferredDateOrSchedule(e.target.value)}
                placeholder={currentConfig.schedulePlaceholder}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lead-details"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
            >
              {currentConfig.detailsLabel}
            </label>
            <textarea
              id="lead-details"
              rows={2}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={currentConfig.detailsPlaceholder}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Send className="h-4 w-4" />}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Send Request
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
