import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/shared/firebase/firebase'
import { normalizeError } from '@/shared/errors/error-normalizer'
import { logError } from '@/shared/errors/error-logger'
import { CreateQrMessageSchema, QrMessageDocSchema } from '../types/qr.schema'
import type { CreateQrMessageInput, QrMessageDoc } from '../types/qr.types'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to encode recording'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function createQrMessage(
  input: CreateQrMessageInput,
): Promise<QrMessageDoc> {
  const validated = CreateQrMessageSchema.parse({
    recipientName: input.recipientName,
    senderName: input.senderName,
    writtenNote: input.writtenNote || 'Hongera Sana on your graduation!',
    mediaType: input.mediaType,
    bouquetName: input.bouquetName,
    orderId: input.orderId,
  })

  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const id = `QR-${randomCode}`
  let mediaUrl: string | null = input.mediaUrl ?? null

  if (input.mediaFile) {
    const contentType =
      input.mediaFile.type ||
      (input.mediaType === 'video' ? 'video/webm' : 'audio/webm')
    const ext = contentType.includes('mp4')
      ? 'mp4'
      : contentType.includes('mpeg') || contentType.includes('mp3')
        ? 'mp3'
        : 'webm'

    try {
      const storageRef = ref(storage, `qr-messages/${id}/message.${ext}`)
      await uploadBytes(storageRef, input.mediaFile, { contentType })
      mediaUrl = await getDownloadURL(storageRef)
    } catch (uploadErr) {
      logError(
        normalizeError(
          uploadErr,
          'Cloud media upload fell back to inline encoding.',
        ),
        { feature: 'qr', action: 'uploadMedia', metadata: { id } },
      )
      // If file is small enough (< 700KB), store inline data URL so voice notes still work immediately
      if (input.mediaFile.size < 700_000) {
        mediaUrl = await blobToDataUrl(input.mediaFile)
      }
    }
  }

  const qrDoc: QrMessageDoc = {
    id,
    ...(validated.orderId ? { orderId: validated.orderId } : {}),
    recipientName: validated.recipientName,
    senderName: validated.senderName,
    writtenNote: validated.writtenNote,
    mediaType: validated.mediaType,
    mediaUrl,
    ...(validated.bouquetName ? { bouquetName: validated.bouquetName } : {}),
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'qrMessages', id), qrDoc)
  return qrDoc
}

export async function fetchQrMessageById(
  id: string,
): Promise<QrMessageDoc | null> {
  try {
    const snap = await getDoc(doc(db, 'qrMessages', id))
    if (!snap.exists()) return null
    const parsed = QrMessageDocSchema.safeParse({
      id: snap.id,
      ...snap.data(),
    })
    return parsed.success ? parsed.data : null
  } catch (error) {
    const appError = normalizeError(error, 'Could not load QR card message.')
    logError(appError, {
      feature: 'qr',
      action: 'fetchQrMessageById',
      metadata: { id },
    })
    throw appError
  }
}

export function getQrCardUrl(id: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://gradflowers.co.ke'
  return `${origin}/qr/${encodeURIComponent(id)}`
}
