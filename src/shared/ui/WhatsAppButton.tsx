import { motion } from 'motion/react'
import { MessageCircle } from 'lucide-react'
import { SITE_CONFIG } from '@/shared/config/site.config'

export function WhatsAppButton() {
  return (
    <motion.a
      href={SITE_CONFIG.buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${SITE_CONFIG.brandName} on WhatsApp (${SITE_CONFIG.whatsappDisplay})`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/20 transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6 dark:focus-visible:ring-offset-neutral-950"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp Us</span>
    </motion.a>
  )
}
