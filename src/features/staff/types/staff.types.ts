export interface SellerRecord {
  code: string
  name: string
  phone: string
  station: string
  allocatedStock: number
  manualSoldCount: number
  commissionPerOrderKsh: number
  earnedKsh: number
  paidOutKsh: number
  lastPaidAt?: string | null
  available: boolean
  updatedAt: string
}

export interface SellerPerformanceRow {
  code: string
  name: string
  phone: string
  station: string
  allocatedStock: number
  ordersCount: number
  paidOrdersCount: number
  itemsSoldCount: number
  remainingStock: number
  totalSalesKsh: number
  commissionPerOrderKsh: number
  earnedKsh: number
  paidOutKsh: number
  unpaidKsh: number
  lastPaidAt?: string | null
  leadsCount: number
  points: number
  available: boolean
}
