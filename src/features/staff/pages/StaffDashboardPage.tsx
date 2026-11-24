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
  Download,
  Banknote,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/features/auth/state/useAuth'
import { useReferral } from '@/shared/referral/useReferral'
import { SITE_CONFIG } from '@/shared/config/site.config'
import {
  fetchSellers,
  upsertSeller,
  markSellerPaidOut,
  deleteSeller,
  computeSellerLeaderboard,
  buildOrdersCsv,
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
  const {
    user,
    isAuthenticated,
    isStaffOrAdmin,
    isLoading: isAuthLoading,
  } = useAuth()
  const { buildReferralLink } = useReferral()

  const [activeTab, setActiveTab] = useState<StaffTab>('hunters')
  const [sellers, setSellers] = useState<SellerRecord[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [leads, setLeads] = useState<LeadDoc[]>([])
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasLoaded, setHasLoaded] = useState<boolean>(false)
  const [bannerMsg, setBannerMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [qrModalCode, setQrModalCode] = useState<string | null>(null)

  // Seller Form State
  const [sellerName, setSellerName] = useState('')
  const [sellerCode, setSellerCode] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [sellerStation, setSellerStation] = useState(
    'Technical University of Kenya (TUK)',
  )
  const [sellerStock, setSellerStock] = useState('30')
  const [sellerManualSold, setSellerManualSold] = useState('0')
  const [sellerCommission, setSellerCommission] = useState(
    String(SITE_CONFIG.referralCommissionPerOrderKsh),
  )
  const [isSavingSeller, setIsSavingSeller] = useState(false)
  const [isSyncingMenu, setIsSyncingMenu] = useState(false)

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !isStaffOrAdmin) return

    let isMounted = true

    Promise.all([
      fetchSellers(),
      fetchFlowers('all'),
      fetchAllOrdersForStaff(),
      fetchAllLeadsForStaff(),
    ])
      .then(([sellersData, flowersData, ordersData, leadsData]) => {
        if (!isMounted) return
        setSellers(sellersData)
        setFlowers(flowersData)
        setOrders(ordersData)
        setLeads(leadsData)
        setErrorMsg(null)
        setHasLoaded(true)
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMsg(normalizeError(err).userMessage)
        setHasLoaded(true)
      })

    return () => {
      isMounted = false
    }
  }, [isAuthLoading, isAuthenticated, isStaffOrAdmin])

  const loadDashboardData = useCallback(() => {
    if (!isAuthenticated || !isStaffOrAdmin) return
    setIsLoading(true)
    setErrorMsg(null)
    Promise.all([
      fetchSellers(),
      fetchFlowers('all'),
      fetchAllOrdersForStaff(),
      fetchAllLeadsForStaff(),
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
  }, [isAuthenticated, isStaffOrAdmin])

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
        commissionPerOrderKsh:
          Number(sellerCommission) || SITE_CONFIG.referralCommissionPerOrderKsh,
        available: true,
      })
      setSellers((prev) => [
        saved,
        ...prev.filter((s) => s.code !== saved.code),
      ])
      setSellerName('')
      setSellerCode('')
      setSellerPhone('')
      setBannerMsg(
        `Saved agent @${saved.code.toUpperCase()} (${formatKsh(saved.commissionPerOrderKsh)}/order) and published referral code.`,
      )
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    } finally {
      setIsSavingSeller(false)
    }
  }

  const handleMarkPaid = async (code: string, totalEarnedKsh: number) => {
    setErrorMsg(null)
    try {
      const paidAt = await markSellerPaidOut(code, totalEarnedKsh)
      setSellers((prev) =>
        prev.map((s) =>
          s.code === code
            ? { ...s, paidOutKsh: totalEarnedKsh, lastPaidAt: paidAt }
            : s,
        ),
      )
      setBannerMsg(
        `Marked @${code.toUpperCase()} paid up to ${formatKsh(totalEarnedKsh)}.`,
      )
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    }
  }

  const handleDeleteSeller = async (code: string) => {
    setErrorMsg(null)
    try {
      await deleteSeller(code)
      setSellers((prev) => prev.filter((s) => s.code !== code))
      setBannerMsg(`Removed seller @${code.toUpperCase()}.`)
    } catch (err) {
      setErrorMsg(normalizeError(err).userMessage)
    }
  }

  const handleExportOrdersCsv = () => {
    const csv = buildOrdersCsv(orders)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
      setBannerMsg('Synced bouquet menu & sample photos to Firestore.')
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
        `${updated.name} marked as ${updated.inStock ? 'In Stock (Same-Day)' : 'Out of Stock (2–4 Days)'}.`,
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

  // Strict Staff Login Gate — never expose staff tools or data to unauthenticated / non-staff visitors
  if (isAuthLoading) {
    return <LoadingState message="Checking staff access..." fullPage />
  }

  if (!isAuthenticated || !isStaffOrAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 w-full">
        <Card className="p-8 text-center space-y-5 border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              Staff &amp; Employees Only
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isAuthenticated
                ? `Your account (${user?.email}) does not have staff or admin access. Ask an administrator to assign your role.`
                : `Sign in with a ${SITE_CONFIG.brandName} staff or admin account to manage agents, orders, payouts, and stock.`}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/auth">
              <Button variant="primary" size="md">
                {isAuthenticated ? 'Switch Account' : 'Staff Sign In'}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="md">
                Back to Store
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (!hasLoaded || isLoading) {
    return <LoadingState message="Loading staff portal..." fullPage />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" className="gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>{SITE_CONFIG.brandName} Staff Portal</span>
            </Badge>
            {user && (
              <Badge variant="success" className="text-xs uppercase">
                Role: {user.role}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Agents, Payouts, Orders &amp; Stock
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Private staff workspace — manage registered referral codes, KSh
            commissions, orders sheet, and bouquet stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOrdersCsv}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export Orders Sheet (CSV)
          </Button>
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
            label: `Agents & Payouts (${leaderboard.length})`,
            icon: Users,
          },
          {
            id: 'orders' as const,
            label: `All Orders (${orders.length})`,
            icon: ShoppingBag,
          },
          {
            id: 'leads' as const,
            label: `Leads Inbox (${leads.length})`,
            icon: Inbox,
          },
          {
            id: 'menu' as const,
            label: `Bouquets & Stock (${flowers.length})`,
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

      {/* TAB 1: REGISTERED AGENTS, KSH EARNINGS, PAYOUTS & QR LINKS */}
      {activeTab === 'hunters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-0 overflow-hidden border-neutral-200 dark:border-neutral-800">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-900/50">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    Registered Agents, Orders &amp; KSh Earnings
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Only registered codes below are credited on paid orders
                    (e.g. 10 paid orders × KSh 30 = KSh 300).
                  </p>
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="No agents registered yet"
                    description="Register your first agent (e.g. PETTI) using the form on the right so buyers can use their code at checkout."
                    action={
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSellerName('Petti')
                          setSellerCode('petti')
                          setSellerCommission(
                            String(SITE_CONFIG.referralCommissionPerOrderKsh),
                          )
                        }}
                      >
                        Pre-fill Petti
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {leaderboard.map((row, idx) => (
                    <div
                      key={row.code}
                      className="p-5 flex flex-col gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-extrabold">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                              {row.name}
                            </span>
                            <Badge
                              variant="default"
                              className="font-mono text-xs uppercase"
                            >
                              {row.code}
                            </Badge>
                            <span className="text-xs text-neutral-500">
                              ({formatKsh(row.commissionPerOrderKsh)}/order)
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">
                            Area: {row.station} • Phone: {row.phone || '—'}
                          </p>

                          {/* Shareable Link, QR & Payout Actions */}
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
                                  <span>Copy Link</span>
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
                                {qrModalCode === row.code
                                  ? 'Hide QR'
                                  : 'Agent QR'}
                              </span>
                            </button>

                            {row.unpaidKsh > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkPaid(row.code, row.earnedKsh)
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                              >
                                <Banknote className="h-3.5 w-3.5" />
                                <span>
                                  Mark Paid ({formatKsh(row.unpaidKsh)})
                                </span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteSeller(row.code)}
                              aria-label={`Remove agent ${row.name}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-xs text-neutral-500 hover:text-red-600 hover:border-red-300 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {qrModalCode === row.code && (
                            <div className="pt-3">
                              <QrCodeDisplay
                                url={buildReferralLink(row.code)}
                                label={`Agent QR: ${row.name}`}
                                subtitle={`Code: ${row.code.toUpperCase()}`}
                                size={140}
                              />
                            </div>
                          )}
                        </div>

                        {/* Metrics Grid: Paid Orders, Earned KSh, Paid Out, Balance Due */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center shrink-0">
                          <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60">
                            <span className="block text-xs text-neutral-500">
                              Paid Orders
                            </span>
                            <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                              {row.paidOrdersCount}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50">
                            <span className="block text-xs text-emerald-700 dark:text-emerald-300">
                              Earned
                            </span>
                            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                              {formatKsh(row.earnedKsh)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60">
                            <span className="block text-xs text-neutral-500">
                              Paid Out
                            </span>
                            <span className="text-sm font-extrabold text-neutral-700 dark:text-neutral-200">
                              {formatKsh(row.paidOutKsh)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50">
                            <span className="block text-xs text-amber-700 dark:text-amber-300">
                              Balance Due
                            </span>
                            <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                              {formatKsh(row.unpaidKsh)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Register / Update Agent Form */}
          <div className="lg:col-span-4">
            <Card className="p-6 border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-1">
                Register Agent / Seller Code
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Create a code (e.g. PETTI) so buyers can type it at checkout and
                earn KSh per paid order
              </p>

              <form onSubmit={handleSaveSeller} className="space-y-3">
                <div>
                  <label
                    htmlFor="seller-name"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    Agent Full Name *
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
                    placeholder="e.g. Petti"
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
                    placeholder="e.g. petti"
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
                    Assigned Campus / Area *
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

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label
                      htmlFor="seller-commission"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      KSh / Order
                    </label>
                    <input
                      id="seller-commission"
                      type="number"
                      min={0}
                      value={sellerCommission}
                      onChange={(e) => setSellerCommission(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seller-stock"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      Stock
                    </label>
                    <input
                      id="seller-stock"
                      type="number"
                      min={0}
                      value={sellerStock}
                      onChange={(e) => setSellerStock(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seller-manual-sold"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                      Walk-Up
                    </label>
                    <input
                      id="seller-manual-sold"
                      type="number"
                      min={0}
                      value={sellerManualSold}
                      onChange={(e) => setSellerManualSold(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
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
                  Save Agent &amp; Activate Code
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="New M-Pesa orders will appear here automatically and can be exported into one CSV sheet."
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
                    <Badge variant="purple" className="capitalize">
                      {order.delivery.fulfillmentType === 'address-delivery'
                        ? 'Delivery'
                        : 'Event Pickup'}
                    </Badge>
                    {order.referrer && (
                      <Badge variant="success">
                        Code: @{order.referrer.toUpperCase()}
                      </Badge>
                    )}
                    {order.fulfillment?.route && (
                      <Badge variant="default">{order.fulfillment.route}</Badge>
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
                    Buyer: {order.delivery.recipientName}
                    {order.delivery.graduandName
                      ? ` • Graduand: ${order.delivery.graduandName}`
                      : ''}{' '}
                    • {order.delivery.recipientPhone}
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
                        ? 'Ready / Out'
                        : st === 'delivered'
                          ? 'Completed'
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
              description="Weekly Supply and Photo Booking inquiries will appear here."
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
                        Code: @{lead.referrer.toUpperCase()}
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

      {/* TAB 4: BOUQUETS & STOCK MANAGER */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <Card className="p-6 border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Bouquet Catalog &amp; Stock Availability
              </h3>
              <p className="text-xs text-neutral-500">
                Toggle stock availability: In Stock bouquets route to same-day
                delivery; Sold Out bouquets route to 2–4 day sourcing.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSyncingMenu}
              onClick={handleSyncOfficialMenu}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Sync Bouquet Catalog to Firestore
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
                        : 'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}
                  >
                    {flower.inStock
                      ? 'In Stock (Same-Day)'
                      : '2–4 Days Sourcing'}
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Photo</span>
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
