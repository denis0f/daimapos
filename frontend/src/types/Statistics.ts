export interface StatisticsSummary {
  totalSales: number
  totalProfit: number
  roi: number
  totalOrders: number
  averageOrderValue: number
  lowStockItems: number
}

export interface SalesPoint {
  date: string
  sales: number
  profit: number
}

export interface TopProduct {
  productId: number
  productName: string
  quantitySold: number
  sales: number
  profit: number
}

export interface StockStatistic {
  productId: number
  productName: string
  stock: number
}

export interface CategoryStockStatistic {
  categoryId: number
  categoryName: string
  quantity: number
}

export interface PaymentStatistic {
  paymentMethod: string
  amount: number
}

export interface TopOrder {
  orderId: number
  receiptNumber: string
  total: number
  profit: number
  date: string
}

export interface LowStockProduct {
  productId: number
  productName: string
  stock: number
}

export interface CategoryPerformance {
  categoryId: number
  categoryName: string
  sales: number
  profit: number
}

export interface RestockHistory {
  id: number
  productId: number
  productName: string
  quantity: number
  unitCost: number
  supplier: string
  reason: string
  date: string
}

export interface StatisticsData {
  summary: StatisticsSummary
  sales: SalesPoint[]
  topProducts: TopProduct[]
  stock: StockStatistic[]
  categoryStock: CategoryStockStatistic[]
  payments: PaymentStatistic[]
  topOrders: TopOrder[]
  lowStockProducts: LowStockProduct[]
  categoryPerformance: CategoryPerformance[]
  restocks: RestockHistory[]
}