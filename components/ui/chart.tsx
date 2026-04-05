"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

type ThemeMap = { light: string; dark: string }

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: ThemeMap
  }
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within ChartContainer")
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & { config: ChartConfig; children: React.ReactElement }) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div data-slot="chart" data-chart={chartId} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, value]) => value.color || value.theme)
  if (!entries.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: entries
          .map(([key, value]) => {
            const light = value.theme?.light ?? value.color
            const dark = value.theme?.dark ?? value.color
            return `
[data-chart=${id}] {
  --color-${key}: ${light};
}
.dark [data-chart=${id}] {
  --color-${key}: ${dark};
}
`
          })
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & { labelFormatter?: (value: unknown) => React.ReactNode }) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const firstItem = payload[0]
  const key = `${firstItem.dataKey ?? firstItem.name ?? "value"}`
  const itemConfig = config[key]
  const resolvedLabel = labelFormatter ? labelFormatter(label) : itemConfig?.label ?? label

  return (
    <div className={cn("grid min-w-32 gap-1 rounded-none border border-border bg-background px-2.5 py-2 text-xs shadow-md", className)}>
      {resolvedLabel ? <div className="font-medium">{resolvedLabel}</div> : null}
      <div className="grid gap-1">
        {payload.map((entry) => {
          const entryKey = `${entry.dataKey ?? entry.name ?? "value"}`
          const entryConfig = config[entryKey]
          return (
            <div key={entryKey} className="flex items-center justify-between gap-3 text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: entry.color ?? "var(--primary)" }} />
                {entryConfig?.label ?? entry.name}
              </span>
              <span className="font-mono tabular-nums text-foreground">{typeof entry.value === "number" ? entry.value.toLocaleString() : String(entry.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }