"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { IconTrendingUp, IconAlertCircle, IconCircleCheck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PortfolioData {
  performers: Array<{
    name: string
    symbol: string
    value: number
    return: string
    bucket: string
    color: string
  }>
  allocations: Array<{
    label: string
    value: number
    color: string
  }>
}

interface RiskProfile {
  score: number
  personality: string
  description: string
  color: string
}

function calculatePortfolioScore(data: PortfolioData): RiskProfile {
  // Calculate diversification score (0-30)
  const buckets = new Set(data.performers.map((p) => p.bucket)).size
  const diversificationScore = Math.min(30, buckets * 4)

  // Calculate risk exposure (0-30)
  const positiveReturns = data.performers.filter((p) => !p.return.startsWith("-")).length
  const riskScore = Math.min(30, (positiveReturns / data.performers.length) * 35)

  // Calculate liquidity score (0-40) based on allocation to liquid assets
  const liquidAssets = ["Mutual Funds", "NPS", "EPF", "Savings Account"]
  const liquidValue = data.performers
    .filter((p) => liquidAssets.includes(p.bucket))
    .reduce((sum, p) => sum + p.value, 0)
  const totalValue = data.performers.reduce((sum, p) => sum + p.value, 0)
  const liquidityScore = Math.min(40, (liquidValue / totalValue) * 45)

  const totalScore = Math.round(diversificationScore + riskScore + liquidityScore)

  // Determine personality based on score
  let personality = ""
  let personDescription = ""
  let color = ""

  if (totalScore < 25) {
    personality = "Conservative"
    personDescription = "You prefer stable, low-risk investments"
    color = "#3B82F6"
  } else if (totalScore < 50) {
    personality = "Balanced"
    personDescription = "You blend safety with growth opportunities"
    color = "#8B5CF6"
  } else if (totalScore < 75) {
    personality = "Aggressive"
    personDescription = "You pursue growth with calculated risks"
    color = "#F59E0B"
  } else {
    personality = "Impulsive Spender"
    personDescription = "You take bold, dynamic investment moves"
    color = "#EF4444"
  }

  return {
    score: totalScore,
    personality,
    description: personDescription,
    color,
  }
}

function generateRecommendations(data: PortfolioData): string[] {
  const recommendations: string[] = []

  // Check for fixed deposits
  const fdValue = data.performers
    .filter((p) => p.bucket === "Banking" || p.name.toLowerCase().includes("deposit"))
    .reduce((sum, p) => sum + p.value, 0)
  const totalValue = data.performers.reduce((sum, p) => sum + p.value, 0)

  if (fdValue > totalValue * 0.35) {
    recommendations.push(
      "You have allocated significant funds in Fixed Deposits. Consider reallocating 15-20% into mutual funds for better long-term growth."
    )
  }

  // Check sector concentration
  const bucketTotals = data.performers.reduce<Record<string, number>>((acc, p) => {
    acc[p.bucket] = (acc[p.bucket] || 0) + p.value
    return acc
  }, {})

  const maxBucket = Object.entries(bucketTotals).sort(([, a], [, b]) => b - a)[0]
  if (maxBucket && maxBucket[1] > totalValue * 0.4) {
    recommendations.push(
      `High concentration in ${maxBucket[0]}. Diversify into other sectors like tech, FMCG, or real estate.`
    )
  }

  // Check for negative returns
  const negativeReturns = data.performers.filter((p) => p.return.startsWith("-")).length
  if (negativeReturns > 2) {
    recommendations.push(
      "Monitor your underperforming assets. Current geopolitical factors may impact certain sectors—review holdings."
    )
  }

  // Check for insurance
  const hasInsurance = data.performers.some((p) => p.bucket === "Insurance")
  if (!hasInsurance) {
    recommendations.push("Consider adding insurance products for wealth protection and tax benefits.")
  }

  // Add a positive recommendation
  const topPerformer = data.performers
    .filter((p) => p.return.startsWith("+"))
    .sort((a, b) => Number.parseFloat(b.return) - Number.parseFloat(a.return))[0]
  if (topPerformer) {
    recommendations.push(`${topPerformer.name} is your best performer (+${topPerformer.return.slice(1)}). Keep momentum.`)
  }

  return recommendations.slice(0, 5)
}

export function PortfolioInsightsWidget({ performers, allocations }: PortfolioData) {
  const riskProfile = calculatePortfolioScore({ performers, allocations })
  const recommendations = generateRecommendations({ performers, allocations })

  return (
    <div className="grid gap-6">
      {/* Portfolio Score Card */}
      <Card className="border-border/60 bg-gradient-to-br from-card via-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Portfolio Insights</span>
            <Badge style={{ backgroundColor: riskProfile.color }} variant="default">
              {riskProfile.personality}
            </Badge>
          </CardTitle>
          <CardDescription>{riskProfile.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Score</p>
              <p className="text-3xl font-bold">{riskProfile.score}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
            <IconTrendingUp className="size-12" style={{ color: riskProfile.color }} />
          </div>

          {/* Asset Allocation Mini Pie */}
          <div>
            <p className="mb-3 text-sm font-medium">Asset Allocation</p>
            <div className="grid gap-3">
              {allocations.map((item) => {
                const total = allocations.reduce((sum, a) => sum + a.value, 0)
                const percentage = Math.round((item.value / total) * 100)
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="inline-block size-2.5 rounded-full" style={{ background: item.color }} />
                        {item.label}
                      </span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-medium">
              <IconAlertCircle className="size-4" />
              AI Recommendations
            </p>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 rounded-lg border border-border/40 bg-muted/10 p-3 text-xs leading-relaxed"
                >
                  <IconCircleCheck className="mt-0.5 size-4 flex-shrink-0 text-emerald-600" />
                  <p className="text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
