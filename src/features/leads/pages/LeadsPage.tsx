import { Sparkles } from 'lucide-react'
import { LeadCaptureForms } from '../components/LeadCaptureForms'
import { Badge } from '@/shared/ui/Badge'

export function LeadsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8 text-center">
        <Badge variant="purple" className="mb-3 gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Weekly Stems • Wholesale Stockists • Campus Photos</span>
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Book Weekly Flowers, Stockist Supply, or Graduation Photos
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Fill in the form below and our team will reach out on WhatsApp or
          phone. All inquiries automatically credit your referring seller.
        </p>
      </div>

      <LeadCaptureForms />
    </div>
  )
}

export default LeadsPage
