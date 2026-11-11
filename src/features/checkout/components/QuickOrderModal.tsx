import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Zap,
  Candy,
  QrCode,
  MapPin,
  Smartphone,
  User,
  Mail,
  Check,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { useCart } from '@/features/cart/state/useCart'
import { useAuth } from '@/features/auth/state/useAuth'
import { useReferral } from '@/shared/referral/useReferral'
import { SEEDED_FLOWERS } from '@/features/flowers/api/flowers.api'
import { QrMessageRecorder } from '@/features/qr/components/QrMessageRecorder'
import { KENYAN_PICKUP_STATIONS, type Order } from '../types/checkout.types'
import { normalizeKenyanPhone } from '../types/checkout.schema'
import { createOrder, saveSessionReceipt } from '../api/orders.api'
import { usePayheroCheckout } from '../state/usePayheroCheckout'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { formatKsh } from '@/shared/utils/currency'
import { normalizeError } from '@/shared/errors/error-normalizer'

function getDefaultDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0] ?? ''
}

export function QuickOrderModal() {
  const { quickOrder, closeQuickOrder } = useCart()

  return (
    <AnimatePresence>
      {quickOrder.isOpen && (
        <QuickOrderModalDialog
          key={`${quickOrder.flowerId ?? 'classic'}-${quickOrder.venue ?? ''}-${quickOrder.date ?? ''}-${quickOrder.schoolColor ?? ''}`}
          initialFlowerId={quickOrder.flowerId}
          initialDate={quickOrder.date}
          initialVenue={quickOrder.venue}
          initialSchoolColor={quickOrder.schoolColor}
          onClose={closeQuickOrder}
        />
      )}
    </AnimatePresence>
  )
}

interface QuickOrderModalDialogProps {
  initialFlowerId?: string
  initialDate?: string
  initialVenue?: string
  initialSchoolColor?: string
  onClose: () => void
}

function QuickOrderModalDialog({
  initialFlowerId,
  initialDate,
  initialVenue,
  initialSchoolColor,
  onClose: closeQuickOrder,
}: QuickOrderModalDialogProps) {
  const { user } = useAuth()
  const { referrer } = useReferral()
  const navigate = useNavigate()
  const checkout = usePayheroCheckout()

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialFlowerId || 'classic',
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedRibbon, setSelectedRibbon] = useState<string>(
    initialSchoolColor || 'Royal Blue',
  )
  const [stationId, setStationId] = useState<string>(() => {
    if (initialVenue) {
      const matched = KENYAN_PICKUP_STATIONS.find((s) =>
        s.campus.toLowerCase().includes(initialVenue.toLowerCase()),
      )
      if (matched) return matched.id
    }
    return KENYAN_PICKUP_STATIONS[0]?.id ?? 'uon-main'
  })
  const [deliveryDate, setDeliveryDate] = useState<string>(
    initialDate || getDefaultDate(),
  )
  const [recipientName, setRecipientName] = useState<string>('')
  const [recipientEmail, setRecipientEmail] = useState<string>('')
  const [mpesaPhone, setMpesaPhone] = useState<string>('')
  const [showQrRecorder, setShowQrRecorder] = useState<boolean>(false)
  const [qrMessageId, setQrMessageId] = useState<string | undefined>(undefined)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const pendingOrderRef = useRef<Order | null>(null)

  const selectedProduct =
    SEEDED_FLOWERS.find((f) => f.id === selectedProductId) ?? SEEDED_FLOWERS[3]!

  const candyUpgradeTarget = selectedProduct.candyUpgradeTargetId
    ? SEEDED_FLOWERS.find((f) => f.id === selectedProduct.candyUpgradeTargetId)
    : null
  const candyBaseProduct = selectedProduct.candyBaseId
    ? SEEDED_FLOWERS.find((f) => f.id === selectedProduct.candyBaseId)
    : null

  const activeStation =
    KENYAN_PICKUP_STATIONS.find((s) => s.id === stationId) ??
    KENYAN_PICKUP_STATIONS[0]!

  const totalAmount = selectedProduct.price * quantity
  const isBusy =
    checkout.phase === 'initiating' || checkout.phase === 'awaiting'
  const combinedError = formError ?? checkout.errorMessage

  useEffect(() => {
    if (checkout.phase !== 'paid' || !pendingOrderRef.current) return
    const confirmedOrder: Order = {
      ...pendingOrderRef.current,
      status: 'confirmed',
    }
    saveSessionReceipt(confirmedOrder)
    const id = confirmedOrder.id
    closeQuickOrder()
    navigate(`/order-success/${id}`)
  }, [checkout.phase, closeQuickOrder, navigate])

  const handleToggleCandy = () => {
    if (candyUpgradeTarget) {
      setSelectedProductId(candyUpgradeTarget.id)
    } else if (candyBaseProduct) {
      setSelectedProductId(candyBaseProduct.id)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const cleanName = recipientName.trim()
    if (cleanName.length < 2) {
      setFormError('Please enter your name or the graduate’s name.')
      return
    }

    const cleanEmail = recipientEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.')
      return
    }

    const cleanPhone = normalizeKenyanPhone(mpesaPhone)
    if (!/^(07|01)\d{8}$/.test(cleanPhone)) {
      setFormError('Enter a valid Kenyan M-Pesa number, e.g. 0712345678.')
      return
    }

    try {
      if (!pendingOrderRef.current) {
        const created = await createOrder({
          userId: user ? user.uid : null,
          userEmail: cleanEmail,
          referrer,
          qrMessageId,
          items: [
            {
              id: `${selectedProduct.id}-${Date.now()}`,
              flowerId: selectedProduct.id,
              name: selectedProduct.name,
              whatsInIt: selectedProduct.whatsInIt,
              imageUrl: selectedProduct.imageUrl,
              category: selectedProduct.category,
              basePrice: selectedProduct.price,
              tier: 'standard',
              tierLabel: selectedProduct.whatsInIt,
              unitPrice: selectedProduct.price,
              quantity,
              ribbonColor: selectedRibbon,
              qrMessageId,
              addOns: [],
              totalPrice: totalAmount,
            },
          ],
          summary: {
            subtotal: totalAmount,
            total: totalAmount,
          },
          delivery: {
            recipientName: cleanName,
            recipientEmail: cleanEmail,
            recipientPhone: cleanPhone,
            campusOrVenue: activeStation.campus,
            venueAddress: activeStation.stationName,
            deliveryDate: deliveryDate || getDefaultDate(),
            ceremonyTimeSlot: 'morning-ceremony',
          },
          paymentMethod: 'mpesa',
        })
        pendingOrderRef.current = created
        setPendingOrder(created)
      }

      await checkout.start({
        amount: totalAmount,
        phoneNumber: cleanPhone,
        description: `GradFlowers ${selectedProduct.name} (${pendingOrderRef.current.id})`,
        orderId: pendingOrderRef.current.id,
        userId: user ? user.uid : null,
      })
    } catch (err) {
      setFormError(
        normalizeError(err, 'Could not start M-Pesa payment.').userMessage,
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeQuickOrder}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-2xl max-h-screen overflow-y-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                  Order in 60 Seconds
                </h2>
                <Badge variant="success" className="text-xs">
                  No Account Needed
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pick bouquet • Enter M-Pesa number • Collect at campus station
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeQuickOrder}
            aria-label="Close 60-second order modal"
            className="rounded-xl p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {combinedError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{combinedError}</span>
              </div>
              {pendingOrder && (
                <button
                  type="button"
                  onClick={() => {
                    const id = pendingOrder.id
                    closeQuickOrder()
                    navigate(`/order-success/${id}`)
                  }}
                  className="shrink-0 font-bold underline cursor-pointer"
                >
                  View Reservation Pass →
                </button>
              )}
            </div>
          )}

          {/* Step 1: Pick from the 6 Products */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2.5">
              1. Pick Your Bouquet (Six Official Products)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SEEDED_FLOWERS.map((prod) => {
                const isSelected = prod.id === selectedProduct.id
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/50 ring-2 ring-rose-500/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white">
                        {prod.name}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 flex-1">
                      {prod.whatsInIt}
                    </span>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1.5">
                      {formatKsh(prod.price)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Candy Upgrade Toggle for Mini / Classic */}
            {(candyUpgradeTarget || candyBaseProduct) && (
              <div className="mt-3 p-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Candy className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {candyUpgradeTarget
                      ? `Candy Upgrade: Switch to ${candyUpgradeTarget.name} (+KSh 150 — ${candyUpgradeTarget.whatsInIt})`
                      : `${selectedProduct.name} selected! Tap to switch back to ${candyBaseProduct?.name}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCandy}
                  className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    selectedProduct.hasCandy
                      ? 'bg-amber-500 justify-end'
                      : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow-2xs" />
                </button>
              </div>
            )}

            {/* Quantity & School Ribbon Colour */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-neutral-500 mr-1">
                  Ribbon:
                </span>
                {[
                  'Royal Blue',
                  'Gold',
                  'Crimson Red',
                  'Emerald Green',
                  'Purple',
                  'White',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedRibbon(color)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selectedRibbon === color
                        ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">
                  Qty:
                </span>
                <div className="flex items-center rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1 text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Optional QR Voice/Video Message for Classic & Premium */}
            {selectedProduct.includesQrCard && (
              <div className="mt-3">
                {!showQrRecorder && !qrMessageId ? (
                  <button
                    type="button"
                    onClick={() => setShowQrRecorder(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>
                      + Add Voice or Video Message to your included QR Card
                      (Optional)
                    </span>
                  </button>
                ) : (
                  <div className="mt-2">
                    <QrMessageRecorder
                      bouquetName={selectedProduct.name}
                      defaultRecipient={recipientName}
                      onSaved={(doc) => {
                        setQrMessageId(doc.id)
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Campus Station & Graduation Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="quick-station"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                2. Collect at Campus Station *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                <select
                  id="quick-station"
                  value={stationId}
                  onChange={(e) => {
                    setStationId(e.target.value)
                    const st = KENYAN_PICKUP_STATIONS.find(
                      (s) => s.id === e.target.value,
                    )
                    if (st) setDeliveryDate(st.nextGraduationDate)
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {KENYAN_PICKUP_STATIONS.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.campus} — {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="quick-date"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Collection Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="quick-date"
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Name, Email & M-Pesa Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="quick-name"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                3. Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="quick-name"
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Wanjiku Kamau"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="quick-email"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="quick-email"
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="wanjiku@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="quick-mpesa"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                M-Pesa Number (07... / 01...) *
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                <input
                  id="quick-mpesa"
                  type="tel"
                  inputMode="tel"
                  required
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {checkout.phase === 'awaiting' && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 shrink-0 animate-bounce" />
                <span>
                  M-Pesa STK Push sent! Enter your PIN on{' '}
                  <strong>{mpesaPhone}</strong> to pay{' '}
                  <strong>{formatKsh(totalAmount)}</strong>.
                </span>
              </div>
              {pendingOrder && (
                <button
                  type="button"
                  onClick={() => {
                    const id = pendingOrder.id
                    closeQuickOrder()
                    navigate(`/order-success/${id}`)
                  }}
                  className="shrink-0 font-bold underline cursor-pointer"
                >
                  Open Receipt →
                </button>
              )}
            </div>
          )}

          {/* Submit Bar */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Station Pickup: <strong>{activeStation.campus}</strong>
              </span>
              {referrer && (
                <span className="block text-emerald-600 dark:text-emerald-400 font-semibold">
                  Seller credited: @{referrer}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isBusy}
              rightIcon={<CheckCircle2 className="h-5 w-5" />}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 px-6"
            >
              Pay {formatKsh(totalAmount)} via M-Pesa
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
