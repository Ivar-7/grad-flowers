export type LeadType = 'weekly-supply' | 'stockist' | 'photo-booking'

export type LeadStatus = 'new' | 'contacted' | 'converted'

export interface LeadDoc {
  id: string
  type: LeadType
  name: string
  phone: string
  locationOrCampus: string
  details: string
  preferredDateOrSchedule?: string
  referrer: string | null
  status: LeadStatus
  createdAt: string
}

export interface CreateLeadInput {
  type: LeadType
  name: string
  phone: string
  locationOrCampus: string
  details: string
  preferredDateOrSchedule?: string
  referrer: string | null
}
