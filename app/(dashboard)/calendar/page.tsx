"use client"

import { useAuthUser } from "@/hooks/use-auth-user"
import { CalendarWidget } from "@/components/widgets/calendar-widget"

export default function CalendarPage() {
  const { user } = useAuthUser()

  return (
    <div className="grid gap-6">
      <header className="border bg-card p-4">
        <h1 className="font-heading text-3xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">Click any day to inspect transactions, edit trips, and review trip spend.</p>
      </header>
      <CalendarWidget userUid={user?.uid ?? null} />
    </div>
  )
}