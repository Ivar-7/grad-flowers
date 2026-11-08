import { createHmac, timingSafeEqual } from 'crypto'

export const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2'

export function getPayheroAuth(): string {
  const key = process.env.PAYHERO_API_KEY
  const secret = process.env.PAYHERO_API_SECRET
  if (!key || !secret) throw new Error('PayHero credentials not configured')
  return Buffer.from(`${key}:${secret}`).toString('base64')
}

export function getChannelId(): number {
  const id = process.env.PAYHERO_CHANNEL_ID
  if (!id) throw new Error('PAYHERO_CHANNEL_ID not configured')

  const channelId = parseInt(id, 10)
  if (!Number.isInteger(channelId) || channelId <= 0) {
    throw new Error('PAYHERO_CHANNEL_ID must be a positive integer')
  }

  return channelId
}

// Derived from PAYHERO_API_SECRET rather than a dedicated env var — it's
// already a confidential value we hold, so there's nothing new to configure.
export function getCallbackSecret(): string {
  const apiSecret = process.env.PAYHERO_API_SECRET
  if (!apiSecret) throw new Error('PayHero credentials not configured')
  return createHmac('sha256', apiSecret)
    .update('payhero-callback')
    .digest('hex')
}

// Builds the callback URL PayHero is told to POST to, with the shared
// secret embedded as a query param so payheroCallback can verify the
// request actually came from PayHero (see verifyCallbackSecret).
export function getCallbackUrl(): string {
  const url = process.env.PAYHERO_CALLBACK_URL
  if (!url) throw new Error('PAYHERO_CALLBACK_URL not configured')
  const secret = getCallbackSecret()
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}secret=${encodeURIComponent(secret)}`
}

// Constant-time comparison of the callback's `secret` query param.
export function verifyCallbackSecret(provided: unknown): boolean {
  if (typeof provided !== 'string' || !provided) return false
  const expected = getCallbackSecret()
  const providedBuf = Buffer.from(provided)
  const expectedBuf = Buffer.from(expected)
  if (providedBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(providedBuf, expectedBuf)
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('254') && digits.length === 12)
    return `0${digits.substring(3)}`
  if (digits.startsWith('7') && digits.length === 9) return `0${digits}`
  if (digits.startsWith('1') && digits.length === 9) return `0${digits}`
  return digits
}
