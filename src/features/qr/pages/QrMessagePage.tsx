import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  GraduationCap,
  Heart,
  Sparkles,
  Volume2,
  Video,
  Flower2,
  ArrowRight,
} from 'lucide-react'
import { fetchQrMessageById } from '../api/qr.api'
import type { QrMessageDoc } from '../types/qr.types'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/errors/ErrorState'
import { normalizeError } from '@/shared/errors/error-normalizer'
import type { AppError } from '@/shared/errors/app-error'

export function QrMessagePage() {
  const { id } = useParams<{ id: string }>()
  const [message, setMessage] = useState<QrMessageDoc | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)

  const loadMessage = () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    fetchQrMessageById(id)
      .then((doc) => {
        setMessage(doc)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(normalizeError(err, 'Could not open this QR message card.'))
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (!id) return
    let mounted = true
    fetchQrMessageById(id)
      .then((doc) => {
        if (mounted) {
          setMessage(doc)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(normalizeError(err, 'Could not open this QR message card.'))
          setIsLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <LoadingState
        message="Opening your Hongera! graduation message card..."
        fullPage
      />
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState
          error={error}
          title="Unable to load QR Card"
          onRetry={loadMessage}
        />
      </div>
    )
  }

  if (!message) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="QR Message Card Not Found"
          description="This QR card code could not be found. Check the link on your bouquet card or order a fresh graduation bouquet."
          action={
            <Link to="/">
              <Button variant="primary">Visit GradFlowers Kenya</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16 w-full">
      <Card className="overflow-hidden border-rose-200 dark:border-rose-900/60 p-0 shadow-xl">
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 p-6 sm:p-8 text-white text-center">
          <Badge
            variant="default"
            className="bg-white/20 text-white border-white/30 mb-3 gap-1.5"
          >
            <GraduationCap className="h-4 w-4 text-amber-200" />
            <span>Graduation QR Message Card • {message.id}</span>
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hongera Sana, {message.recipientName}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-rose-100">
            Sent with love by <strong>{message.senderName}</strong>
            {message.bouquetName ? ` • ${message.bouquetName} Bouquet` : ''}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-neutral-900">
          {message.mediaUrl && message.mediaType === 'video' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Video className="h-4 w-4" />
                <span>Tap to Play Video Message</span>
              </div>
              <video
                src={message.mediaUrl}
                controls
                playsInline
                className="w-full rounded-2xl bg-black shadow-md max-h-96"
              />
            </div>
          )}

          {message.mediaUrl && message.mediaType === 'audio' && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Volume2 className="h-4 w-4" />
                <span>Voice Message from {message.senderName}</span>
              </div>
              <audio src={message.mediaUrl} controls className="w-full" />
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 p-6 text-center space-y-3">
            <Sparkles className="h-6 w-6 text-amber-500 mx-auto" />
            <p className="text-base sm:text-lg font-medium text-neutral-900 dark:text-white italic leading-relaxed">
              &ldquo;{message.writtenNote}&rdquo;
            </p>
            <div className="pt-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span>With pride from {message.senderName}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Flower2 className="h-4 w-4 text-rose-500" />
              <span>GradFlowers Kenya — Fresh Graduation Blooms</span>
            </span>
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Send a Bouquet in 60s
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default QrMessagePage
