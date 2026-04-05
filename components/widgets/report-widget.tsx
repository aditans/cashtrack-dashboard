"use client"

import * as React from "react"
import { IconDownload, IconFileText, IconMail, IconRefresh } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function ReportWidget() {
  const now = new Date()
  const [month, setMonth] = React.useState(now.getMonth())
  const [year, setYear] = React.useState(now.getFullYear())
  const [generating, setGenerating] = React.useState(false)
  const [generated, setGenerated] = React.useState(false)

  const label = `${MONTHS[month]} ${year}`

  const nextMonth = () => {
    setGenerated(false)
    setMonth((current) => {
      if (current === 11) {
        setYear((value) => value + 1)
        return 0
      }
      return current + 1
    })
  }

  const prevMonth = () => {
    setGenerated(false)
    setMonth((current) => {
      if (current === 0) {
        setYear((value) => value - 1)
        return 11
      }
      return current - 1
    })
  }

  const generate = async () => {
    setGenerating(true)
    setGenerated(false)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setGenerating(false)
    setGenerated(true)
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Monthly Report</CardTitle>
        <CardDescription>Old monthly report workflow adapted to root shadcn cards.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        <div className="flex items-center justify-between border p-2">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            Prev
          </Button>
          <span className="font-medium">{label}</span>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            Next
          </Button>
        </div>
        <Button onClick={generate} disabled={generating}>
          <IconFileText className="size-4" /> {generating ? "Generating..." : "Generate report"}
        </Button>
        {generated ? (
          <div className="grid gap-2 border p-3 text-sm">
            <p>Report ready for {label}</p>
            <div className="flex gap-2">
              <Button variant="outline"><IconDownload className="size-4" /> Download</Button>
              <Button variant="outline"><IconMail className="size-4" /> Email</Button>
            </div>
          </div>
        ) : null}
        <Button variant="ghost" onClick={() => setGenerated(false)}>
          <IconRefresh className="size-4" /> Reset
        </Button>
      </CardContent>
    </Card>
  )
}