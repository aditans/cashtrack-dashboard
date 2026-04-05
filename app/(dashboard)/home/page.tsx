"use client"

import * as React from "react"
import { IconArrowUpRight } from "@tabler/icons-react"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthUser } from "@/hooks/use-auth-user"
import { useTransactions } from "@/hooks/use-transactions"
import { ReportWidget } from "@/components/widgets/report-widget"
import { ScanBillsWidget } from "@/components/widgets/scan-bills-widget"
import { SyncSettingsPanel } from "@/components/widgets/sync-settings-panel"

const monthlyConfig = {
  spent: {
    label: "Spent",
    color: "var(--chart-2)",
  },
  budget: {
    label: "Budget",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const categoryConfig = {
  value: {
    label: "Amount",
    color: "var(--chart-1)",
  },
  top1: { label: "Top 1", color: "var(--chart-1)" },
  top2: { label: "Top 2", color: "var(--chart-2)" },
  top3: { label: "Top 3", color: "var(--chart-3)" },
  top4: { label: "Top 4", color: "var(--chart-4)" },
  others: { label: "Others", color: "var(--chart-5)" },
} satisfies ChartConfig

function toMonthKey(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function downloadCsv(filename: string, header: string[], rows: Array<Array<string | number>>) {
  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function HomePage() {
  const { user, loading } = useAuthUser()
  const { transactions, lastSynced, mobileCount, refreshLocal } = useTransactions(user?.uid ?? null)
  const [timeRange, setTimeRange] = React.useState<"3m" | "6m" | "12m">("6m")
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  const userName = React.useMemo(() => {
    if (user?.displayName?.trim()) return user.displayName.trim()
    if (user?.email?.trim()) return user.email.trim().split("@")[0]
    return "there"
  }, [user?.displayName, user?.email])

  const totals = React.useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") acc.income += Math.abs(tx.amount)
        else acc.expense += Math.abs(tx.amount)
        return acc
      },
      { income: 0, expense: 0 }
    )
  }, [transactions])

  const net = totals.income - totals.expense
  const savingsRate = totals.income > 0 ? Math.max(0, Math.round((net / totals.income) * 100)) : 0

  const monthlySeries = React.useMemo(() => {
    const bucket = new Map<string, { income: number; expense: number }>()

    for (const tx of transactions) {
      const month = toMonthKey(tx.date)
      if (!month) continue

      const current = bucket.get(month) ?? { income: 0, expense: 0 }
      if (tx.type === "income") current.income += Math.abs(tx.amount)
      else current.expense += Math.abs(tx.amount)
      bucket.set(month, current)
    }

    return Array.from(bucket.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => {
        const spent = Math.round(values.expense)
        const budget = Math.round(spent === 0 ? values.income * 0.6 : spent * 1.08)
        return {
          month,
          label: new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "short" }),
          spent,
          budget,
        }
      })
  }, [transactions])

  const visibleMonthlySeries = React.useMemo(() => {
    const limit = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
    return monthlySeries.slice(-limit)
  }, [monthlySeries, timeRange])

  const categorySeries = React.useMemo(() => {
    const byTag = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.type !== "expense") continue
      const key = tx.tags[0] || "Misc"
      byTag.set(key, (byTag.get(key) ?? 0) + Math.abs(tx.amount))
    }

    const sorted = Array.from(byTag.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))

    const top = sorted.slice(0, 4).map((item, index) => ({ ...item, colorKey: `top${index + 1}` }))
    const rest = sorted.slice(4).reduce((sum, item) => sum + item.value, 0)
    if (rest > 0) top.push({ name: "Others", value: rest, colorKey: "others" })

    const total = top.reduce((sum, item) => sum + item.value, 0)

    return top.map((item) => ({
      ...item,
      share: total === 0 ? 0 : Math.round((item.value / total) * 100),
    }))
  }, [transactions])

  React.useEffect(() => {
    if (!categorySeries.length) {
      setActiveCategory(null)
      return
    }

    if (!activeCategory || !categorySeries.some((item) => item.name === activeCategory)) {
      setActiveCategory(categorySeries[0].name)
    }
  }, [activeCategory, categorySeries])

  const activeCategoryValue = categorySeries.find((item) => item.name === activeCategory)

  const handleExportMonthly = () => {
    downloadCsv(
      "finance-expense-vs-budget.csv",
      ["Month", "Spent", "Budget"],
      visibleMonthlySeries.map((row) => [row.label, row.spent, row.budget])
    )
  }

  const handleExportCategory = () => {
    downloadCsv(
      "finance-category-spend.csv",
      ["Category", "Amount", "Share"],
      categorySeries.map((row) => [row.name, row.value, `${row.share}%`])
    )
  }

  const metrics = [
    { label: "Income", value: totals.income, delta: "+12.4%" },
    { label: "Expenses", value: totals.expense, delta: "+6.1%" },
    { label: "Net", value: net, delta: net >= 0 ? "+18.3%" : "-5.4%" },
    { label: "Savings", value: `${savingsRate}%`, delta: "+3.8%", text: true },
  ]

  return (
    <div className="grid gap-6">
      <header className="border bg-card p-4">
        <h1 className="font-heading text-3xl font-semibold">Hey, {userName} 👋</h1>
        <p className="text-sm text-muted-foreground">Track your spends with Cashtrack Today!  </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label} size="sm">
            <CardHeader className="border-b">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">
                {item.text ? item.value : `₹${Number(item.value).toLocaleString("en-IN")}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Badge variant="outline" className="gap-1">
                <IconArrowUpRight className="size-3" />
                {item.delta}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Expense vs Budget</CardTitle>
                <CardDescription>Dashboard-2 style area graph for monthly finance planning.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as "3m" | "6m" | "12m")}>
                  <TabsList>
                    <TabsTrigger value="3m">3M</TabsTrigger>
                    <TabsTrigger value="6m">6M</TabsTrigger>
                    <TabsTrigger value="12m">12M</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" onClick={handleExportMonthly}>Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={monthlyConfig} className="h-[320px] w-full">
              <AreaChart data={visibleMonthlySeries} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-spent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-spent)" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-budget)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--color-budget)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="budget" stroke="var(--color-budget)" fill="url(#budgetGradient)" strokeWidth={1.5} strokeDasharray="6 4" />
                <Area type="monotone" dataKey="spent" stroke="var(--color-spent)" fill="url(#spentGradient)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Category Spend Mix</CardTitle>
                <CardDescription>Dashboard-2 pie chart interaction with finance category naming.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportCategory}>Export</Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <ChartContainer config={categoryConfig} className="mx-auto h-[300px] w-full max-w-[320px]">
              <PieChart>
                <Pie data={categorySeries} dataKey="value" nameKey="name" innerRadius={62} outerRadius={106} strokeWidth={4} labelLine={false}>
                  {categorySeries.map((slice) => (
                    <Cell key={slice.name} fill={`var(--color-${slice.colorKey})`} fillOpacity={!activeCategory || slice.name === activeCategory ? 1 : 0.35} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>

            <div className="grid content-start gap-2">
              {categorySeries.length === 0 ? <p className="text-sm text-muted-foreground">No expense data yet.</p> : null}
              {activeCategoryValue ? (
                <div className="border bg-muted/40 p-2 text-sm">
                  <p className="font-medium">Focused category: {activeCategoryValue.name}</p>
                  <p className="text-muted-foreground">
                    ₹{activeCategoryValue.value.toLocaleString("en-IN")} ({activeCategoryValue.share}%)
                  </p>
                </div>
              ) : null}
              {categorySeries.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className={`flex items-center justify-between border p-2 text-sm ${activeCategory === item.name ? "bg-muted" : ""}`}
                  onClick={() => setActiveCategory(item.name)}
                >
                  <span>{item.name}</span>
                  <span className="font-mono tabular-nums">₹{item.value.toLocaleString("en-IN")} ({item.share}%)</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <SyncSettingsPanel userUid={user?.uid ?? null} authLoading={loading} mobileCount={mobileCount} lastSynced={lastSynced} onRefreshLocal={refreshLocal} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ScanBillsWidget />
        <ReportWidget />
      </div>
    </div>
  )
}