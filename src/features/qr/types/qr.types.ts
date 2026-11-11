export type QrMediaType = 'audio' | 'video' | 'note'

export interface QrMessageDoc {
  id: string
  orderId?: string
  recipientName: string
  senderName: string
  writtenNote: string
  mediaType: QrMediaType
  mediaUrl: string | null
  bouquetName?: string
  createdAt: string
}

export interface CreateQrMessageInput {
  recipientName: string
  senderName: string
  writtenNote: string
  mediaType: QrMediaType
  mediaFile?: File | Blob | null
  mediaUrl?: string | null
  bouquetName?: string
  orderId?: string
}
