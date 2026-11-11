export interface ReferralContextValue {
  referrer: string | null
  setReferrer: (code: string | null) => void
  clearReferrer: () => void
  buildReferralLink: (code: string, path?: string) => string
}
