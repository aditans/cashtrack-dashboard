"use client"

import * as React from "react"
import { IconArrowLeft, IconArrowRight, IconSearch } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTransactions } from "@/hooks/use-transactions"

function dayKey(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type CalendarEventType = "trip" | "reminder" | "payment" | "event"

type CalendarEvent = {
  id: string
  date: string
  time: string
  title: string
  kind: CalendarEventType
  note: string
  source: "manual" | "transaction"
}

type EditableEvent = Omit<CalendarEvent, "source">

const eventStyles: Record<CalendarEventType, { chip: string; dot: string; label: string }> = {
  trip: {
    chip: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-500",
    label: "Trip",
  },
  reminder: {
    chip: "bg-sky-500/15 text-sky-700 ring-sky-500/20 dark:text-sky-300",
    dot: "bg-sky-500",
    label: "Reminder",
  },
  payment: {
    chip: "bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500",
    label: "Payment",
  },
  event: {
    chip: "bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-500/20 dark:text-fuchsia-300",
    dot: "bg-fuchsia-500",
    label: "Event",
  },
}

const initialManualEvents: CalendarEvent[] = [
  { id: "trip-goa", date: "2026-04-04", time: "08:00", title: "Goa weekend trip", kind: "trip", note: "Flight and hotel are booked.", source: "manual" },
  { id: "reminder-insurance", date: "2026-04-07", time: "09:30", title: "Insurance reminder", kind: "reminder", note: "Renewal due this week.", source: "manual" },
  { id: "payment-rent", date: "2026-04-03", time: "10:00", title: "Rent payment reminder", kind: "payment", note: "Transfer before 6 PM.", source: "manual" },
  { id: "event-standup", date: "2026-04-11", time: "11:00", title: "Team standup", kind: "event", note: "Monthly planning review.", source: "manual" },
  { id: "trip-client", date: "2026-04-15", time: "13:15", title: "Client visit trip", kind: "trip", note: "Outstation meeting and dinner.", source: "manual" },
  { id: "payment-electricity", date: "2026-04-18", time: "18:00", title: "Electricity bill reminder", kind: "payment", note: "Due before penalty date.", source: "manual" },
  { id: "reminder-birthday", date: "2026-04-20", time: "19:30", title: "Birthday reminder", kind: "reminder", note: "Order gift and plan dinner.", source: "manual" },
  { id: "event-review", date: "2026-04-23", time: "15:00", title: "Expense review", kind: "event", note: "Check budgets and recurring spends.", source: "manual" },
  { id: "trip-airport", date: "2026-04-27", time: "06:30", title: "Airport run", kind: "trip", note: "Morning departure to Bengaluru.", source: "manual" },
]

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}

function keyToDate(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
}

function buildMonthGrid(month: Date) {
  const firstDay = startOfMonth(month)
  const gridStart = startOfWeek(firstDay)
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

function currency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

export function CalendarWidget({ userUid }: { userUid: string | null }) {
  const { transactions, updateTransaction, deleteTransaction } = useTransactions(userUid)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [viewMonth, setViewMonth] = React.useState(() => startOfMonth(new Date()))
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [kindFilter, setKindFilter] = React.useState<CalendarEventType | "all">("all")
  const [manualEvents, setManualEvents] = React.useState<CalendarEvent[]>(initialManualEvents)
  const [editingEvent, setEditingEvent] = React.useState<EditableEvent | null>(null)

  React.useEffect(() => {
    setViewMonth(startOfMonth(selectedDate))
  }, [selectedDate])

  const derivedEvents = React.useMemo<CalendarEvent[]>(() => {
    const paymentEvents = transactions
      .filter((transaction) => transaction.type === "expense")
      .slice(0, 8)
      .map((transaction, index) => ({
        id: `txn-${transaction.id}`,
        date: transaction.date.slice(0, 10),
        time: `${String(9 + (index % 5) * 2).padStart(2, "0")}:00`,
        title: `${transaction.name} payment`,
        kind: "payment" as const,
        note: transaction.tags.join(" / ") || transaction.paymentMode,
        source: "transaction" as const,
      }))

    return [...manualEvents, ...paymentEvents].sort((left, right) => {
      const dateDiff = left.date.localeCompare(right.date)
      if (dateDiff !== 0) return dateDiff
      return left.time.localeCompare(right.time)
    })
  }, [manualEvents, transactions])

  const visibleEvents = React.useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return derivedEvents.filter((event) => {
      const matchesSearch = query ? `${event.title} ${event.note} ${event.kind}`.toLowerCase().includes(query) : true
      const matchesKind = kindFilter === "all" ? true : event.kind === kindFilter
      return matchesSearch && matchesKind
    })
  }, [derivedEvents, kindFilter, searchValue])

  const monthGrid = React.useMemo(() => buildMonthGrid(viewMonth), [viewMonth])
  const monthLabel = formatMonthLabel(viewMonth)

  const eventsByDay = React.useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>()
    for (const event of visibleEvents) {
      const rows = grouped.get(event.date) ?? []
      rows.push(event)
      grouped.set(event.date, rows)
    }
    return grouped
  }, [visibleEvents])

  const selectedDayEvents = React.useMemo(() => {
    const key = dayKey(selectedDate)
    return visibleEvents.filter((event) => event.date === key)
  }, [selectedDate, visibleEvents])

  const selectedDayTransactions = React.useMemo(() => {
    const key = dayKey(selectedDate)
    return transactions
      .filter((transaction) => dayKey(transaction.date) === key)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedDate, transactions])

  const dayTotals = React.useMemo(
    () =>
      selectedDayTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === "income") acc.income += Math.abs(transaction.amount)
          else acc.expense += Math.abs(transaction.amount)
          return acc
        },
        { income: 0, expense: 0 }
      ),
    [selectedDayTransactions]
  )

  const tripSpending = React.useMemo(
    () =>
      selectedDayTransactions
        .filter((transaction) => transaction.type === "expense" && transaction.tags.some((tag) => /travel|trip/i.test(tag)))
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [selectedDayTransactions]
  )

  const tripEvents = selectedDayEvents.filter((event) => event.kind === "trip")

  const openDayModal = (day: Date) => {
    setSelectedDate(day)
    setDialogOpen(true)
  }

  const startEditingEvent = (event: EditableEvent) => {
    setEditingEvent(event)
  }

  const saveEditingEvent = () => {
    if (!editingEvent) return
    setManualEvents((current) =>
      current.map((event) =>
        event.id === editingEvent.id
          ? {
              ...event,
              date: editingEvent.date,
              time: editingEvent.time,
              title: editingEvent.title,
              kind: editingEvent.kind,
              note: editingEvent.note,
            }
          : event
      )
    )
    setEditingEvent(null)
  }

  const deleteEditingEvent = (eventId: string) => {
    setManualEvents((current) => current.filter((event) => event.id !== eventId))
    if (editingEvent?.id === eventId) {
      setEditingEvent(null)
    }
  }

  const activeEventsCount = visibleEvents.length
  const visibleTrips = visibleEvents.filter((event) => event.kind === "trip").length
  const visibleReminders = visibleEvents.filter((event) => event.kind === "reminder").length
  const visiblePayments = visibleEvents.filter((event) => event.kind === "payment").length

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Click any day to inspect transactions, trips, and day-level spend.</CardDescription>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Previous month">
                  <IconArrowLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date()
                    setSelectedDate(today)
                    setViewMonth(startOfMonth(today))
                  }}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Next month">
                  <IconArrowRight className="size-4" />
                </Button>
              </div>

              <div className="grid gap-2 md:w-[340px] md:grid-cols-[minmax(0,140px)_minmax(0,1fr)]">
                <div className="grid gap-1">
                  <Label htmlFor="calendar-filter" className="text-xs text-muted-foreground">
                    Show
                  </Label>
                  <Select value={kindFilter} onValueChange={(value) => setKindFilter(value as CalendarEventType | "all")}>
                    <SelectTrigger id="calendar-filter" className="w-full">
                      <SelectValue placeholder="All items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All items</SelectItem>
                      <SelectItem value="trip">Trips</SelectItem>
                      <SelectItem value="reminder">Reminders</SelectItem>
                      <SelectItem value="payment">Payment reminders</SelectItem>
                      <SelectItem value="event">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative w-full">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search events..."
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Trips", count: visibleTrips, tone: eventStyles.trip.dot },
              { label: "Reminders", count: visibleReminders, tone: eventStyles.reminder.dot },
              { label: "Payment reminders", count: visiblePayments, tone: eventStyles.payment.dot },
              { label: "Total items", count: activeEventsCount, tone: eventStyles.event.dot },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className={`size-2 rounded-full ${item.tone}`} />
                  {item.label}
                </span>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
          </div>

          <div>
            <div className="grid grid-cols-7 border-l border-t text-center text-sm font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="border-b border-r px-2 py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-l border-b">
              {monthGrid.map((day) => {
                const key = dayKey(day)
                const isCurrentMonth = day.getMonth() === viewMonth.getMonth()
                const isToday = sameDay(day, new Date())
                const isSelected = sameDay(day, selectedDate)
                const dayEvents = eventsByDay.get(key) ?? []
                const visibleDayEvents = dayEvents.slice(0, 3)
                const extraCount = Math.max(0, dayEvents.length - visibleDayEvents.length)

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openDayModal(day)}
                    className={`min-h-[140px] border-r border-t p-2 text-left transition-colors hover:bg-muted/35 ${
                      isCurrentMonth ? "bg-background" : "bg-muted/15 text-muted-foreground"
                    } ${isSelected ? "outline outline-2 outline-offset-[-2px] outline-border" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-medium ${
                          isToday ? "bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 0 ? <Badge variant="secondary">{dayEvents.length}</Badge> : null}
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      {visibleDayEvents.map((event) => (
                        <div key={event.id} className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ${eventStyles[event.kind].chip}`}>
                          <span className={`mr-2 inline-block size-1.5 rounded-full align-middle ${eventStyles[event.kind].dot}`} />
                          <span className="align-middle">{event.title}</span>
                        </div>
                      ))}
                      {extraCount > 0 ? <p className="text-xs text-muted-foreground">+{extraCount} more</p> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[min(96vw,1200px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formatLongDate(selectedDate)}</DialogTitle>
            <DialogDescription>
              Transactions, trip entries, and trip spend for the selected day.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="flex flex-col gap-6">
              <section className="grid gap-3 rounded-lg border bg-muted/15 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Trip analysis</p>
                    <p className="text-sm text-muted-foreground">How much was spent on travel-tagged transactions for this day.</p>
                  </div>
                  <Badge variant="outline">{tripEvents.length} trip{tripEvents.length === 1 ? "" : "s"}</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-lg font-semibold">{currency(dayTotals.income)}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Expense</p>
                    <p className="text-lg font-semibold">{currency(dayTotals.expense)}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Trip spend</p>
                    <p className="text-lg font-semibold">{currency(tripSpending)}</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-3 rounded-lg border bg-background p-4">
                <div>
                  <p className="text-sm font-medium">Trips / reminders / events</p>
                  <p className="text-sm text-muted-foreground">Edit or delete the manually maintained trip cards here.</p>
                </div>

                <div className="grid gap-3">
                  {tripEvents.length === 0 ? <p className="text-sm text-muted-foreground">No trip entries on this day.</p> : null}
                  {selectedDayEvents.map((event) => {
                    if (event.source === "manual" && editingEvent?.id === event.id) {
                      return (
                        <div key={event.id} className="grid gap-3 rounded-lg border bg-muted/20 p-4">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="grid gap-1">
                              <Label htmlFor={`edit-title-${event.id}`}>Title</Label>
                              <Input
                                id={`edit-title-${event.id}`}
                                value={editingEvent.title}
                                onChange={(event) => setEditingEvent((current) => (current ? { ...current, title: event.target.value } : current))}
                              />
                            </div>
                            <div className="grid gap-1">
                              <Label htmlFor={`edit-kind-${event.id}`}>Type</Label>
                              <Select
                                value={editingEvent.kind}
                                onValueChange={(value) => setEditingEvent((current) => (current ? { ...current, kind: value as CalendarEventType } : current))}
                              >
                                <SelectTrigger id={`edit-kind-${event.id}`} className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="trip">Trip</SelectItem>
                                  <SelectItem value="reminder">Reminder</SelectItem>
                                  <SelectItem value="payment">Payment</SelectItem>
                                  <SelectItem value="event">Event</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-1">
                              <Label htmlFor={`edit-date-${event.id}`}>Date</Label>
                              <Input id={`edit-date-${event.id}`} type="date" value={editingEvent.date} onChange={(event) => setEditingEvent((current) => (current ? { ...current, date: event.target.value } : current))} />
                            </div>
                            <div className="grid gap-1">
                              <Label htmlFor={`edit-time-${event.id}`}>Time</Label>
                              <Input id={`edit-time-${event.id}`} type="time" value={editingEvent.time} onChange={(event) => setEditingEvent((current) => (current ? { ...current, time: event.target.value } : current))} />
                            </div>
                          </div>

                          <div className="grid gap-1">
                            <Label htmlFor={`edit-note-${event.id}`}>Note</Label>
                            <Input id={`edit-note-${event.id}`} value={editingEvent.note} onChange={(event) => setEditingEvent((current) => (current ? { ...current, note: event.target.value } : current))} />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button onClick={saveEditingEvent}>Save</Button>
                            <Button variant="outline" onClick={() => setEditingEvent(null)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => deleteEditingEvent(event.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={event.id} className={`rounded-lg border p-4 ${eventStyles[event.kind].chip}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`size-2 rounded-full ${eventStyles[event.kind].dot}`} />
                              <p className="font-medium">{event.title}</p>
                            </div>
                            <p className="mt-1 text-sm opacity-80">{event.note}</p>
                            <p className="mt-2 text-xs opacity-70">
                              {event.time} · {eventStyles[event.kind].label} · {event.source === "manual" ? "Manual" : "Transaction"}
                            </p>
                          </div>

                          {event.source === "manual" ? (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => startEditingEvent(event)}>
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteEditingEvent(event.id)}>
                                Delete
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="grid gap-3 rounded-lg border bg-background p-4">
                <div>
                  <p className="text-sm font-medium">Transactions</p>
                  <p className="text-sm text-muted-foreground">See every transaction on this day.</p>
                </div>

                <div className="grid gap-2">
                  {selectedDayTransactions.length === 0 ? <p className="text-sm text-muted-foreground">No transactions recorded for this date.</p> : null}
                  {selectedDayTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-xs text-muted-foreground">{transaction.tags.join(", ") || "No tags"} · {transaction.paymentMode} · {transaction.source}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm tabular-nums">{currency(Math.abs(transaction.amount))}</span>
                        <Button variant="outline" size="sm" onClick={() => deleteTransaction(transaction)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="grid content-start gap-4 rounded-lg border bg-muted/15 p-4">
              <div>
                <p className="text-sm font-medium">Day snapshot</p>
                <p className="text-sm text-muted-foreground">Click days on the grid to inspect details.</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">{selectedDayTransactions.length}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Trip entries</p>
                  <p className="text-lg font-semibold">{tripEvents.length}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p className="text-lg font-semibold">{currency(dayTotals.income - dayTotals.expense)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2 text-sm">
                <p className="font-medium">What you can do here</p>
                <p className="text-muted-foreground">• Inspect spending for the selected day</p>
                <p className="text-muted-foreground">• Edit or delete manual trip cards</p>
                <p className="text-muted-foreground">• Delete transactions after review</p>
                <p className="text-muted-foreground">• Use the trip spend total for trip analysis</p>
              </div>
            </aside>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}