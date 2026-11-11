import { useState } from 'react'
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react'

export interface QrCodeDisplayProps {
  url: string
  label?: string
  subtitle?: string
  size?: number
}

export function QrCodeDisplay({
  url,
  label = 'Scan QR Card',
  subtitle,
  size = 160,
}: QrCodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    url,
  )}`

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).catch(() => undefined)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="inline-flex flex-col items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
        <QrCode className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white p-2 shadow-2xs">
        {!imgFailed ? (
          <img
            src={qrImageSrc}
            alt={label}
            width={size}
            height={size}
            onError={() => setImgFailed(true)}
            className="h-36 w-36 object-contain"
          />
        ) : (
          <div className="h-36 w-36 flex flex-col items-center justify-center bg-neutral-50 text-neutral-700 p-2">
            <QrCode className="h-16 w-16 text-neutral-900" />
            <span className="text-xs font-mono mt-1 break-all line-clamp-2">
              {url}
            </span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 max-w-48">
          {subtitle}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span>Copied Link</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
        >
          <span>Open</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
