import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'

export interface ReferralValidationResult {
  valid: boolean
  code: string | null
}

export function normalizeReferralCode(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)
}

/**
 * Validates a typed agent/seller referral code against the public-safe
 * `referralCodes/{code}` lookup collection (no PII or sales totals exposed).
 */
export async function validateReferralCode(
  rawCode: string,
): Promise<ReferralValidationResult> {
  const code = normalizeReferralCode(rawCode)
  if (code.length < 2) {
    return { valid: false, code: null }
  }

  try {
    const snap = await getDoc(doc(db, 'referralCodes', code))
    if (!snap.exists()) {
      return { valid: false, code }
    }
    const data = snap.data() as { active?: boolean }
    return { valid: data.active !== false, code }
  } catch {
    return { valid: false, code }
  }
}
