import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import { CreateLeadSchema } from '../types/leads.schema'
import type { CreateLeadInput, LeadDoc, LeadStatus } from '../types/leads.types'

export async function submitLead(input: CreateLeadInput): Promise<LeadDoc> {
  const validated = CreateLeadSchema.parse(input)
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  const id = `LEAD-${suffix}`

  const leadDoc: LeadDoc = {
    id,
    type: validated.type,
    name: validated.name,
    phone: validated.phone,
    locationOrCampus: validated.locationOrCampus,
    details: validated.details,
    ...(validated.preferredDateOrSchedule
      ? { preferredDateOrSchedule: validated.preferredDateOrSchedule }
      : {}),
    referrer: validated.referrer ?? null,
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  try {
    await setDoc(doc(db, 'leads', id), leadDoc)
    return leadDoc
  } catch (error) {
    const appError = normalizeError(
      error,
      'Could not submit your request. Please check your connection and try again.',
    )
    logError(appError, { feature: 'leads', action: 'submitLead' })
    throw appError
  }
}

export async function fetchAllLeadsForStaff(): Promise<LeadDoc[]> {
  try {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as LeadDoc)
  } catch (error) {
    const appError = normalizeError(
      error,
      'Unable to load leads. Staff or Admin permissions required.',
    )
    logError(appError, { feature: 'leads', action: 'fetchAllLeadsForStaff' })
    throw appError
  }
}

export async function updateLeadStatusForStaff(
  leadId: string,
  status: LeadStatus,
): Promise<void> {
  await updateDoc(doc(db, 'leads', leadId), { status })
}
