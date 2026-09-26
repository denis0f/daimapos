import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { StatisticsData } from "../types/Statistics"
import { statisticsService } from "../services/statisticsService"

type Period = "today" | "7days" | "30days" | "3months" | "1year"

const formatCurrency = (value: number) =>
  `KSh ${value.toLocaleString("en-KE", {
    maximumFractionDigits: 0,
  })}`

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
  })
}

const getStockBadge = (stock: number) => {
  if (stock > 20) {
    return "bg-green-100 text-green-700"
  }

  if (stock > 10) {
    return "bg-yellow-100 text-yellow-700"
  }

  return "bg-red-100 text-red-700"
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[#8b756a]">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#4a2c20]">{value}</p>

      <p className="mt-1 text-xs text-[#8b756a]">{subtitle}</p>
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-[#4a2c20]">{title}</h2>

      <div className="h-[300px]">{children}</div>
    </section>
  )
}

export default function Stats() {
  const [period, setPeriod] = useState<Period>("7days")
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await statisticsService.getStatistics(period)

        setStatistics(data)
      } catch {
        setError("Failed to load statistics.")
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [period])

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f5f0e8]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#d8c5b8] border-t-[#6b3f2a]" />

          <p className="mt-3 text-sm text-[#7a6258]">
            Loading statistics...
          </p>
        </div>
      </div>
    )
  }

  if (error || !statistics) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f5f0e8] p-5">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-[#4a2c20]">
            Unable to load statistics
          </h1>

          <p className="mt-2 text-sm text-[#7a6258]">
            {error || "No statistics data was returned by the server."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#6b3f2a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#593321]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const {
    summary,
    sales,
    topProducts,
    stock,
    categoryStock,
    payments,
    topOrders,
    lowStockProducts,
    categoryPerformance,
    restocks,
  } = statistics

  return (
    <div className="min-h-full bg-[#f5f0e8] p-4 sm:p-5">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#4a2c20]">
              Statistics
            </h1>

            <p className="mt-1 text-sm text-[#7a6258]">
              Monitor sales, profit, inventory and business performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "today", label: "Today" },
              { value: "7days", label: "7 Days" },
              { value: "30days", label: "30 Days" },
              { value: "3months", label: "3 Months" },
              { value: "1year", label: "1 Year" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setPeriod(item.value as Period)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  period === item.value
                    ? "bg-[#6b3f2a] text-white"
                    : "bg-white text-[#6b3f2a] shadow-sm hover:bg-[#f0e7df]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Sales"
            value={formatCurrency(summary.totalSales)}
            subtitle="Sales revenue"
          />

          <StatCard
            title="Total Profit"
            value={formatCurrency(summary.totalProfit)}
            subtitle="Gross profit"
          />

          <StatCard
            title="ROI"
            value={`${summary.roi.toFixed(1)}%`}
            subtitle="Return on inventory cost"
          />

          <StatCard
            title="Total Orders"
            value={summary.totalOrders.toLocaleString()}
            subtitle="Completed orders"
          />

          <StatCard
            title="Average Order"
            value={formatCurrency(summary.averageOrderValue)}
            subtitle={`${summary.lowStockItems} low stock items`}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.8fr)]">
          <ChartCard title="Sales and Profit">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eadfd7" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#8b756a" }}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#8b756a" }}
                  tickFormatter={(value) => `KSh ${value / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#6b3f2a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#a66a3f"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment Methods">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payments}
                  dataKey="amount"
                  nameKey="paymentMethod"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {payments.map((payment, index) => (
                    <Cell
                      key={payment.paymentMethod}
                      fill={index === 0 ? "#6b3f2a" : "#a66a3f"}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ChartCard title="Top Selling Products">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ left: 25, right: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eadfd7" />

                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#8b756a" }}
                />

                <YAxis
                  type="category"
                  dataKey="productName"
                  width={110}
                  tick={{ fontSize: 10, fill: "#7a6258" }}
                />

                <Tooltip />

                <Bar
                  dataKey="quantitySold"
                  name="Quantity Sold"
                  fill="#6b3f2a"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Stock Levels">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stock}
                layout="vertical"
                margin={{ left: 25, right: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eadfd7" />

                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#8b756a" }}
                />

                <YAxis
                  type="category"
                  dataKey="productName"
                  width={110}
                  tick={{ fontSize: 10, fill: "#7a6258" }}
                />

                <Tooltip />

                <Bar
                  dataKey="stock"
                  name="Stock"
                  radius={[0, 5, 5, 0]}
                >
                  {stock.map((product) => (
                    <Cell
                      key={product.productId}
                      fill={
                        product.stock > 20
                          ? "#5b9b68"
                          : product.stock > 10
                            ? "#d5a72a"
                            : "#c9564d"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ChartCard title="Stock Distribution by Category">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStock}
                  dataKey="quantity"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label={(props) => {
                    const index = props.index ?? 0
                    const category = categoryStock[index]

                    return `${category?.categoryName ?? ""} ${(
                      (props.percent ?? 0) * 100
                    ).toFixed(0)}%`
                  }}
                >
                  {categoryStock.map((category, index) => (
                    <Cell
                      key={category.categoryId}
                      fill={
                        [
                          "#6b3f2a",
                          "#8b5e3c",
                          "#a66a3f",
                          "#c08a63",
                          "#d5ad8e",
                          "#e1c8b2",
                        ][index % 6]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Category Performance">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eadfd7" />

                <XAxis
                  dataKey="categoryName"
                  tick={{ fontSize: 10, fill: "#7a6258" }}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#8b756a" }}
                  tickFormatter={(value) => `KSh ${value / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />

                <Legend />

                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#6b3f2a"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="#a66a3f"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-[#eadfd7] px-5 py-4">
              <h2 className="text-base font-bold text-[#4a2c20]">
                Top 5 Orders
              </h2>

              <p className="mt-1 text-xs text-[#8b756a]">
                Highest-value completed orders.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eadfd7] bg-[#faf7f3] text-left text-[11px] uppercase tracking-wide text-[#8b756a]">
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Profit</th>
                  </tr>
                </thead>

                <tbody>
                  {topOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b border-[#f0e7e0] last:border-0"
                    >
                      <td className="px-4 py-3 text-xs font-medium text-[#4a2c20]">
                        {order.receiptNumber}
                      </td>

                      <td className="px-4 py-3 text-xs text-[#7a6258]">
                        {formatDate(order.date)}
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-[#4a2c20]">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-green-700">
                        {formatCurrency(order.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-[#eadfd7] px-5 py-4">
              <h2 className="text-base font-bold text-[#4a2c20]">
                Low Stock Products
              </h2>

              <p className="mt-1 text-xs text-[#8b756a]">
                Products that may need replenishment.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eadfd7] bg-[#faf7f3] text-left text-[11px] uppercase tracking-wide text-[#8b756a]">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {lowStockProducts.map((product, index) => (
                    <tr
                      key={product.productId}
                      className="border-b border-[#f0e7e0] last:border-0"
                    >
                      <td className="px-4 py-3 text-xs text-[#8b756a]">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-[#4a2c20]">
                        {product.productName}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${getStockBadge(
                            product.stock,
                          )}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-xl bg-white shadow-sm">
          <div className="border-b border-[#eadfd7] px-5 py-4">
            <h2 className="text-base font-bold text-[#4a2c20]">
              Restock History
            </h2>

            <p className="mt-1 text-xs text-[#8b756a]">
              Inventory received during the selected period.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-[#eadfd7] bg-[#faf7f3] text-left text-[11px] uppercase tracking-wide text-[#8b756a]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>

              <tbody>
                {restocks.map((restock) => (
                  <tr
                    key={restock.id}
                    className="border-b border-[#f0e7e0] last:border-0"
                  >
                    <td className="px-4 py-3 text-xs text-[#7a6258]">
                      {formatDate(restock.date)}
                    </td>

                    <td className="px-4 py-3 text-xs font-medium text-[#4a2c20]">
                      {restock.productName}
                    </td>

                    <td className="px-4 py-3 text-xs text-[#4a2c20]">
                      {restock.quantity}
                    </td>

                    <td className="px-4 py-3 text-xs text-[#4a2c20]">
                      {formatCurrency(restock.unitCost)}
                    </td>

                    <td className="px-4 py-3 text-xs text-[#7a6258]">
                      {restock.supplier}
                    </td>

                    <td className="px-4 py-3 text-xs text-[#7a6258]">
                      {restock.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}