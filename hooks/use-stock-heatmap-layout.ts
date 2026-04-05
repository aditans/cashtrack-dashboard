import * as React from "react"

import type { HeatmapNode, MetricMode, StockHeatmapItem } from "@/components/widgets/stock-heatmap/types"

interface UseStockHeatmapLayoutInput {
  stocks: StockHeatmapItem[]
  selectedSector: string
  zoomedSector: string | null
  weightByMarketCap: boolean
  metricMode: MetricMode
  searchQuery: string
}

export function useStockHeatmapLayout({
  stocks,
  selectedSector,
  zoomedSector,
  weightByMarketCap,
  metricMode,
  searchQuery,
}: UseStockHeatmapLayoutInput) {
  const deferredQuery = React.useDeferredValue(searchQuery.trim().toLowerCase())

  return React.useMemo(() => {
    const activeSector = zoomedSector ?? selectedSector
    const base = activeSector === "All" ? stocks : stocks.filter((item) => item.sector === activeSector)

    const nodes: HeatmapNode[] = base
      .map((item) => {
        const absChange = (item.price * item.changePercent) / 100
        const metricValue = metricMode === "percent" ? item.changePercent : absChange

        return {
          ...item,
          value: weightByMarketCap ? item.marketCap : 1,
          metricValue,
          highlight:
            deferredQuery.length > 0 &&
            (item.symbol.toLowerCase().includes(deferredQuery) || item.name.toLowerCase().includes(deferredQuery)),
        }
      })
      .sort((a, b) => b.value - a.value)

    return nodes
  }, [stocks, selectedSector, zoomedSector, weightByMarketCap, metricMode, deferredQuery])
}
