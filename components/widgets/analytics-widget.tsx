"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  IconArrowUpRight,
  IconCalendar,
  IconDotsVertical,
  IconHome,
  IconPlane,
  IconReceipt,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useTransactions } from "@/hooks/use-transactions"
import { BudgetSourcesWidget } from "@/components/widgets/budget-sources-widget"

const chartConfig = {
  value: {
    label: "Amount",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function currency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

function iconForTag(tag: string) {
  const normalized = tag.toLowerCase()
  if (/travel|trip/.test(normalized)) return IconPlane
  if (/food|shopping|grocery/.test(normalized)) return IconShoppingCart
  if (/bill|rent|emi|utility/.test(normalized)) return IconReceipt
  if (/family|friends|group|split/.test(normalized)) return IconUsers
  if (/home|house/.test(normalized)) return IconHome
  return IconCalendar
}

function IconPoint({ cx, cy, payload }: { cx?: number; cy?: number; payload?: { tag?: string } }) {
  if (typeof cx !== "number" || typeof cy !== "number") return null
  const Icon = iconForTag(payload?.tag || "")

  return (
    <g transform={`translate(${cx - 10}, ${cy - 10})`}>
      <rect x={0} y={0} width={20} height={20} rx={6} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
      <g transform="translate(2,2)">
        <Icon size={16} strokeWidth={1.8} color="hsl(var(--foreground))" />
      </g>
    </g>
  )
}

export function AnalyticsWidget({ userUid }: { userUid: string | null }) {
  const { transactions } = useTransactions(userUid)

  const totals = React.useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") acc.income += Math.abs(transaction.amount)
        else acc.expense += Math.abs(transaction.amount)
        return acc
      },
      { income: 0, expense: 0 }
    )
  }, [transactions])

  const monthlySeries = React.useMemo(() => {
    const buckets = new Map<string, number>()
    for (const transaction of transactions) {
      const date = new Date(transaction.date)
      if (Number.isNaN(date.getTime())) continue
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      buckets.set(key, (buckets.get(key) ?? 0) + Math.abs(transaction.amount))
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, value]) => ({
        name: new Date(`${month}-01`).toLocaleDateString("en-US", { month: "short" }),
        value,
      }))
  }, [transactions])

  const expenseByTags = React.useMemo(() => {
    const buckets: Record<string, number> = {}
    for (const transaction of transactions) {
      if (transaction.type !== "expense") continue
      const key = transaction.tags[0] ?? "Misc"
      buckets[key] = (buckets[key] ?? 0) + Math.abs(transaction.amount)
    }

    return Object.entries(buckets)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([tag, amount]) => ({ tag, amount }))
  }, [transactions])

  const incomeVsExpense = React.useMemo(() => {
    const buckets = new Map<string, { income: number; expense: number }>()

    for (const transaction of transactions) {
      const date = new Date(transaction.date)
      if (Number.isNaN(date.getTime())) continue
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const current = buckets.get(key) ?? { income: 0, expense: 0 }
      if (transaction.type === "income") current.income += Math.abs(transaction.amount)
      else current.expense += Math.abs(transaction.amount)
      buckets.set(key, current)
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, values]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("en-US", { month: "short" }),
        income: values.income,
        expense: values.expense,
        net: values.income - values.expense,
      }))
  }, [transactions])

  const categoryBreakdown = React.useMemo(() => {
    const buckets = new Map<string, number>()
    for (const transaction of transactions) {
      if (transaction.type !== "expense") continue
      const key = transaction.tags[0] || "Misc"
      buckets.set(key, (buckets.get(key) ?? 0) + Math.abs(transaction.amount))
    }

    const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 5)
    const others = sorted.slice(5).reduce((sum, item) => sum + item[1], 0)
    const rows = top.map(([name, value]) => ({ name, value }))
    if (others > 0) rows.push({ name: "Others", value: others })
    return rows
  }, [transactions])

  const quickInsights = React.useMemo(() => {
    const dayTotals = new Map<string, number>()
    const merchantTotals = new Map<string, number>()

    for (const transaction of transactions) {
      const amount = Math.abs(transaction.amount)
      if (transaction.type === "expense") {
        const day = transaction.date.slice(0, 10)
        dayTotals.set(day, (dayTotals.get(day) ?? 0) + amount)
      }

      merchantTotals.set(transaction.name, (merchantTotals.get(transaction.name) ?? 0) + amount)
    }

    const highestDay = Array.from(dayTotals.entries()).sort((a, b) => b[1] - a[1])[0]
    const topMerchant = Array.from(merchantTotals.entries()).sort((a, b) => b[1] - a[1])[0]
    const biggestCategory = expenseByTags[0]
    const expenseTransactions = transactions.filter((item) => item.type === "expense")
    const dailyAverage = expenseTransactions.length ? totals.expense / Math.max(1, dayTotals.size) : 0

    return {
      highestDay,
      topMerchant,
      biggestCategory,
      dailyAverage,
    }
  }, [expenseByTags, totals.expense, transactions])

  const net = totals.income - totals.expense
  const savingsRate = totals.income > 0 ? Math.round((net / totals.income) * 100) : 0
  const pieColors = ["#3b82f6", "#22c55e", "#fb923c", "#a855f7", "#ec4899", "#facc15"]

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Expense", value: currency(totals.expense), tone: "text-rose-500" },
          { label: "Total Income", value: currency(totals.income), tone: "text-emerald-500" },
          { label: "Net Cashflow", value: currency(net), tone: net >= 0 ? "text-emerald-500" : "text-rose-500" },
          { label: "Savings Rate", value: `${savingsRate}%`, tone: savingsRate >= 0 ? "text-emerald-500" : "text-rose-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="border-b pb-3">
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className={kpi.tone}>{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <IconArrowUpRight className="size-3" />
                Snapshot for selected timeline
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-4">
          <BudgetSourcesWidget userUid={userUid} />
        </div>

        <Card className="xl:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Income vs Expense Comparison</CardTitle>
            <CardDescription>Month-wise grouped comparison with net trend context.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={chartConfig} className="h-[360px] w-full">
              <BarChart data={incomeVsExpense} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="#16a34a" radius={0} />
                <Bar dataKey="expense" fill="#ef4444" radius={0} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Monthly Spend</CardTitle>
            <CardDescription>Current month transactions compared across recent months.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={monthlySeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={0} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between border-b">
            <div>
              <CardTitle>Expense by Tags</CardTitle>
              <CardDescription>Tag-wise expense line inspired by your sales-by-country layout.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <IconDotsVertical className="size-5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseByTags} margin={{ top: 20, right: 24, bottom: 16, left: 4 }}>
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.55} />
                  <XAxis dataKey="tag" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                  />
                  <Tooltip
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [currency(Number(value)), "Spend"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={<IconPoint />}
                    activeDot={<IconPoint />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Top category share for current filter window.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <ChartContainer config={chartConfig} className="mx-auto h-[260px] w-full max-w-[280px]">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} strokeWidth={3}>
                    {categoryBreakdown.map((slice, index) => (
                      <Cell key={slice.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>

              <div className="grid content-start gap-2">
                {categoryBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between border p-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                      {item.name}
                    </span>
                    <span className="font-mono tabular-nums">{currency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Auto-calculated highlights from your current transaction data.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4">
            <div className="border p-3 text-sm">
              <p className="text-muted-foreground">Highest spending day</p>
              <p className="font-medium">
                {quickInsights.highestDay ? `${new Date(quickInsights.highestDay[0]).toDateString()} (${currency(quickInsights.highestDay[1])})` : "No expense records"}
              </p>
            </div>
            <div className="border p-3 text-sm">
              <p className="text-muted-foreground">Top merchant</p>
              <p className="font-medium">{quickInsights.topMerchant ? `${quickInsights.topMerchant[0]} (${currency(quickInsights.topMerchant[1])})` : "No transaction records"}</p>
            </div>
            <div className="border p-3 text-sm">
              <p className="text-muted-foreground">Biggest category</p>
              <p className="font-medium">{quickInsights.biggestCategory ? `${quickInsights.biggestCategory.tag} (${currency(quickInsights.biggestCategory.amount)})` : "No category records"}</p>
            </div>
            <div className="border p-3 text-sm">
              <p className="text-muted-foreground">Daily average expense</p>
              <p className="font-medium">{currency(Math.round(quickInsights.dailyAverage))}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}