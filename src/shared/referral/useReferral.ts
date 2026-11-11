import { useContext } from 'react'
import { ReferralContext } from './referral.context'
import type { ReferralContextValue } from './referral.types'

export function useReferral(): ReferralContextValue {
  const context = useContext(ReferralContext)
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider')
  }
  return context
}
