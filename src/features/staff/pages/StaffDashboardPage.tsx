import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ShoppingBag,
  Inbox,
  Flower2,
  QrCode,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Upload,
  Trophy,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/features/auth/state/useAuth'
import { useReferral } from '@/shared/referral/useReferral'
import {
  fetchSellers,
  upsertSeller,
  computeSellerLeaderboard,
} from '../api/staff.api'
import type { SellerRecord } from '../types/staff.types'
import {
  fetchAllOrdersForStaff,
  updateOrderStatusForStaff,
} from '@/features/checkout/api/orders.api'
import type {
  Order,
  OrderStatus,
} from '@/features/checkout/types/checkout.types'
import {
  fetchAllLeadsForStaff,
  updateLeadStatusForStaff,
} from '@/features/leads/api/leads.api'
import type { LeadDoc, LeadStatus } from '@/features/leads/types/leads.types'
import {
  fetchFlowers,
  syncOfficialMenuToFirestore,
  upsertFlowerProduct,
  uploadFlowerPhoto,
} from '@/features/flowers/api/flowers.api'
import type { Flower } from '@/features/flowers/types/flower.types'
import { QrCodeDisplay } from '@/features/qr/components/QrCodeDisplay'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatKsh } from '@/shared/utils/currency'
import { normalizeError } from '@/shared/errors/error-normalizer'

type StaffTab = 'hunters' | 'orders' | 'leads' | 'menu'

export function StaffDashboardPage() {
  const { user, isAuthenticated, isStaffOrAdmin } = useAuth()
  const { buildReferralLink } = useReferral()

  const [activeTab, setActiveTab] = useState<StaffTab>('hunters')
  const [sellers, setSellers] = useState<SellerRecord[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [leads, setLeads] = useState<LeadDoc[]>([])
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [bannerMsg, setBannerMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [qrModalCode, setQrModalCode] = useState<string | null>(null)

  // Seller Form State
  const [sellerName, setSellerName] = useState('')
  const [sellerCode, setSellerCode] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [sellerStation, setSellerStation] = useState(
    'UoN — Great Court Station',
  )
  const [sellerStock, setSellerStock] = useState('50')
  const [sellerManualSold, setSellerManualSold] = useState('0')
  const [isSavingSeller, setIsSavingSeller] = useState(false)
  const [isSyncingMenu, setIsSyncingMenu] = useState(false)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      fetchSellers(),
      fetchFlowers('all'),
      isStaffOrAdmin
        ? fetchAllOrdersForStaff().catch(() => [] as Order[])
        : Promise.resolve([] as Order[]),
      isStaffOrAdmin
        ? fetchAllLeadsForStaff().catch(() => [] as LeadDoc[])
        : Promise.resolve([] as LeadDoc[]),
    ])
      .then(([sellersData, flowersData, ordersData, leadsData]) => {
        if (!isMounted) return
        setSellers(sellersData)
        setFlowers(flowersData)
        setOrders(ordersData)
        setLeads(leadsData)
        setErrorMsg(null)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMsg(normalizeError(err).userMessage)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isStaffOrAdmin])

  const loadDashboardData = useCallback(() => {
    setIsLoading(true)
    setErrorMsg(null)
    Promise.all([
      fetchSellers(),
      fetchFlowers('all'),
      isStaffOrAdmin
        ? fetchAllOrdersForStaff().catch(() => [] as Order[])
        : Promise.resolve([] as Order[]),
      isStaffOrAdmin
        ? fetchAllLeadsForStaff().catch(() => [] as LeadDoc[])
        : Promise.resolve([] as LeadDoc[]),
    ])
      .then(([sellersData, flowersData, ordersData, leadsData]) => {
        setSellers(sellersData)
        setFlowers(flowersData)
        setOrders(ordersData)
        setLeads(leadsData)
        setIsLoading(false)
      })
      .catch((err) => {
        setErrorMsg(normalizeError(err).userMessage)
        setIsLoading(false)
      })
  }, [isStaffOrAdmin])

  const leaderboard = computeSellerLeaderboard(sellers, orders, leads)

  const handleCopyRefLink = (code: string) => {
    const link = buildReferralLink(code)
    navigator.clipboard?.writeText(link).catch(() => undefined)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleSaveSeller = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setBannerMsg(null)
    setIsSavingSeller(true)
    try {
      const saved = await upsertSeller({
        code: sellerCode,
        name: sellerName,
        phone: sellerPhone,
        station: sellerStation,
        allocatedStock: Number(sellerStock) || 0,
        manualSoldCount: Number(sellerManualSold) || 0,
      })
      setSellers((prev) => [
        saved,
        ...prev.filter((s) => s.code !== saved.code),
      ])
      setSellerName('')
      setSellerCode('')
      setSellerPhone('')
      setBannerMsg(
        `Saved seller @${saved.code} with ${saved.allocatedStock} bouquets allocated.`,
      )
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    } finally {
      setIsSavingSeller(false)
    }
  }

  const handleOrderStatusChange = async (
    order: Order,
    nextStatus: OrderStatus,
  ) => {
    setErrorMsg(null)
    try {
      await updateOrderStatusForStaff(order.id, nextStatus, order.userId)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)),
      )
      setBannerMsg(`Updated order ${order.id} to ${nextStatus}.`)
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    }
  }

  const handleLeadStatusChange = async (
    leadId: string,
    nextStatus: LeadStatus,
  ) => {
    setErrorMsg(null)
    try {
      await updateLeadStatusForStaff(leadId, nextStatus)
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l)),
      )
      setBannerMsg(`Updated lead ${leadId} to ${nextStatus}.`)
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    }
  }

  const handleSyncOfficialMenu = async () => {
    setErrorMsg(null)
    setBannerMsg(null)
    setIsSyncingMenu(true)
    try {
      const synced = await syncOfficialMenuToFirestore()
      setFlowers(synced)
      setBannerMsg(
        'Synced all 6 official products (Single, Mini, Mini Candy, Classic, Classic Candy, Premium) to Firestore!',
      )
    } catch (err) {
      setErrorMsg(
        normalizeError(
          err,
          'Admin role in Firestore users/{uid} is required to write catalog products.',
        ).userMessage,
      )
    } finally {
      setIsSyncingMenu(false)
    }
  }

  const handleToggleStock = async (flower: Flower) => {
    setErrorMsg(null)
    try {
      const updated = await upsertFlowerProduct({
        ...flower,
        inStock: !flower.inStock,
      })
      setFlowers((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      setBannerMsg(
        `${updated.name} marked as ${updated.inStock ? 'In Stock' : 'Sold Out'}.`,
      )
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    }
  }

  const handlePhotoUpload = async (flower: Flower, file: File | undefined) => {
    if (!file) return
    setErrorMsg(null)
    try {
      const url = await uploadFlowerPhoto(flower.id, file)
      const updated = await upsertFlowerProduct({
        ...flower,
        imageUrl: url,
      })
      setFlowers((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      setBannerMsg(`Updated photo for ${flower.name}.`)
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    }
  }

  if (isLoading) {
    return (
      <LoadingState message="Loading Staff & Hunters Dashboard..." fullPage />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" className="gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Staff & Hunters Operations</span>
            </Badge>
            {user && (
              <Badge
                variant={isStaffOrAdmin ? 'success' : 'default'}
                className="text-xs uppercase"
              >
                Role: {user.role}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Sales, Stock per Person, Leads & Menu
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Track hunter QR links (?ref=name), stock per person, station orders,
            and leads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              You can generate hunter QR links (`?ref=name`) below. To view
              private customer orders & leads or edit database stock, sign in
              with a Staff or Admin account (`users/&#123;uid&#125;.role =
              'staff' | 'admin'`).
            </span>
          </div>
          <Link to="/auth" className="shrink-0">
            <Button size="sm" variant="primary">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {bannerMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{bannerMsg}</span>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800">
        {[
          {
            id: 'hunters' as const,
            label: `Hunters & Stock (${leaderboard.length})`,
            icon: Users,
          },
          {
            id: 'orders' as const,
            label: `Station Orders (${orders.length})`,
            icon: ShoppingBag,
          },
          {
            id: 'leads' as const,
            label: `Leads Inbox (${leads.length})`,
            icon: Inbox,
          },
          {
            id: 'menu' as const,
            label: `6-Product Menu (${flowers.length})`,
            icon: Flower2,
          },
        ].map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: HUNTERS, SALES, STOCK PER PERSON & QR LINKS */}
      {activeTab === 'hunters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-0 overflow-hidden border-neutral-200 dark:border-neutral-800">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-900/50">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    Sales, Stock & Points per Person
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Each hunter’s QR adds ?ref=name — orders (10 pts) & leads
                    (15 pts) credited automatically
                  </p>
                </div>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {leaderboard.map((row, idx) => (
                  <div
                    key={row.code}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-extrabold">
                          #{idx + 1}
                        </span>
                        <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          {row.name}
                        </span>
                        <Badge variant="default" className="font-mono text-xs">
                          ?ref={row.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Station: {row.station} • Phone: {row.phone}
                      </p>

                      {/* Shareable Link & QR */}
                      <div className="pt-1.5 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyRefLink(row.code)}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 cursor-pointer"
                        >
                          {copiedCode === row.code ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span>Copied ?ref={row.code}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Seller Link</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setQrModalCode(
                              qrModalCode === row.code ? null : row.code,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer"
                        >
                          <QrCode className="h-3 w-3" />
                          <span>
                            {qrModalCode === row.code ? 'Hide QR' : 'Hunter QR'}
                          </span>
                        </button>
                      </div>

                      {qrModalCode === row.code && (
                        <div className="pt-3">
                          <QrCodeDisplay
                            url={buildReferralLink(row.code)}
                            label={`Hunter QR: ${row.name}`}
                            subtitle={`Scans open ?ref=${row.code}`}
                            size={140}
                          />
                        </div>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-3 text-center shrink-0">
                      <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60">
                        <span className="block text-xs text-neutral-500">
                          Stock Left
                        </span>
                        <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          {row.remainingStock}/{row.allocatedStock}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60">
                        <span className="block text-xs text-neutral-500">
                          Sales
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatKsh(row.totalSalesKsh)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60">
                        <span className="block text-xs text-neutral-500">
                          Leads
                        </span>
                        <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          {row.leadsCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50">
                        <span className="block text-xs text-amber-700 dark:text-amber-300">
                          Points
                        </span>
                        <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                          {row.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Add / Update Hunter Stock Form */}
          <div className="lg:col-span-4">
            <Card className="p-6 border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-1">
                Assign Hunter Stock & QR Code
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Add a team member or update their allocated bouquet stock
              </p>

              <form onSubmit={handleSaveSeller} className="space-y-3">
                <div>
                  <label
                    htmlFor="seller-name"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Hunter Full Name *
                  </label>
                  <input
                    id="seller-name"
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => {
                      setSellerName(e.target.value)
                      if (!sellerCode) {
                        setSellerCode(
                          e.target.value
                            .trim()
                            .split(/\s+/)[0]
                            ?.toLowerCase()
                            .replace(/[^a-z0-9]/g, '') ?? '',
                        )
                      }
                    }}
                    placeholder="e.g. Faith Njeri"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="seller-code"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Referral Code (?ref=code) *
                  </label>
                  <input
                    id="seller-code"
                    type="text"
                    required
                    value={sellerCode}
                    onChange={(e) =>
                      setSellerCode(e.target.value.toLowerCase())
                    }
                    placeholder="e.g. faith"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="seller-phone"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Phone Number (07...) *
                  </label>
                  <input
                    id="seller-phone"
                    type="tel"
                    required
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="seller-station"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Assigned Campus Station *
                  </label>
                  <input
                    id="seller-station"
                    type="text"
                    required
                    value={sellerStation}
                    onChange={(e) => setSellerStation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="seller-stock"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      Bouquets Allocated
                    </label>
                    <input
                      id="seller-stock"
                      type="number"
                      min={0}
                      value={sellerStock}
                      onChange={(e) => setSellerStock(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seller-manual-sold"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      Walk-Up Sold
                    </label>
                    <input
                      id="seller-manual-sold"
                      type="number"
                      min={0}
                      value={sellerManualSold}
                      onChange={(e) => setSellerManualSold(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingSeller}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="w-full mt-2"
                >
                  Save Hunter & Stock
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: STATION ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              title="No station orders loaded"
              description={
                isStaffOrAdmin
                  ? 'New 60-second M-Pesa orders will appear here automatically.'
                  : 'Sign in with a Staff or Admin account to read all customer orders.'
              }
            />
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                className="p-5 border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                      {order.id}
                    </span>
                    <Badge variant="default" className="capitalize">
                      {order.status.replace(/-/g, ' ')}
                    </Badge>
                    {order.referrer && (
                      <Badge variant="success">Ref: @{order.referrer}</Badge>
                    )}
                    {order.qrMessageId && (
                      <Link
                        to={`/qr/${order.qrMessageId}`}
                        className="text-rose-600 dark:text-rose-400 font-bold underline"
                      >
                        QR Card: {order.qrMessageId}
                      </Link>
                    )}
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-semibold">
                    {order.delivery.recipientName} •{' '}
                    {order.delivery.recipientEmail || order.userEmail} •{' '}
                    {order.delivery.recipientPhone}
                  </p>
                  <p className="text-neutral-500">
                    {order.delivery.campusOrVenue} —{' '}
                    {order.delivery.venueAddress} ({order.delivery.deliveryDate}
                    )
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {order.items
                      .map((i) => `${i.quantity}× ${i.name} (${i.ribbonColor})`)
                      .join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 mr-2">
                    {formatKsh(order.summary.total)}
                  </span>
                  {(
                    [
                      'confirmed',
                      'florist-arranging',
                      'out-for-delivery',
                      'delivered',
                    ] as OrderStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleOrderStatusChange(order, st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer capitalize ${
                        order.status === st
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {st === 'out-for-delivery'
                        ? 'Ready at Station'
                        : st === 'delivered'
                          ? 'Collected'
                          : st.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: LEADS INBOX */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <EmptyState
              title="No leads in inbox yet"
              description={
                isStaffOrAdmin
                  ? 'Weekly Supply, Stockist, and Photo Booking inquiries will appear here.'
                  : 'Sign in with a Staff or Admin account to view submitted leads.'
              }
            />
          ) : (
            leads.map((lead) => (
              <Card
                key={lead.id}
                className="p-5 border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="uppercase">
                      {lead.type.replace(/-/g, ' ')}
                    </Badge>
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {lead.name} ({lead.phone})
                    </span>
                    {lead.referrer && (
                      <Badge variant="success">
                        Credited: @{lead.referrer}
                      </Badge>
                    )}
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    <strong>Location/Campus:</strong> {lead.locationOrCampus}
                    {lead.preferredDateOrSchedule
                      ? ` • Schedule: ${lead.preferredDateOrSchedule}`
                      : ''}
                  </p>
                  <p className="text-neutral-500">{lead.details}</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['new', 'contacted', 'converted'] as LeadStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleLeadStatusChange(lead.id, st)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border capitalize cursor-pointer ${
                          lead.status === st
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {st}
                      </button>
                    ),
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 4: 6-PRODUCT MENU & PHOTO MANAGER */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <Card className="p-6 border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Official Six-Product Menu Database Sync
              </h3>
              <p className="text-xs text-neutral-500">
                Writes the 6 products (Single KSh 50, Mini KSh 350, Mini Candy
                KSh 500, Classic KSh 600, Classic Candy KSh 750, Premium KSh
                1,500) to Firestore and removes any old prototype items.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSyncingMenu}
              onClick={handleSyncOfficialMenu}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Sync 6 Official Products to Firestore
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowers.map((flower) => (
              <Card
                key={flower.id}
                className="p-5 border-neutral-200 dark:border-neutral-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-3">
                    <img
                      src={flower.imageUrl}
                      alt={flower.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                      {flower.name}
                    </h4>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      {formatKsh(flower.price)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mt-0.5">
                    {flower.whatsInIt}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleToggleStock(flower)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      flower.inStock
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {flower.inStock ? 'In Stock' : 'Sold Out'}
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Real Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handlePhotoUpload(flower, e.target.files?.[0])
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDashboardPage
