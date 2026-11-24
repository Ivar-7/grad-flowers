const BRAND_NAME = 'GradFlowers'
const BRAND_REGION = 'Kenya'
const BRAND_BADGE = 'KE'
const WHATSAPP_DISPLAY = '+1 (508) 769-3842'

const rawWhatsappDigits =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(
    /\D/g,
    '',
  ) || '15087693842'

export const SITE_CONFIG = {
  brandName: BRAND_NAME,
  brandRegion: BRAND_REGION,
  brandBadge: BRAND_BADGE,
  fullBrandName: `${BRAND_NAME} ${BRAND_REGION}`.trim(),
  tagline: 'Graduation bouquets — event pickup or doorstep delivery',
  whatsappDigits: rawWhatsappDigits,
  whatsappDisplay: WHATSAPP_DISPLAY,
  /** Standard Bolt-referenced same-day delivery fee in KSh (adjustable as rates settle). */
  sameDayDeliveryFeeKsh: 250,
  /** Commission earned by a registered agent/seller per paid referred order (e.g. 10 orders = KSh 300). */
  referralCommissionPerOrderKsh: 30,
  buildWhatsAppUrl(message?: string): string {
    const text =
      message ??
      `Hi ${BRAND_NAME}, I would like to ask about graduation bouquets.`
    return `https://wa.me/${rawWhatsappDigits}?text=${encodeURIComponent(text)}`
  },
} as const
