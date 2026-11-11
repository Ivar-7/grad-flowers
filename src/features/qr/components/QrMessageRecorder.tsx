import { useRef, useState, type ChangeEvent } from 'react'
import {
  Mic,
  Square,
  Video,
  Upload,
  CheckCircle2,
  Trash2,
  QrCode,
  AlertCircle,
} from 'lucide-react'
import { createQrMessage, getQrCardUrl } from '../api/qr.api'
import type { QrMediaType, QrMessageDoc } from '../types/qr.types'
import { QrCodeDisplay } from './QrCodeDisplay'
import { Button } from '@/shared/ui/Button'
import { normalizeError } from '@/shared/errors/error-normalizer'

export interface QrMessageRecorderProps {
  bouquetName?: string
  defaultRecipient?: string
  onSaved: (qrDoc: QrMessageDoc) => void
}

export function QrMessageRecorder({
  bouquetName,
  defaultRecipient = '',
  onSaved,
}: QrMessageRecorderProps) {
  const [recipientName, setRecipientName] = useState(defaultRecipient)
  const [senderName, setSenderName] = useState('')
  const [writtenNote, setWrittenNote] = useState(
    'Hongera Sana on your graduation! So proud of your hard work.',
  )
  const [mediaType, setMediaType] = useState<QrMediaType>('audio')
  const [mediaBlob, setMediaBlob] = useState<Blob | File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [savedDoc, setSavedDoc] = useState<QrMessageDoc | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startVoiceRecording = async () => {
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setMediaBlob(blob)
        setMediaType('audio')
        setPreviewUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)
    } catch {
      setErrorMsg(
        'Microphone access was blocked or unavailable. You can upload an audio/video file instead.',
      )
    }
  }

  const stopVoiceRecording = () => {
    stopTimer()
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Please choose a voice or video clip smaller than 15 MB.')
      return
    }

    const detectedType: QrMediaType = file.type.startsWith('video/')
      ? 'video'
      : 'audio'
    setMediaType(detectedType)
    setMediaBlob(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setMediaBlob(null)
    setPreviewUrl(null)
    setRecordingSeconds(0)
  }

  const handleSaveQrCard = async () => {
    setErrorMsg(null)
    if (!recipientName.trim() || !senderName.trim()) {
      setErrorMsg('Please enter both the graduate’s name and your name.')
      return
    }

    setIsSaving(true)
    try {
      const docResult = await createQrMessage({
        recipientName: recipientName.trim(),
        senderName: senderName.trim(),
        writtenNote: writtenNote.trim(),
        mediaType: mediaBlob ? mediaType : 'note',
        mediaFile: mediaBlob,
        bouquetName,
      })
      setSavedDoc(docResult)
      onSaved(docResult)
    } catch (err) {
      setErrorMsg(
        normalizeError(err, 'Could not save QR message card.').userMessage,
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (savedDoc) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>QR Message Card Ready ({savedDoc.id})</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedDoc(null)}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
          >
            Edit Message
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <QrCodeDisplay
            url={getQrCardUrl(savedDoc.id)}
            label={`For ${savedDoc.recipientName}`}
            subtitle="Printed on your bouquet’s QR card"
            size={120}
          />
          <div className="text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 flex-1">
            <p>
              <strong>To:</strong> {savedDoc.recipientName}
            </p>
            <p>
              <strong>From:</strong> {savedDoc.senderName}
            </p>
            <p className="italic">&ldquo;{savedDoc.writtenNote}&rdquo;</p>
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Media:{' '}
              {savedDoc.mediaType === 'video'
                ? 'Video Message Attached'
                : savedDoc.mediaType === 'audio'
                  ? 'Voice Message Attached'
                  : 'Celebration Card Note'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Voice / Video Message Card</span>
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Record a voice note or upload a video — when the graduate scans the
            QR card on their bouquet, your message plays!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="qr-recipient"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Graduate’s Name (To) *
          </label>
          <input
            id="qr-recipient"
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Wanjiku Kamau"
            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label
            htmlFor="qr-sender"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Your Name (From) *
          </label>
          <input
            id="qr-sender"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Mum, Dad & Family"
            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Voice / Video Recording Controls */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Add Voice or Video Recording
        </span>

        {!previewUrl ? (
          <div className="flex flex-wrap items-center gap-2.5">
            {!isRecording ? (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Record Voice Note</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-3.5 py-2 text-xs font-bold animate-pulse cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-white" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}

            <label className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 cursor-pointer transition-colors">
              <Video className="h-3.5 w-3.5 text-rose-500" />
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Video or Audio</span>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {mediaType === 'video'
                  ? 'Video clip attached'
                  : 'Voice note recorded'}
              </span>
              <button
                type="button"
                onClick={clearRecording}
                className="inline-flex items-center gap-1 text-red-600 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {mediaType === 'video' ? (
              <video
                src={previewUrl}
                controls
                className="w-full max-h-48 rounded-lg bg-black"
              />
            ) : (
              <audio src={previewUrl} controls className="w-full h-9" />
            )}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="qr-written-note"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
        >
          Written “Hongera!” Message (opens alongside your voice/video)
        </label>
        <textarea
          id="qr-written-note"
          rows={2}
          maxLength={400}
          value={writtenNote}
          onChange={(e) => setWrittenNote(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="primary"
          isLoading={isSaving}
          onClick={handleSaveQrCard}
        >
          Save QR Card Message
        </Button>
      </div>
    </div>
  )
}
