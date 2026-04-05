"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip, Treemap } from "recharts"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useStockHeatmapData } from "@/hooks/use-stock-heatmap-data"
import { useStockHeatmapLayout } from "@/hooks/use-stock-heatmap-layout"

import type { HeatmapNode, MetricMode, StockHeatmapItem } from "./types"

interface StockHeatmapProps {
  stocks: StockHeatmapItem[]
  className?: string
  onStockClick?: (stock: StockHeatmapItem) => void
}

function formatMarketCap(value: number) {
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(1)}L Cr`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K Cr`
  return `${value.toFixed(0)} Cr`
}

function getColorFromMetric(metric: number) {
  const intensity = Math.min(1, Math.abs(metric) / 8)

  if (metric >= 0) {
    return {
      fill: `rgba(16, 185, 129, ${0.16 + intensity * 0.48})`,
      stroke: `rgba(52, 211, 153, ${0.45 + intensity * 0.4})`,
      badge: "rgba(16, 185, 129, 0.2)",
    }
  }

  return {
    fill: `rgba(244, 63, 94, ${0.16 + intensity * 0.48})`,
    stroke: `rgba(251, 113, 133, ${0.45 + intensity * 0.4})`,
    badge: "rgba(244, 63, 94, 0.2)",
  }
}

function HeatmapTooltip({ active, payload, metricMode }: { active?: boolean; payload?: any[]; metricMode: MetricMode }) {
  if (!active || !payload || payload.length === 0) return null

  const node = payload[0]?.payload as HeatmapNode | undefined
  if (!node || typeof node.marketCap !== "number") return null

  const absMove = (node.price * node.changePercent) / 100

  return (
    <div className="rounded-md border border-border/60 bg-card/95 p-3 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold text-foreground">{node.name}</p>
      <p className="mt-1 text-muted-foreground">{node.symbol}</p>
      <p className="mt-2 text-foreground">Price: ₹{node.price.toLocaleString("en-IN")}</p>
      <p className={cn("text-foreground", node.changePercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
        Change: {node.changePercent > 0 ? "+" : ""}
        {node.changePercent.toFixed(2)}%
      </p>
      <p className="text-foreground">
        {metricMode === "percent" ? "Abs Move:" : "% Move:"} {metricMode === "percent" ? `₹${absMove.toFixed(2)}` : `${node.changePercent.toFixed(2)}%`}
      </p>
      <p className="text-foreground">MCap: {formatMarketCap(node.marketCap)}</p>
      <p className="text-muted-foreground">Sector: {node.sector}</p>
    </div>
  )
}

export function StockHeatmap({ stocks, className, onStockClick }: StockHeatmapProps) {
  const [selectedSector, setSelectedSector] = React.useState<string>("All")
  const [zoomedSector, setZoomedSector] = React.useState<string | null>(null)
  const [weightByMarketCap, setWeightByMarketCap] = React.useState(true)
  const [metricMode, setMetricMode] = React.useState<MetricMode>("percent")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showTinyPanel, setShowTinyPanel] = React.useState(false)

  const { liveStocks, sectors } = useStockHeatmapData(stocks, { realtime: true, intervalMs: 3000 })

  const nodes = useStockHeatmapLayout({
    stocks: liveStocks,
    selectedSector,
    zoomedSector,
    weightByMarketCap,
    metricMode,
    searchQuery,
  })

  const tinyNodes = React.useMemo(() => {
    const total = nodes.reduce((sum, node) => sum + node.value, 0)
    if (total <= 0) return []
    return nodes.filter((node) => node.value / total < 0.02)
  }, [nodes])

  const displayNodes = React.useMemo(() => {
    if (tinyNodes.length < 2) return nodes

    const tinySet = new Set(tinyNodes.map((node) => node.symbol))
    const regularNodes = nodes.filter((node) => !tinySet.has(node.symbol))

    const combinedValue = tinyNodes.reduce((sum, node) => sum + node.value, 0)
    const combinedMarketCap = tinyNodes.reduce((sum, node) => sum + node.marketCap, 0)
    const weightedChange =
      combinedMarketCap > 0
        ? tinyNodes.reduce((sum, node) => sum + node.changePercent * node.marketCap, 0) / combinedMarketCap
        : 0

    const overflowNode: HeatmapNode & { isOverflowGroup: true } = {
      symbol: "MORE",
      name: "More Holdings",
      price: 0,
      changePercent: Number(weightedChange.toFixed(2)),
      marketCap: combinedMarketCap,
      sector: "Mixed",
      metricValue: Number(weightedChange.toFixed(2)),
      highlight: false,
      value: combinedValue,
      isOverflowGroup: true,
    }

    return [...regularNodes, overflowNode]
  }, [nodes, tinyNodes])

  const TreemapTile = React.useMemo(() => {
    return function Tile(props: any) {
      const { x, y, width, height, payload } = props
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null

      const node = payload ?? props
      if (!node || typeof node.metricValue !== "number") return null

      const inset = 2.5
      const tileX = x + inset
      const tileY = y + inset
      const tileW = Math.max(0, width - inset * 2)
      const tileH = Math.max(0, height - inset * 2)
      if (tileW <= 0 || tileH <= 0) return null

      const area = tileW * tileH
      const iconText = String(node.symbol).replace(/[^A-Z]/g, "").slice(0, 2) || "IN"
      const iconSrc = typeof node.icon === "string" && node.icon.length > 0 ? node.icon : null
      const showIcon = area > 520
      const showSymbol = area > 820
      const showValue = area > 1650
      const isOverflowGroup = node.isOverflowGroup === true
      const showOverflowDots = isOverflowGroup
      const charWidth = 7
      const maxChars = Math.max(2, Math.floor((tileW - 26) / charWidth))
      const safeSymbol = String(node.symbol)
      const iconSize = area < 1300 ? 14 : 18
      const iconRadius = iconSize / 2
      const iconCenterX = tileX + 8 + iconRadius
      const iconCenterY = tileY + 8 + iconRadius
      const iconClipId = `tile-icon-${safeSymbol}-${Math.round(tileX)}-${Math.round(tileY)}`
      const symbolText = safeSymbol.length > maxChars ? `${safeSymbol.slice(0, maxChars - 1)}…` : safeSymbol
      const valueText = `${node.changePercent > 0 ? "+" : ""}${node.changePercent.toFixed(2)}%`
      const isPositive = node.changePercent >= 0

      const colors = getColorFromMetric(node.metricValue)
      const textClass = isPositive ? "fill-emerald-800 dark:fill-emerald-100" : "fill-rose-800 dark:fill-rose-100"
      const iconTextClass = isPositive ? "fill-emerald-900 dark:fill-emerald-50" : "fill-rose-900 dark:fill-rose-50"
      const symbolFont = area < 1300 ? 9 : area < 2600 ? 10 : 12
      const valueFont = area < 1500 ? 9 : 11

      return (
        <g>
          <rect
            x={tileX}
            y={tileY}
            width={tileW}
            height={tileH}
            rx={8}
            ry={8}
            fill={colors.fill}
            stroke={node.highlight ? "#facc15" : colors.stroke}
            strokeWidth={node.highlight ? 1.8 : 1}
            style={{ transition: "all 240ms ease" }}
          />

          {showIcon && !isOverflowGroup && (
            <>
              <circle cx={iconCenterX} cy={iconCenterY} r={iconRadius + 1} fill={colors.badge} />
              {iconSrc ? (
                <>
                  <defs>
                    <clipPath id={iconClipId}>
                      <circle cx={iconCenterX} cy={iconCenterY} r={iconRadius} />
                    </clipPath>
                  </defs>
                  <image
                    href={iconSrc}
                    x={iconCenterX - iconRadius}
                    y={iconCenterY - iconRadius}
                    width={iconSize}
                    height={iconSize}
                    preserveAspectRatio="xMidYMid meet"
                    clipPath={`url(#${iconClipId})`}
                  />
                </>
              ) : (
                <text x={iconCenterX} y={iconCenterY + 2.5} textAnchor="middle" fontSize={7} className={iconTextClass} fontWeight={700}>
                  {iconText}
                </text>
              )}
            </>
          )}

          {showSymbol && !isOverflowGroup && (
            <text x={tileX + (showIcon ? 8 + iconSize + 8 : 8)} y={tileY + 17} fontSize={symbolFont} className={textClass} fontWeight={700}>
              {symbolText}
            </text>
          )}

          {showValue && !isOverflowGroup && (
            <text x={tileX + 8} y={tileY + 17 + symbolFont + 6} fontSize={valueFont} className={textClass} fontWeight={600}>
              {valueText}
            </text>
          )}

          {showOverflowDots && (
            <g
              onClick={(event: any) => {
                event?.stopPropagation?.()
                setShowTinyPanel(true)
              }}
              style={{ cursor: "pointer" }}
            >
              <text x={tileX + 8} y={tileY + 16} fontSize={10} className={textClass} fontWeight={700}>
                More
              </text>
              <circle cx={tileX + tileW / 2 - 7} cy={tileY + tileH / 2 + 2} r={2.1} className={textClass} />
              <circle cx={tileX + tileW / 2} cy={tileY + tileH / 2 + 2} r={2.1} className={textClass} />
              <circle cx={tileX + tileW / 2 + 7} cy={tileY + tileH / 2 + 2} r={2.1} className={textClass} />
            </g>
          )}
        </g>
      )
    }
  }, [])

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card p-3.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold">Asset Allocation</p>
          <p className="text-xs text-muted-foreground">Responsive market heatmap</p>
        </div>
        <div className="flex items-center gap-2">
          {zoomedSector && (
            <button
              type="button"
              className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setZoomedSector(null)}
            >
              Exit Zoom
            </button>
          )}
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search stock"
            className="h-8 w-36 text-xs"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedSector("All")
            setZoomedSector(null)
          }}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs",
            selectedSector === "All" && !zoomedSector ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground"
          )}
        >
          All
        </button>
        {sectors.map((sector) => (
          <button
            key={sector}
            type="button"
            onClick={() => {
              setSelectedSector(sector)
              setZoomedSector(sector)
            }}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs",
              selectedSector === sector || zoomedSector === sector ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground"
            )}
          >
            {sector}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Tabs value={weightByMarketCap ? "weighted" : "equal"} onValueChange={(v) => setWeightByMarketCap(v === "weighted")}>
          <TabsList className="h-8">
            <TabsTrigger value="weighted" className="text-xs">MCap Weight</TabsTrigger>
            <TabsTrigger value="equal" className="text-xs">Equal Weight</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={metricMode} onValueChange={(v) => setMetricMode(v as MetricMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="percent" className="text-xs">% Change</TabsTrigger>
            <TabsTrigger value="absolute" className="text-xs">Abs Change</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>-8%</span>
        <div className="h-2 w-56 rounded-full bg-gradient-to-r from-rose-500/70 via-zinc-300/80 to-emerald-500/70 dark:via-zinc-700/60" />
        <span>+8%</span>
      </div>

      <div className="mt-3 h-[440px] w-full rounded-lg border border-border/40 bg-slate-100 p-1.5 dark:bg-zinc-950/90">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={displayNodes}
            dataKey="value"
            stroke="hsl(var(--border))"
            content={<TreemapTile />}
            isAnimationActive
            animationDuration={360}
            onClick={(entry: any) => {
              const node = entry?.payload as StockHeatmapItem | undefined
              if (!node || (node as any).isOverflowGroup) {
                if ((node as any)?.isOverflowGroup) setShowTinyPanel(true)
                return
              }
              if (!onStockClick) return
              onStockClick(node)
            }}
          >
            <Tooltip content={<HeatmapTooltip metricMode={metricMode} />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {showTinyPanel && tinyNodes.length > 0 && (
        <div className="mt-3 rounded-lg border border-border/60 bg-card/95 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Small-cap tiles</p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowTinyPanel(false)}
            >
              Close
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tinyNodes.map((item) => (
              <button
                key={item.symbol}
                type="button"
                className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-2.5 py-2 text-left"
                onClick={() => onStockClick?.(item)}
              >
                <span className="text-xs font-medium text-foreground">{item.symbol}</span>
                <span className={cn("text-xs font-semibold", item.changePercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {item.changePercent > 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
