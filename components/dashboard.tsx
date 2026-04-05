"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts"
import {
  IconArrowUpRight,
  IconBrandInstagram,
  IconChartBar,
  IconCalendar,
  IconExternalLink,
  IconHome,
  IconMenu2,
  IconMessageCircle,
  IconReceipt,
  IconCopy,
  IconDots,
  IconDownload,
  IconFileText,
  IconMail,
  IconPhotoScan,
  IconPlus,
  IconSearch,
  IconSettings,
  IconShare,
  IconSparkles,
  IconStarFilled,
  IconUpload,
  IconUsers,
  IconX,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

const trendChartConfig = {
  income: { label: "Income", color: "var(--primary)" },
  expense: { label: "Expense", color: "var(--chart-1)" },
} satisfies ChartConfig

const categoryChartConfig = {
  food: { label: "Food", color: "#22c55e" },
  bills: { label: "Bills", color: "#ef4444" },
  travel: { label: "Travel", color: "#3b82f6" },
  shopping: { label: "Shopping", color: "#f97316" },
  misc: { label: "Misc", color: "#eab308" },
} satisfies ChartConfig

const overviewCards = [
  { label: "Total income", value: 184250, delta: "+12.4%", note: "Money received this month" },
  { label: "Total expenses", value: 132840, delta: "+6.1%", note: "Spending tracked for the current month" },
  { label: "Net balance", value: 51410, delta: "+18.3%", note: "Balance after all credits and debits" },
  { label: "Savings rate", value: 28, delta: "+3.8%", note: "After expenses and recurring payments" },
] as const

const trendSeries = {
  week: [
    { date: "Mon", income: 12600, expense: 8400 },
    { date: "Tue", income: 13900, expense: 9100 },
    { date: "Wed", income: 14600, expense: 9800 },
    { date: "Thu", income: 15800, expense: 11300 },
    { date: "Fri", income: 16950, expense: 12100 },
    { date: "Sat", income: 17800, expense: 11700 },
  ],
  month: [
    { date: "Jan", income: 12800, expense: 9600 },
    { date: "Feb", income: 13600, expense: 10100 },
    { date: "Mar", income: 14850, expense: 11250 },
    { date: "Apr", income: 15400, expense: 11800 },
    { date: "May", income: 16450, expense: 12100 },
    { date: "Jun", income: 17500, expense: 12900 },
  ],
  quarter: [
    { date: "Q1", income: 39250, expense: 31000 },
    { date: "Q2", income: 42700, expense: 33900 },
    { date: "Q3", income: 45250, expense: 34900 },
    { date: "Q4", income: 48400, expense: 36700 },
  ],
} as const

const spendBreakdown = [
  { name: "Food", value: 34 },
  { name: "Bills", value: 26 },
  { name: "Travel", value: 18 },
  { name: "Shopping", value: 12 },
  { name: "Misc", value: 10 },
]

const transactions = [
  { name: "Grocery mart", category: "Food", amount: 1840, status: "Paid", time: "2h ago", mode: "UPI" },
  { name: "Metro card reload", category: "Travel", amount: 500, status: "Paid", time: "5h ago", mode: "Card" },
  { name: "Electricity board", category: "Bills", amount: 2140, status: "Pending", time: "9h ago", mode: "Net Banking" },
  { name: "Weekend shopping", category: "Shopping", amount: 3890, status: "Overdue", time: "1d ago", mode: "UPI" },
  { name: "Coffee lab", category: "Food", amount: 420, status: "Paid", time: "2d ago", mode: "Cash" },
] as const

const recurringTransactions = [
  { name: "Spotify", amount: 299, occurrences: 6, tag: "Subscriptions" },
  { name: "Netflix", amount: 649, occurrences: 6, tag: "Subscriptions" },
  { name: "Electricity bill", amount: 2140, occurrences: 4, tag: "Bills" },
  { name: "Uber", amount: 870, occurrences: 8, tag: "Travel" },
]

const reviews = [
  {
    name: "Krishiv Shah",
    role: "Beta user",
    text: "The recurring transaction detection is the first thing that made my spending feel organized.",
  },
  {
    name: "Parv Arora",
    role: "Early tester",
    text: "The dashboard makes it obvious where the money is going without making me hunt through menus.",
  },
  {
    name: "Sandeep Sakunde",
    role: "Power user",
    text: "The scan-bill flow and the monthly report export are the two features I keep coming back to.",
  },
] as const

type LegacyNavKey = "home" | "transactions" | "analytics" | "calendar" | "splits" | "chippy"

const legacySidebarItems: Array<{
  key: LegacyNavKey
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "home", label: "Home", href: "overview", icon: IconHome },
  { key: "transactions", label: "Transactions", href: "transactions", icon: IconReceipt },
  { key: "analytics", label: "Analytics", href: "analytics", icon: IconChartBar },
  { key: "calendar", label: "Calendar", href: "calendar", icon: IconCalendar },
  { key: "splits", label: "Splits", href: "splits", icon: IconUsers },
  { key: "chippy", label: "Chippy", href: "chippy", icon: IconMessageCircle },
]

function formatCurrency(value: number) {
  return currency.format(value)
}

function TrendChart({ data }: { data: ReadonlyArray<{ date: string; income: number; expense: number }> }) {
  return (
    <ChartContainer config={trendChartConfig} className="h-[320px] w-full">
      <AreaChart data={[...data]} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.7} />
            <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="expense" type="natural" fill="url(#fillExpense)" stroke="var(--color-expense)" stackId="a" />
        <Area dataKey="income" type="natural" fill="url(#fillIncome)" stroke="var(--color-income)" stackId="a" />
      </AreaChart>
    </ChartContainer>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function DashboardPage() {
  const [activeNav, setActiveNav] = React.useState<LegacyNavKey>("home")
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [reportMonth, setReportMonth] = React.useState(() => new Date())
  const [scanPreview, setScanPreview] = React.useState<string | null>(null)
  const [scanName, setScanName] = React.useState<string | null>(null)
  const [scanStatus, setScanStatus] = React.useState<"idle" | "ready" | "uploaded">("idle")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const currentMonthLabel = reportMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    : "Pick a day"

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setScanName(file.name)
    setScanStatus("ready")

    const reader = new FileReader()
    reader.onload = () => {
      setScanPreview(typeof reader.result === "string" ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  const handleResetScan = () => {
    setScanPreview(null)
    setScanName(null)
    setScanStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFakeUpload = () => {
    if (scanPreview) {
      setScanStatus("uploaded")
    }
  }

  const shiftReportMonth = (offset: number) => {
    setReportMonth((current) => {
      const next = new Date(current)
      next.setMonth(current.getMonth() + offset)
      return next
    })
  }

  const handleSidebarNavigation = (item: (typeof legacySidebarItems)[number]) => {
    setActiveNav(item.key)
    const section = document.getElementById(item.href)
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setSidebarOpen(false)
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-start justify-between gap-4 border-b p-4">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">CashTrack</Badge>
          <CardTitle className="text-2xl">Command center</CardTitle>
          <CardDescription>Legacy nav restored with updated shadcn-style icons.</CardDescription>
        </div>
        <div className="flex size-10 items-center justify-center border border-border bg-muted font-heading text-sm font-medium text-foreground">CT</div>
      </div>

      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex items-center gap-2 rounded-none border border-input bg-background px-3 py-2 shadow-xs">
          <IconSearch className="size-4 text-muted-foreground" />
          <Input className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" placeholder="Search workspace" />
        </div>

        <Separator />

        <nav className="flex flex-col gap-1">
          {legacySidebarItems.map((item) => {
            const ItemIcon = item.icon
            const active = activeNav === item.key

            return (
              <Button
                key={item.key}
                type="button"
                variant="ghost"
                onClick={() => handleSidebarNavigation(item)}
                className={`justify-start gap-3 border px-3 ${active ? "border-primary/20 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"}`}
              >
                <ItemIcon className="size-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <Separator />

        <Item variant="muted" className="items-start">
          <ItemContent>
            <ItemTitle>Next billing run</ItemTitle>
            <ItemDescription>94 invoices are scheduled for tomorrow morning.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="outline">Ready</Badge>
          </ItemActions>
        </Item>

        <Item variant="outline" size="sm">
          <ItemContent>
            <ItemTitle>Daily closeout</ItemTitle>
            <ItemDescription>Cash position is above target by 18%.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="secondary">Healthy</Badge>
          </ItemActions>
        </Item>
      </CardContent>

      <div className="mt-auto border-t p-3">
        <a
          href="https://www.instagram.com/cashtrack_app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-none border border-transparent px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted"
        >
          <IconBrandInstagram className="size-4 text-pink-500" />
          <span className="truncate">@cashtrack_app</span>
          <IconExternalLink className="ml-auto size-3" />
        </a>
      </div>
    </>
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.8),_rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,0.92),_rgba(2,6,23,0.7))]" />

      <header className="sticky top-0 z-30 border-b bg-background/90 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSidebarOpen((open) => !open)} className="lg:hidden" aria-label="Toggle sidebar">
              <IconMenu2 className="size-5" />
            </Button>
            <div className="flex size-8 items-center justify-center border border-border bg-muted font-heading text-xs font-medium">CT</div>
            <span className="font-heading text-base font-semibold tracking-tight">CashTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:inline">you@cashtrack.app</span>
            <Avatar>
              <AvatarFallback>YS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform duration-200 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm font-medium text-muted-foreground">Menu</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <IconX className="size-4" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-6">
        <aside className="hidden lg:block">
          <Card className="sticky top-20 h-[calc(100vh-7rem)] min-h-[560px]">
            <SidebarContent />
          </Card>
        </aside>

        <section className="flex min-w-0 flex-col gap-6" id="overview">
          <header className="flex flex-col gap-4 border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Live</Badge>
                <Badge variant="outline">Updated 2m ago</Badge>
                <Badge variant="secondary">Q2 close</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">CashTrack dashboard</h1>
                <p className="max-w-2xl text-xs/relaxed text-muted-foreground sm:text-sm">
                  A root-level shadcn dashboard that mirrors the richer old dashboard flows without relying on the context folder.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm"><IconDownload className="size-4" /> Export</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="More actions"><IconDots className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem><IconCopy className="size-4" /> Duplicate report</DropdownMenuItem>
                    <DropdownMenuItem><IconShare className="size-4" /> Share dashboard</DropdownMenuItem>
                    <DropdownMenuItem><IconSettings className="size-4" /> Settings</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Archive workspace</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm"><IconPlus className="size-4" /> New report</Button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => (
              <Card key={card.label} size="sm" className="border-border/70">
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <CardDescription>{card.label}</CardDescription>
                      <CardTitle className="text-2xl tabular-nums sm:text-3xl">
                        {card.label === "Savings rate" ? `${card.value}%` : formatCurrency(card.value)}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <IconArrowUpRight className="size-3" />
                      {card.delta}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-xs/relaxed text-muted-foreground">{card.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div id="analytics" className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.95fr)]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-1">
                  <CardTitle>Income and expense trend</CardTitle>
                  <CardDescription>Last 12 weeks of inflow and outflow, presented in a clean shadcn chart surface.</CardDescription>
                </div>
                <CardAction>
                  <Badge variant="secondary">+18.2% QoQ</Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 pt-4">
                <Tabs defaultValue="month" className="w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <TabsList>
                      <TabsTrigger value="week">7d</TabsTrigger>
                      <TabsTrigger value="month">30d</TabsTrigger>
                      <TabsTrigger value="quarter">QTD</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Income</span>
                      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" />Expense</span>
                    </div>
                  </div>

                  <TabsContent value="week" className="mt-4"><TrendChart data={trendSeries.week} /></TabsContent>
                  <TabsContent value="month" className="mt-4"><TrendChart data={trendSeries.month} /></TabsContent>
                  <TabsContent value="quarter" className="mt-4"><TrendChart data={trendSeries.quarter} /></TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="grid gap-3 border-t p-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1"><span className="text-xs text-muted-foreground">Current income</span><span className="font-heading text-sm font-medium tabular-nums">{formatCurrency(184250)}</span></div>
                <div className="flex flex-col gap-1"><span className="text-xs text-muted-foreground">Current expenses</span><span className="font-heading text-sm font-medium tabular-nums">{formatCurrency(132840)}</span></div>
                <div className="flex flex-col gap-1"><span className="text-xs text-muted-foreground">Net savings</span><span className="font-heading text-sm font-medium tabular-nums">{formatCurrency(51410)}</span></div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-1">
                  <CardTitle>Spending by category</CardTitle>
                  <CardDescription>Expense distribution in a compact pie layout.</CardDescription>
                </div>
                <CardAction>
                  <Badge variant="outline">5 groups</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer config={categoryChartConfig} className="h-[280px] w-full">
                  <PieChart>
                    <Pie data={spendBreakdown} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={3}>
                      {spendBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={categoryChartConfig[entry.name.toLowerCase() as keyof typeof categoryChartConfig]?.color ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {spendBreakdown.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between border p-2 text-xs">
                      <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ backgroundColor: categoryChartConfig[entry.name.toLowerCase() as keyof typeof categoryChartConfig]?.color ?? "#94a3b8" }} />{entry.name}</span>
                      <span className="font-mono tabular-nums">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div id="transactions" className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-1">
                  <CardTitle>Recent transactions</CardTitle>
                  <CardDescription>Inline review of the latest spending records.</CardDescription>
                </div>
                <CardAction>
                  <Badge variant="secondary">5 items</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={`${transaction.name}-${transaction.time}`}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{transaction.name}</span>
                            <span className="text-xs text-muted-foreground">{transaction.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.mode}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "Paid" ? "secondary" : transaction.status === "Pending" ? "outline" : "destructive"}>{transaction.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{formatCurrency(transaction.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card id="scan-bills">
                <CardHeader className="border-b">
                  <CardTitle>Scan bills</CardTitle>
                  <CardDescription>Upload a receipt image and stage it for extraction.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}><IconPhotoScan className="size-4" /> Choose image</Button>
                  {scanPreview ? (
                    <div className="grid gap-3">
                      <div className="overflow-hidden border">
                        <img src={scanPreview} alt={scanName ?? "Scan preview"} className="h-44 w-full object-cover" />
                      </div>
                      <p className="text-xs text-muted-foreground">{scanName}</p>
                      <div className="flex gap-2">
                        <Button onClick={handleFakeUpload}><IconUpload className="size-4" /> Upload</Button>
                        <Button variant="ghost" onClick={handleResetScan}>Reset</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed p-4 text-xs text-muted-foreground">Drop a bill image here or use the button above.</div>
                  )}
                  <Badge variant={scanStatus === "uploaded" ? "secondary" : "outline"}>{scanStatus === "uploaded" ? "Uploaded" : "Waiting for upload"}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Monthly report</CardTitle>
                  <CardDescription>Generate an export for the selected month.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <Button variant="outline" size="icon-sm" onClick={() => shiftReportMonth(-1)} aria-label="Previous month">
                      <IconCalendar className="size-4" />
                    </Button>
                    <span className="font-medium">{currentMonthLabel}</span>
                    <Button variant="outline" size="icon-sm" onClick={() => shiftReportMonth(1)} aria-label="Next month">
                      <IconCalendar className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Button variant="outline"><IconFileText className="size-4" /> Download PDF</Button>
                    <Button variant="outline"><IconMail className="size-4" /> Email report</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Recurring transactions</CardTitle>
                  <CardDescription>Payments that repeat every month and should be tracked.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4">
                  {recurringTransactions.map((entry) => (
                    <Item key={entry.name} variant="outline">
                      <ItemContent>
                        <ItemTitle>{entry.name}</ItemTitle>
                        <ItemDescription>{entry.tag}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge variant="secondary">{entry.occurrences}x</Badge>
                        <span className="font-mono text-xs tabular-nums">{formatCurrency(entry.amount)}</span>
                      </ItemActions>
                    </Item>
                  ))}
                </CardContent>
              </Card>

              <Card id="reviews">
                <CardHeader className="border-b">
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>Feedback from people using the finance workspace.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4">
                  {reviews.map((review) => (
                    <div key={review.name} className="border p-3">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(review.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{review.role}</p>
                            </div>
                            <IconStarFilled className="size-4 text-amber-500" />
                          </div>
                          <p className="text-xs/relaxed text-muted-foreground">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card id="calendar">
                <CardHeader className="border-b">
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>Highlight the selected day in a compact date view.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
                  <div className="border p-3 text-xs text-muted-foreground">Selected: {selectedDateLabel}</div>
                </CardContent>
              </Card>

              <Card id="splits">
                <CardHeader className="border-b">
                  <CardTitle>Splits</CardTitle>
                  <CardDescription>Shared expense workflows from the legacy dashboard are represented here.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border border-dashed p-3 text-xs text-muted-foreground">Split groups and balances will be surfaced in this panel.</div>
                </CardContent>
              </Card>

              <Card id="chippy">
                <CardHeader className="border-b">
                  <CardTitle>Chippy</CardTitle>
                  <CardDescription>Quick assistant entry from the old nav, now styled with the root component system.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border border-dashed p-3 text-xs text-muted-foreground">Assistant conversations and shortcuts can be added here.</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>Quick scratchpad for month-end follow up.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4">
                  <Textarea defaultValue="Confirm invoice aging, approve recurring bills, and share the monthly export with finance." />
                  <div className="flex items-center gap-2">
                    <Progress value={68} />
                    <span className="text-xs text-muted-foreground">68% complete</span>
                  </div>
                  <Button variant="outline"><IconSparkles className="size-4" /> AI recap</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}