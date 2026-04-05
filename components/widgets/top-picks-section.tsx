"use client"

import React from "react"
import { IconStar, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Performer {
  name: string
  symbol: string
  value: number
  return: string
  color: string
  image: string
  bucket: string
}

interface TopPicksProps {
  performers: Performer[]
  onSelect?: (performer: Performer) => void
  maxItems?: number
}

function calculateAssetTag(performer: Performer): { label: string; color: string } {
  const returnValue = Number.parseFloat(performer.return)

  if (returnValue > 25) {
    return { label: "High Growth", color: "bg-emerald-100 text-emerald-800" }
  } else if (returnValue > 10) {
    return { label: "Strong Performer", color: "bg-blue-100 text-blue-800" }
  } else if (returnValue > 0) {
    return { label: "Stable", color: "bg-gray-100 text-gray-800" }
  } else {
    return { label: "Risky", color: "bg-red-100 text-red-800" }
  }
}

export function TopPicksSection({
  performers,
  onSelect,
  maxItems = 5,
}: TopPicksProps) {
  // Sort performers by return percentage
  const sortedPerformers = [...performers]
    .sort((a, b) => Number.parseFloat(b.return) - Number.parseFloat(a.return))

  const topPicks = sortedPerformers.slice(0, maxItems)
  const otherAssets = sortedPerformers.slice(maxItems)

  return (
    <div className="grid gap-6">
      {/* Top Picks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconStar className="size-5 fill-amber-500 text-amber-500" />
            Top Picks For You
          </CardTitle>
          <CardDescription>AI-recommended assets based on your portfolio performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPicks.map((performer) => {
            const tag = calculateAssetTag(performer)
            const isPositive = performer.return.startsWith("+")

            return (
              <div
                key={performer.symbol}
                onClick={() => onSelect?.(performer)}
                className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-4 transition-all hover:border-border/80 hover:shadow-md cursor-pointer"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity group-hover:opacity-10" />

                <div className="relative space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm leading-tight">{performer.name}</h4>
                      <p className="text-xs text-muted-foreground">{performer.symbol}</p>
                    </div>
                    <Badge className={`${tag.color} ml-2 whitespace-nowrap`}>{tag.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-muted-foreground">
                      Value: ₹{(performer.value / 1000).toFixed(0)}K
                    </div>
                    <div
                      className={`flex items-center gap-1 font-semibold text-sm ${
                        isPositive ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      <IconTrendingUp className="size-4" />
                      {performer.return}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Other Investments */}
      {otherAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other Investments</CardTitle>
            <CardDescription>{otherAssets.length} assets in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {otherAssets.map((performer) => {
                const tag = calculateAssetTag(performer)
                const isPositive = performer.return.startsWith("+")

                return (
                  <div
                    key={performer.symbol}
                    onClick={() => onSelect?.(performer)}
                    className="cursor-pointer rounded-lg border border-border/40 bg-muted/20 p-3 transition-all hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.symbol}</p>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap text-xs">
                        {performer.return}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
