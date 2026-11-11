export interface SellerRecord {
  code: string
  name: string
  phone: string
  station: string
  allocatedStock: number
  manualSoldCount: number
  updatedAt: string
}

export interface SellerPerformanceRow {
  code: string
  name: string
  phone: string
  station: string
  allocatedStock: number
  ordersCount: number
  itemsSoldCount: number
  remainingStock: number
  totalSalesKsh: number
  leadsCount: number
  points: number
}
