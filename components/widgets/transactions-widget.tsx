"use client"

import * as React from "react"
import Link from "next/link"
import { IconCalendar, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransactions } from "@/hooks/use-transactions"
import { hasFirebaseConfig } from "@/lib/firebase"
import { SyncModal } from "@/components/widgets/sync-modal"
import { ScanBillsWidget } from "@/components/widgets/scan-bills-widget"

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

export function TransactionsWidget({ userUid, userEmail }: { userUid: string | null; userEmail: string | null }) {
  const {
    transactions,
    mobileCount,
    lastSynced,
    addWebTransaction,
    deleteTransaction,
    clearMobileTransactions,
    refreshLocal,
  } = useTransactions(userUid)
  const [search, setSearch] = React.useState("")
  const [syncOpen, setSyncOpen] = React.useState(false)
  const canSyncFromPhone = Boolean(userUid) && hasFirebaseConfig

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [search, transactions])

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Legacy implementation preserved: Firestore + local mobile sync + WebRTC pairing. {userEmail ?? "Sign in to sync cloud data."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" className="max-w-xs" />
            <Button onClick={() => addWebTransaction()}><IconPlus className="size-4" /> Add row</Button>
            <Button variant="outline" onClick={() => setSyncOpen(true)} disabled={!canSyncFromPhone}><IconCalendar className="size-4" /> Sync from phone</Button>
            <Button variant="outline" onClick={() => refreshLocal()}><IconRefresh className="size-4" /> Reload local</Button>
            {mobileCount > 0 ? (
              <Button variant="destructive" onClick={() => clearMobileTransactions()}>
                <IconTrash className="size-4" /> Clear mobile cache ({mobileCount})
              </Button>
            ) : null}
            {lastSynced ? <Badge variant="outline">Last sync: {new Date(lastSynced).toLocaleString()}</Badge> : null}
          </div>

          {!hasFirebaseConfig ? (
            <p className="text-xs text-muted-foreground">Sync disabled because Firebase env variables are missing.</p>
          ) : null}

          {hasFirebaseConfig && !userUid ? (
            <p className="text-xs text-muted-foreground">Sync disabled: sign in first. <Link href="/login" className="underline">Open login</Link></p>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{transaction.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {transaction.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.paymentMode}</TableCell>
                  <TableCell><Badge variant={transaction.source === "mobile" ? "outline" : "secondary"}>{transaction.source}</Badge></TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatAmount(transaction.amount)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" onClick={() => deleteTransaction(transaction)} aria-label={`Delete ${transaction.name}`}>
                      <IconTrash className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ScanBillsWidget userUid={userUid} />

      <SyncModal
        open={syncOpen}
        userUid={userUid}
        onClose={() => setSyncOpen(false)}
        onSyncComplete={() => {
          setSyncOpen(false)
          void refreshLocal()
        }}
      />
    </div>
  )
}