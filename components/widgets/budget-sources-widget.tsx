"use client"

import * as React from "react"
import { IconDotsVertical, IconDotsCircleHorizontal, IconPlane, IconReceipt, IconShoppingCart } from "@tabler/icons-react"
import { Cell, Pie, PieChart } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { useTransactions } from "@/hooks/use-transactions"

type BudgetCategory = {
  key: string
  name: string
  budget: number
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const budgetPlan: BudgetCategory[] = [
  { key: "bills", name: "Bills", budget: 18000, color: "#3b82f6", icon: IconReceipt },
  { key: "food", name: "Food", budget: 12000, color: "#22c55e", icon: IconShoppingCart },
  { key: "travel", name: "Travel", budget: 9000, color: "#fb923c", icon: IconPlane },
  { key: "shopping", name: "Shopping", budget: 7000, color: "#a855f7", icon: IconShoppingCart },
  { key: "misc", name: "Misc", budget: 4000, color: "#ec4899", icon: IconDotsCircleHorizontal },
]

function currency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

function currentMonthKey(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function BudgetSourcesWidget({ userUid }: { userUid: string | null }) {
  const { transactions } = useTransactions(userUid)
  const [activeCategory, setActiveCategory] = React.useState<string>(budgetPlan[0].key)

  const rows = React.useMemo(() => {
    const currentMonth = currentMonthKey(new Date().toISOString())
    const spentByCategory = new Map<string, number>()

    for (const transaction of transactions) {
      if (transaction.type !== "expense") continue
      if (currentMonthKey(transaction.date) !== currentMonth) continue

      const tag = String(transaction.tags[0] ?? "misc").toLowerCase()
      const normalizedTag = budgetPlan.some((item) => item.key === tag) ? tag : "misc"
      spentByCategory.set(normalizedTag, (spentByCategory.get(normalizedTag) ?? 0) + Math.abs(transaction.amount))
    }

    return budgetPlan.map((category) => {
      const spent = Math.round(spentByCategory.get(category.key) ?? 0)
      const left = category.budget - spent
      const used = category.budget > 0 ? Math.min(100, Math.round((spent / category.budget) * 100)) : 0
      return {
        ...category,
        spent,
        left,
        used,
        overBudget: left < 0,
      }
    })
  }, [transactions])

  React.useEffect(() => {
    if (!rows.some((row) => row.key === activeCategory)) {
      setActiveCategory(rows[0]?.key ?? budgetPlan[0].key)
    }
  }, [activeCategory, rows])

  const totalBudget = rows.reduce((sum, row) => sum + row.budget, 0)
  const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0)
  const totalLeft = totalBudget - totalSpent
  const activeRow = rows.find((row) => row.key === activeCategory) ?? rows[0]

  const chartConfig = React.useMemo(() => {
    return Object.fromEntries(rows.map((row) => [row.key, { label: row.name, color: row.color }])) satisfies ChartConfig
  }, [rows])

  return (
    <Card className="overflow-hidden border-border/60 bg-card text-foreground shadow-xl shadow-black/5 dark:shadow-slate-950/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-muted/25">
        <div className="space-y-1">
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>Track monthly spend and remaining budget by category.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-muted">
          <IconDotsVertical className="size-5" />
        </Button>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="relative mx-auto flex w-full max-w-[380px] items-center justify-center">
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <PieChart>
              {rows.map((row, index) => {
                const innerRadius = 46 + index * 18
                const outerRadius = innerRadius + 12
                const spentSlice = Math.min(row.spent, row.budget)
                const remainingSlice = Math.max(row.budget - row.spent, 0)

                return (
                  <Pie
                    key={row.key}
                    data={[
                      { name: row.key, value: spentSlice },
                      { name: `${row.key}-remaining`, value: remainingSlice },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    stroke="none"
                    cornerRadius={999}
                    onMouseEnter={() => setActiveCategory(row.key)}
                  >
                    <Cell fill={row.color} fillOpacity={activeCategory === row.key ? 1 : 0.86} />
                    <Cell fill="hsl(var(--muted))" fillOpacity={activeCategory === row.key ? 0.95 : 0.65} />
                  </Pie>
                )
              })}
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">Budget left</p>
            <p className={cn("mt-3 text-4xl font-semibold tracking-tight", totalLeft < 0 ? "text-rose-500" : "text-foreground")}>
              {currency(Math.abs(totalLeft))}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {currency(totalSpent)} spent of {currency(totalBudget)}
            </p>
            {activeRow ? (
              <Badge variant="outline" className="mt-4 border-border/60 bg-muted/40 text-foreground">
                Focus: {activeRow.name}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <button
              key={row.key}
              type="button"
              onClick={() => setActiveCategory(row.key)}
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-left transition hover:bg-muted/35",
                activeCategory === row.key && "border-border bg-muted/40 shadow-lg shadow-black/10"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${row.color}22`, color: row.color }}>
                  <row.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{row.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Budget {currency(row.budget)} · Spent {currency(row.spent)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className={cn("font-semibold tabular-nums", row.left < 0 ? "text-rose-500" : "text-foreground")}>{currency(Math.abs(row.left))}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-border/60 bg-muted/35 text-foreground",
                    row.overBudget ? "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  )}
                >
                  {row.overBudget ? `${row.used}% used` : `${row.used}% used`}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}