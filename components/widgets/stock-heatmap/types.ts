export type MetricMode = "percent" | "absolute"

export interface StockHeatmapItem {
  symbol: string
  name: string
  icon?: string
  price: number
  changePercent: number
  marketCap: number
  sector: string
}

export interface HeatmapNode extends StockHeatmapItem {
  value: number
  metricValue: number
  highlight: boolean
}
