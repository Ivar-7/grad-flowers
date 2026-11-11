import { createContext } from 'react'
import type { ReferralContextValue } from './referral.types'

export const ReferralContext = createContext<ReferralContextValue | null>(null)
