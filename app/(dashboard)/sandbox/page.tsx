"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Dot,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Treemap,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconChevronDown,
  IconLayoutGrid,
  IconList,
  IconX,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockHeatmap } from "@/components/widgets/stock-heatmap/stock-heatmap"
import type { StockHeatmapItem } from "@/components/widgets/stock-heatmap/types"
import { PortfolioInsightsWidget } from "@/components/widgets/portfolio-insights-widget"
import { TopPicksSection } from "@/components/widgets/top-picks-section"
import { KYCFlowWidget } from "@/components/widgets/kyc-flow-widget"
import { ChippyBubble } from "@/components/widgets/chippy-bubble"

type TimeRange = "1H" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL"
type ViewMode = "grid" | "list"

interface Performer {
  name: string
  symbol: string
  value: number
  return: string
  color: string
  image: string
  bucket: string
}

interface AllocationItem {
  label: string
  value: number
  color: string
}

type ChartPoint = { time: number; value: number }
type SeriesByRange = Record<TimeRange, ChartPoint[]>

const TIME_RANGES: TimeRange[] = ["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "ALL"]

function hashString(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function buildSeries(seedKey: string, baseValue: number, points: number) {
  const seed = hashString(seedKey)
  const data: ChartPoint[] = []
  let value = baseValue

  for (let i = 0; i < points; i++) {
    const drift = ((seed % 17) - 8) * 0.0012
    const fastWave = Math.sin((i + (seed % 31)) / 2.2) * 0.022
    const midWave = Math.cos((i + (seed % 19)) / 5.8) * 0.015
    const noise = (((seed + i * 37) % 100) / 100 - 0.5) * 0.03
    const spike = i % 17 === 0 ? (((seed + i) % 7) - 3) * 0.02 : 0

    value = Math.max(1, value * (1 + drift + fastWave + midWave + noise + spike))
    data.push({ time: i, value: Math.round(value) })
  }

  return data
}

function getSeriesByRange(symbol: string, baseValue: number): SeriesByRange {
  return {
    "1H": buildSeries(`${symbol}-1H`, baseValue, 36),
    "1D": buildSeries(`${symbol}-1D`, baseValue, 48),
    "1W": buildSeries(`${symbol}-1W`, baseValue, 60),
    "1M": buildSeries(`${symbol}-1M`, baseValue, 76),
    "3M": buildSeries(`${symbol}-3M`, baseValue, 98),
    "6M": buildSeries(`${symbol}-6M`, baseValue, 122),
    "1Y": buildSeries(`${symbol}-1Y`, baseValue, 152),
    ALL: buildSeries(`${symbol}-ALL`, baseValue, 188),
  }
}

const allPerformers: Performer[] = [
  {
    name: "Axis Bluechip Fund",
    symbol: "AXISBC",
    value: 45000,
    return: "+28.5%",
    color: "var(--chart-1)",
    image: "/mutual-funds/axis-bluechip.svg",
    bucket: "Mutual Funds",
  },
  {
    name: "HDFC Top 100 Fund",
    symbol: "HDFCTOP",
    value: 32000,
    return: "+24.3%",
    color: "var(--chart-2)",
    image: "/mutual-funds/hdfc-top100.svg",
    bucket: "Mutual Funds",
  },
  {
    name: "SBI Small Cap Fund",
    symbol: "SBISC",
    value: 15000,
    return: "+35.2%",
    color: "var(--chart-3)",
    image: "/mutual-funds/sbi-smallcap.svg",
    bucket: "Mutual Funds",
  },
  {
    name: "NPS Tier-1",
    symbol: "NPS1",
    value: 31000,
    return: "+12.8%",
    color: "var(--chart-1)",
    image: "/nps/nps-tier1.svg",
    bucket: "NPS",
  },
  {
    name: "NPS Life Stage",
    symbol: "NLSF",
    value: 8000,
    return: "+8.5%",
    color: "var(--chart-2)",
    image: "/nps/nps-lifecycle.svg",
    bucket: "NPS",
  },
  {
    name: "EPF Employee",
    symbol: "EPFEE",
    value: 25000,
    return: "+7.2%",
    color: "var(--chart-1)",
    image: "/epf/epf-employee.svg",
    bucket: "EPF",
  },
  {
    name: "EPF Employer",
    symbol: "EPFER",
    value: 17000,
    return: "+7.2%",
    color: "var(--chart-2)",
    image: "/epf/epf-employer.svg",
    bucket: "EPF",
  },
  {
    name: "Term Life Policy",
    symbol: "TERMLIFE",
    value: 5000000,
    return: "+4.1%",
    color: "var(--chart-4)",
    image: "/insurance/term-life.svg",
    bucket: "Insurance",
  },
  {
    name: "Health Insurance",
    symbol: "HEALTH",
    value: 1000000,
    return: "+3.4%",
    color: "var(--chart-5)",
    image: "/insurance/health.svg",
    bucket: "Insurance",
  },
  {
    name: "Real Estate",
    symbol: "PROPERTY",
    value: 150000,
    return: "+5.2%",
    color: "var(--chart-1)",
    image: "/assets/property.svg",
    bucket: "Net Worth",
  },
  {
    name: "Savings Account",
    symbol: "SAVINGS",
    value: 95000,
    return: "+4.0%",
    color: "var(--chart-2)",
    image: "/assets/savings.svg",
    bucket: "Net Worth",
  },
  {
    name: "Home Loan",
    symbol: "HOMELOAN",
    value: 75000,
    return: "-6.5%",
    color: "var(--chart-4)",
    image: "/loans/home-loan.svg",
    bucket: "Loans",
  },
  {
    name: "Personal Loan",
    symbol: "PERLOAN",
    value: 30000,
    return: "-12.0%",
    color: "var(--chart-5)",
    image: "/loans/personal-loan.svg",
    bucket: "Loans",
  },
]

const topPerformers = allPerformers
  .filter((item) => item.return.startsWith("+"))
  .sort((a, b) => Number.parseFloat(b.return) - Number.parseFloat(a.return))
  .slice(0, 5)

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function RangePicker({
  value,
  onChange,
  stopPropagation,
}: {
  value: TimeRange
  onChange: (next: TimeRange) => void
  stopPropagation?: boolean
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as TimeRange)}
      onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
    >
      <TabsList className="h-8 w-full justify-start gap-1 overflow-x-auto bg-muted/40 p-1">
        {TIME_RANGES.map((range) => (
          <TabsTrigger key={range} className="h-6 px-2 text-[11px]" value={range}>
            {range}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

function PerformerDetailModal({
  performer,
  series,
  onClose,
}: {
  performer: Performer | null
  series: SeriesByRange | null
  onClose: () => void
}) {
  if (!performer || !series) return null

  const modalSeries = series.ALL
  const isPositive = performer.return.startsWith("+")

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b p-4 md:p-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Unified Portfolio View</p>
            <h3 className="text-2xl font-semibold">{performer.name}</h3>
            <p className="text-sm text-muted-foreground">{performer.symbol}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close widget view">
            <IconX className="size-5" />
          </Button>
        </div>

        <div className="grid gap-6 p-4 md:grid-cols-[1.7fr_1fr] md:p-6">
          <Card className="overflow-hidden border-border/50 bg-muted/20">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-base">Portfolio Trajectory</CardTitle>
              <CardDescription>Expanded chart view shown when you click a widget.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={modalSeries} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="expandedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={performer.color} stopOpacity={0.38} />
                        <stop offset="95%" stopColor={performer.color} stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/35" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                    <Area dataKey="value" type="monotone" stroke={performer.color} strokeWidth={2.2} fill="url(#expandedGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-border/50">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-semibold">{formatCurrency(performer.value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">{performer.bucket}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">YTD Return</span>
                  <span className={`font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>{performer.return}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-sm">Top Holdings Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4 text-sm">
                {topPerformers.slice(0, 4).map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between border-b border-border/30 pb-2 last:border-none">
                    <span className="text-muted-foreground">{item.symbol}</span>
                    <span className="font-medium">{item.return}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardChartBackground({
  performer,
  data,
  gradientId,
  className,
}: {
  performer: Performer
  data: ChartPoint[]
  gradientId: string
  className?: string
}) {
  return (
    <div className={className ?? "absolute inset-0 opacity-50"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={performer.color} stopOpacity={0.48} />
              <stop offset="50%" stopColor={performer.color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={performer.color} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/25" />
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Area type="monotone" dataKey="value" stroke={performer.color} strokeWidth={2.2} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function AssetCard({
  performer,
  data,
  timeRange,
  onRangeChange,
  onOpen,
}: {
  performer: Performer
  data: ChartPoint[]
  timeRange: TimeRange
  onRangeChange: (next: TimeRange) => void
  onOpen: (performer: Performer) => void
}) {
  const isPositive = performer.return.startsWith("+")

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden border-border/50 bg-card transition hover:border-border"
      onClick={() => onOpen(performer)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen(performer)
        }
      }}
    >
      <CardChartBackground performer={performer} data={data} gradientId={`bg-grid-${performer.symbol}`} className="absolute inset-0 opacity-45" />

      <div className="relative z-10 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <img src={performer.image} alt={performer.name} width={44} height={44} className="rounded-lg border border-border/50" />
              <div>
                <CardTitle className="text-base md:text-lg">{performer.name}</CardTitle>
                <CardDescription>{performer.symbol}</CardDescription>
              </div>
            </div>
            <Badge className={isPositive ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-500"}>
              {isPositive ? <IconArrowUpRight className="mr-1 size-3" /> : <IconArrowDownLeft className="mr-1 size-3" />}
              {performer.return}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-5">
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(performer.value)}</p>
            <p className="text-xs text-muted-foreground">Tap card to open detailed unified portfolio view</p>
          </div>

          <RangePicker value={timeRange} onChange={onRangeChange} stopPropagation />
        </CardContent>
      </div>
    </Card>
  )
}

function ListRowCard({
  performer,
  data,
  timeRange,
  onRangeChange,
  onOpen,
}: {
  performer: Performer
  data: ChartPoint[]
  timeRange: TimeRange
  onRangeChange: (next: TimeRange) => void
  onOpen: (performer: Performer) => void
}) {
  const isPositive = performer.return.startsWith("+")

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card">
      <CardChartBackground performer={performer} data={data} gradientId={`bg-list-${performer.symbol}`} className="absolute inset-0 opacity-40" />

      <button
        type="button"
        className="relative z-10 flex w-full items-center justify-between gap-4 bg-card/45 px-4 py-3.5 text-left"
        onClick={() => onOpen(performer)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={performer.image} alt={performer.name} width={42} height={42} className="flex-shrink-0 rounded-md border border-border/50" />
          <div className="min-w-0">
            <p className="font-semibold leading-tight text-base">{performer.name}</p>
            <p className="text-xs text-muted-foreground">{performer.symbol}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(performer.value)}</p>
          <Badge className={isPositive ? "mt-1 bg-emerald-500/15 text-emerald-600" : "mt-1 bg-red-500/15 text-red-500"}>
            {isPositive ? <IconArrowUpRight className="mr-1 size-3" /> : <IconArrowDownLeft className="mr-1 size-3" />}
            {performer.return}
          </Badge>
        </div>
      </button>

      <div className="relative z-10 px-4 pb-3" onClick={(event) => event.stopPropagation()}>
        <RangePicker value={timeRange} onChange={onRangeChange} />
      </div>
    </Card>
  )
}

function QuickMetricsPanel() {
  const pnlTrendData = [
    { month: "Jan", value: 3.1 },
    { month: "Feb", value: 4.2 },
    { month: "Mar", value: 3.8 },
    { month: "Apr", value: 5.1 },
    { month: "May", value: 5.8 },
    { month: "Jun", value: 6.4 },
  ]

  const portfolioVsInvestedData = [
    { month: "Jan", invested: 900000, current: 850000 },
    { month: "Feb", invested: 950000, current: 920000 },
    { month: "Mar", invested: 950000, current: 895000 },
    { month: "Apr", invested: 1050000, current: 1010000 },
    { month: "May", invested: 1100000, current: 1085000 },
    { month: "Jun", invested: 1150000, current: 1200000 },
  ]

  const growthComparisonData = [
    { month: "Jan", MF: 45000, NPS: 27000, Stocks: 32000 },
    { month: "Feb", MF: 48000, NPS: 28000, Stocks: 34500 },
    { month: "Mar", MF: 46500, NPS: 27500, Stocks: 33200 },
    { month: "Apr", MF: 52000, NPS: 31000, Stocks: 38000 },
    { month: "May", MF: 56000, NPS: 33500, Stocks: 40200 },
    { month: "Jun", MF: 61000, NPS: 35000, Stocks: 42500 },
  ]

  const liquidityTrendData = [
    { month: "Jan", value: 8.2 },
    { month: "Feb", value: 8.7 },
    { month: "Mar", value: 8.1 },
    { month: "Apr", value: 9.4 },
    { month: "May", value: 9.1 },
    { month: "Jun", value: 9.9 },
  ]

  const riskTrendData = [
    { month: "Jan", value: 4.1 },
    { month: "Feb", value: 4.4 },
    { month: "Mar", value: 3.8 },
    { month: "Apr", value: 4.7 },
    { month: "May", value: 4.5 },
    { month: "Jun", value: 4.2 },
  ]

  return (
    <div className="grid gap-3">
      <Card className="border-border/50">
        <CardContent className="py-3 px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Growth</p>
              <p className="text-sm font-semibold">+11.8%</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthComparisonData} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                    formatter={(value) => `₹${(value as number).toLocaleString("en-IN")}`}
                  />
                  <Line type="monotone" dataKey="MF" stroke="#3B82F6" strokeWidth={1.4} dot={false} />
                  <Line type="monotone" dataKey="NPS" stroke="#8B5CF6" strokeWidth={1.4} dot={false} />
                  <Line type="monotone" dataKey="Stocks" stroke="#10B981" strokeWidth={1.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="py-3 px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">PnL</p>
              <p className="text-sm font-semibold text-emerald-500">+6.4%</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlTrendData} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={1.7} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="py-3 px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Portfolio</p>
              <p className="text-sm font-semibold">₹12.0L</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioVsInvestedData} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                  <defs>
                    <linearGradient id="miniInvestedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="miniCurrentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                    formatter={(value) => `₹${(value as number).toLocaleString("en-IN")}`}
                  />
                  <Area type="monotone" dataKey="invested" stroke="#6366F1" strokeWidth={1.2} fill="url(#miniInvestedGrad)" />
                  <Area type="monotone" dataKey="current" stroke="#10B981" strokeWidth={1.2} fill="url(#miniCurrentGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="py-3 px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Liquidity</p>
              <p className="text-sm font-semibold">9.9%</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liquidityTrendData} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={1.6} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="py-3 px-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Risk</p>
              <p className="text-sm font-semibold text-amber-600">4.2</p>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                    formatter={(value) => `${value}`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={1.6} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InvestmentAllocationMap() {
  const companyIconBySymbol: Partial<Record<string, string>> = {
    HDFCBANK: "/assets/companies/hdfc.png",
    RELIANCE: "/assets/companies/reliance.png",
    TCS: "/assets/companies/tcs.png",
    ICICIBANK: "/assets/companies/icici.png",
    INFY: "/assets/companies/infosys.png",
    ITC: "/assets/companies/itc.png",
    SBI: "/assets/companies/sbi.png",
    LT: "/assets/companies/lnt.png",
    ADANIPORTS: "/assets/companies/adani.png",
    BAJFINANCE: "/assets/companies/finserv.png",
  }

  const stocks: StockHeatmapItem[] = [
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd",
      icon: companyIconBySymbol.HDFCBANK,
      price: 1542.5,
      changePercent: 0.52,
      marketCap: 1175000,
      sector: "Banking",
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      icon: companyIconBySymbol.RELIANCE,
      price: 2948.3,
      changePercent: 0.77,
      marketCap: 1988000,
      sector: "Energy",
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      icon: companyIconBySymbol.TCS,
      price: 4080.1,
      changePercent: -0.17,
      marketCap: 1450000,
      sector: "Tech",
    },
    {
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd",
      icon: companyIconBySymbol.ICICIBANK,
      price: 1182.2,
      changePercent: -0.18,
      marketCap: 833000,
      sector: "Banking",
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd",
      icon: companyIconBySymbol.INFY,
      price: 1628.4,
      changePercent: -2.24,
      marketCap: 677000,
      sector: "Tech",
    },
    { symbol: "HUL", name: "Hindustan Unilever Ltd", price: 2348.8, changePercent: 0.32, marketCap: 545000, sector: "FMCG" },
    {
      symbol: "ITC",
      name: "ITC Ltd",
      icon: companyIconBySymbol.ITC,
      price: 429.6,
      changePercent: -0.35,
      marketCap: 537000,
      sector: "FMCG",
    },
    {
      symbol: "SBI",
      name: "State Bank of India",
      icon: companyIconBySymbol.SBI,
      price: 792.5,
      changePercent: -0.4,
      marketCap: 707000,
      sector: "Banking",
    },
    { symbol: "EMBASSYREIT", name: "Embassy Office Parks REIT", price: 369.2, changePercent: 0.49, marketCap: 32700, sector: "Real Estate" },
    { symbol: "MINDSPACEREIT", name: "Mindspace Business Parks REIT", price: 362.9, changePercent: 0.21, marketCap: 21400, sector: "Real Estate" },
    { symbol: "BIRET", name: "Brookfield India Real Estate Trust", price: 298.4, changePercent: 0.13, marketCap: 16800, sector: "Real Estate" },
    { symbol: "GOLDBEES", name: "Nippon Gold ETF", price: 67.5, changePercent: 0.58, marketCap: 10900, sector: "Gold" },
    { symbol: "HDFCGOLD", name: "HDFC Gold ETF", price: 63.1, changePercent: 0.43, marketCap: 8200, sector: "Gold" },
    { symbol: "SGB2033", name: "Sovereign Gold Bond 2033", price: 7062, changePercent: 0.37, marketCap: 6700, sector: "Gold" },
    {
      symbol: "LT",
      name: "Larsen & Toubro Ltd",
      icon: companyIconBySymbol.LT,
      price: 3658.3,
      changePercent: -0.41,
      marketCap: 503000,
      sector: "Infra",
    },
    {
      symbol: "ADANIPORTS",
      name: "Adani Ports & SEZ",
      icon: companyIconBySymbol.ADANIPORTS,
      price: 1389.2,
      changePercent: 0.62,
      marketCap: 300000,
      sector: "Infra",
    },
    {
      symbol: "BAJFINANCE",
      name: "Bajaj Finance Ltd",
      icon: companyIconBySymbol.BAJFINANCE,
      price: 7068.5,
      changePercent: 0.51,
      marketCap: 436000,
      sector: "Finance",
    },
  ]

  return <StockHeatmap stocks={stocks} />
}

function PortfolioOverview({ allocations, className }: { allocations: AllocationItem[]; className?: string }) {
  const total = allocations.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={`grid gap-3 rounded-xl border border-border/50 bg-card p-3.5 md:p-4 ${className ?? ""}`}>
      <div className="space-y-1.5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Where your money is invested</p>
        <div className="flex h-5 overflow-hidden rounded-full border border-border/40">
          {allocations.map((item) => {
            const width = `${Math.max(6, Math.round((item.value / total) * 100))}%`
            return <div key={item.label} style={{ width, background: item.color }} title={`${item.label} ${width}`} />
          })}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {allocations.map((item) => {
          const share = Math.round((item.value / total) * 100)
          return (
            <div key={item.label} className="flex items-center justify-between border border-border/40 bg-muted/20 px-3 py-2.5 text-base">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <span className="inline-block size-3 rounded-full" style={{ background: item.color }} />
                {item.label}
              </span>
              <span className="font-bold text-base">{share}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SandboxPage() {
  const [showPerformers, setShowPerformers] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const [activeWidget, setActiveWidget] = React.useState<Performer | null>(null)
  const [showKYC, setShowKYC] = React.useState(true)
  const [chippyMessage, setChippyMessage] = React.useState("")

  const [rangesBySymbol, setRangesBySymbol] = React.useState<Record<string, TimeRange>>(() => {
    const defaults: Record<string, TimeRange> = {}
    for (const performer of allPerformers) defaults[performer.symbol] = "1W"
    return defaults
  })

  const allSeriesBySymbol = React.useMemo(() => {
    const output: Record<string, SeriesByRange> = {}
    for (const performer of allPerformers) {
      output[performer.symbol] = getSeriesByRange(performer.symbol, performer.value)
    }
    return output
  }, [])

  React.useEffect(() => {
    // Calculate Chippy personality message
    const positiveReturns = allPerformers.filter((p) => !p.return.startsWith("-")).length
    const totalPerformers = allPerformers.length
    const score = Math.round((positiveReturns / totalPerformers) * 100)

    if (score > 75) {
      setChippyMessage("🚀 You're an Aggressive investor pushing for growth!")
    } else if (score > 50) {
      setChippyMessage("⚖️ You're a Balanced investor with smart diversification.")
    } else if (score > 25) {
      setChippyMessage("🛡️ You're a Conservative investor prioritizing stability.")
    } else {
      setChippyMessage("🎯 You're an Impulsive Spender—watch those quick decisions!")
    }
  }, [])

  const setSymbolRange = React.useCallback((symbol: string, nextRange: TimeRange) => {
    setRangesBySymbol((prev) => ({ ...prev, [symbol]: nextRange }))
  }, [])

  const totalBalance = allPerformers.reduce((sum, item) => sum + item.value, 0)
  const changePercent = 16.0
  const overviewSeries = React.useMemo(() => {
    const rawSeries = buildSeries("NetWorth-6M", totalBalance, 122)
    const reversedValues = [...rawSeries].reverse().map((point) => point.value)
    return rawSeries.map((point, index) => ({ time: point.time, value: reversedValues[index] }))
  }, [totalBalance])

  const allocationRows: AllocationItem[] = [
    { label: "Stocks", value: 920000, color: "#3B82F6" },
    { label: "Mutual Funds", value: 610000, color: "#8B5CF6" },
    { label: "Real Estate", value: 280000, color: "#EC4899" },
    { label: "Gold ETFs", value: 190000, color: "#F59E0B" },
  ]

  const grouped = React.useMemo(() => {
    return allPerformers.reduce<Record<string, Performer[]>>((acc, performer) => {
      if (!acc[performer.bucket]) acc[performer.bucket] = []
      acc[performer.bucket].push(performer)
      return acc
    }, {})
  }, [])

  return (
    <>
      <KYCFlowWidget isOpen={showKYC} onComplete={() => setShowKYC(false)} />
      <ChippyBubble message={chippyMessage} visible={!showKYC} />

      <div className="grid gap-6">
        <header className="border border-border/50 bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-3xl font-semibold">Demat Sandbox</h1>
              <p className="text-sm text-muted-foreground">AI-powered portfolio intelligence with smart recommendations and insights.</p>
            </div>
            <div className="inline-flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <IconLayoutGrid className="size-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <IconList className="size-4" />
                List
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <PortfolioInsightsWidget performers={allPerformers} allocations={allocationRows} />
          <TopPicksSection performers={allPerformers} onSelect={setActiveWidget} maxItems={5} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-1">
            <Card className="relative h-[215px] overflow-hidden border-border/50 bg-card">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-sky-100 dark:from-black dark:via-zinc-950 dark:to-[hsl(var(--primary)/0.65)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.22),transparent_48%)] dark:bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.2),transparent_48%)]" />

              <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-5">
                <div>
                  <p className="text-sm text-slate-600 dark:text-white/70">Overview</p>
                  <p className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-white">
                    {formatCurrency(totalBalance)}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-lg text-emerald-400">
                    {changePercent.toFixed(1)}%
                    <IconArrowUpRight className="size-4" />
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="w-fit gap-2 rounded-full bg-slate-900/85 text-white backdrop-blur hover:bg-slate-900 dark:bg-white/15 dark:text-white dark:hover:bg-white/20"
                  onClick={() => setShowPerformers((prev) => !prev)}
                >
                  {showPerformers ? "Hide" : "Show"}
                  <IconChevronDown className={`size-4 transition ${showPerformers ? "rotate-180" : ""}`} />
                </Button>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewSeries} margin={{ top: 10, right: 15, left: -35, bottom: 10 }}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `Point ${label}`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {showPerformers && (
                <div className="absolute top-full left-0 right-0 z-40 mt-1 overflow-hidden rounded-lg border border-border/50 bg-card shadow-lg">
                  <div className="grid max-h-96 gap-3 overflow-y-auto p-3">
                    {topPerformers.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        className="flex items-center justify-between rounded border border-border/50 bg-muted/30 p-3 text-left transition hover:bg-muted/50"
                        onClick={() => {
                          setActiveWidget(item)
                          setShowPerformers(false)
                        }}
                      >
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(item.value)}</p>
                          <p className="text-xs text-emerald-500">{item.return}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <section>
              <h3 className="mb-3 font-heading text-lg font-semibold">Quick Metrics</h3>
              <QuickMetricsPanel />
            </section>
          </div>

          <div className="lg:col-span-2">
            <div className="grid gap-4">
              <PortfolioOverview allocations={allocationRows} className="h-[215px]" />
              <InvestmentAllocationMap />
            </div>
          </div>
        </div>

        {Object.entries(grouped).map(([bucket, performers]) => (
          <section key={bucket} className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">{bucket}</h2>
              <p className="text-sm text-muted-foreground">{performers.length} widgets</p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {performers.map((performer) => {
                  const selectedRange = rangesBySymbol[performer.symbol] ?? "1W"
                  const data = allSeriesBySymbol[performer.symbol][selectedRange]

                  return (
                    <AssetCard
                      key={performer.symbol}
                      performer={performer}
                      data={data}
                      timeRange={selectedRange}
                      onRangeChange={(next) => setSymbolRange(performer.symbol, next)}
                      onOpen={setActiveWidget}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="grid gap-3">
                {performers.map((performer) => {
                  const selectedRange = rangesBySymbol[performer.symbol] ?? "1W"
                  const data = allSeriesBySymbol[performer.symbol][selectedRange]

                  return (
                    <ListRowCard
                      key={performer.symbol}
                      performer={performer}
                      data={data}
                      timeRange={selectedRange}
                      onRangeChange={(next) => setSymbolRange(performer.symbol, next)}
                      onOpen={setActiveWidget}
                    />
                  )
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <PerformerDetailModal
        performer={activeWidget}
        series={activeWidget ? allSeriesBySymbol[activeWidget.symbol] : null}
        onClose={() => setActiveWidget(null)}
      />
    </>
  )
}
