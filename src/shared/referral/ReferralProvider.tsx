import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ReferralContext } from './referral.context'

const REFERRAL_STORAGE_KEY = 'grad_flowers_referrer_v1'

function sanitizeReferrerCode(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40)
  return cleaned.length >= 2 ? cleaned : null
}

function getInitialReferrer(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = sanitizeReferrerCode(
      params.get('ref') ?? params.get('hunter') ?? params.get('seller'),
    )
    if (fromQuery) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, fromQuery)
      return fromQuery
    }
    return sanitizeReferrerCode(localStorage.getItem(REFERRAL_STORAGE_KEY))
  } catch {
    return null
  }
}

export interface ReferralProviderProps {
  children: ReactNode
}

export function ReferralProvider({ children }: ReferralProviderProps) {
  const [referrer, setReferrerState] = useState<string | null>(
    getInitialReferrer,
  )

  const setReferrer = useCallback((code: string | null) => {
    const sanitized = sanitizeReferrerCode(code)
    setReferrerState(sanitized)
    if (typeof window !== 'undefined') {
      try {
        if (sanitized) {
          localStorage.setItem(REFERRAL_STORAGE_KEY, sanitized)
        } else {
          localStorage.removeItem(REFERRAL_STORAGE_KEY)
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [])

  const clearReferrer = useCallback(() => {
    setReferrer(null)
  }, [setReferrer])

  // Watch URL changes for ?ref=name
  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const fromQuery = sanitizeReferrerCode(
        params.get('ref') ?? params.get('hunter') ?? params.get('seller'),
      )
      if (fromQuery && fromQuery !== referrer) {
        setReferrer(fromQuery)
      }
    }
    window.addEventListener('popstate', checkUrl)
    return () => window.removeEventListener('popstate', checkUrl)
  }, [referrer, setReferrer])

  const buildReferralLink = useCallback((code: string, path = '/') => {
    const cleanCode = sanitizeReferrerCode(code) ?? 'hunter'
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://gradflowers.co.ke'
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${origin}${normalizedPath}?ref=${encodeURIComponent(cleanCode)}`
  }, [])

  return (
    <ReferralContext.Provider
      value={{
        referrer,
        setReferrer,
        clearReferrer,
        buildReferralLink,
      }}
    >
      {children}
    </ReferralContext.Provider>
  )
}
