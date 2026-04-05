import * as React from "react"

import type { StockHeatmapItem } from "@/components/widgets/stock-heatmap/types"

interface UseStockHeatmapDataOptions {
  realtime?: boolean
  intervalMs?: number
}

function nudge(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function useStockHeatmapData(stocks: StockHeatmapItem[], options: UseStockHeatmapDataOptions = {}) {
  const { realtime = true, intervalMs = 2500 } = options
  const [liveStocks, setLiveStocks] = React.useState<StockHeatmapItem[]>(stocks)

  React.useEffect(() => {
    setLiveStocks(stocks)
  }, [stocks])

  React.useEffect(() => {
    if (!realtime) return

    const timer = window.setInterval(() => {
      setLiveStocks((prev) =>
        prev.map((stock) => {
          const drift = (Math.random() - 0.5) * 0.8
          const nextPercent = nudge(stock.changePercent + drift, -9.9, 9.9)
          const nextPrice = Math.max(1, stock.price * (1 + drift / 100))

          return {
            ...stock,
            changePercent: Number(nextPercent.toFixed(2)),
            price: Number(nextPrice.toFixed(2)),
          }
        })
      )
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, realtime])

  const sectors = React.useMemo(() => {
    return Array.from(new Set(liveStocks.map((item) => item.sector))).sort((a, b) => a.localeCompare(b))
  }, [liveStocks])

  return { liveStocks, sectors }
}
