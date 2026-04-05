"use client"

import * as React from "react"
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore"

import {
  clearLocalTransactions,
  getAllLocalTransactions,
  getLastSyncTime,
  updateLocalTransactionField,
} from "@/lib/local-db"

export interface DashboardTransaction {
  id: string
  name: string
  amount: number
  date: string
  tags: string[]
  description: string
  note: string
  paymentMode: string
  source: "web" | "mobile"
  type: "income" | "expense"
}

const defaultTags = ["Bills", "Food", "Travel", "Shopping", "Misc"]

function normalizeTransaction(input: Record<string, unknown>, id: string, source: "web" | "mobile"): DashboardTransaction {
  const amount = Number(input.amount ?? 0)
  const type = (String(input.type ?? input.txnType ?? "expense").toLowerCase() === "income" ? "income" : "expense") as
    | "income"
    | "expense"

  return {
    id,
    name: String(input.name ?? "Untitled"),
    amount,
    date: String(input.date ?? new Date().toISOString()),
    tags: Array.isArray(input.tags) ? (input.tags as string[]) : source === "mobile" ? ["Mobile"] : [defaultTags[0]],
    description: String(input.description ?? ""),
    note: String(input.note ?? ""),
    paymentMode: String(input.paymentMode ?? "UPI"),
    source,
    type,
  }
}

export function useTransactions(userUid: string | null) {
  const [webTransactions, setWebTransactions] = React.useState<DashboardTransaction[]>([])
  const [mobileTransactions, setMobileTransactions] = React.useState<DashboardTransaction[]>([])
  const [lastSynced, setLastSynced] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refreshLocal = React.useCallback(async () => {
    try {
      const local = await getAllLocalTransactions()
      setMobileTransactions(local.map((item) => normalizeTransaction(item as unknown as Record<string, unknown>, item.id, "mobile")))
      setLastSynced(await getLastSyncTime())
    } catch {
      setMobileTransactions([])
    }
  }, [])

  React.useEffect(() => {
    void refreshLocal()
  }, [refreshLocal])

  React.useEffect(() => {
    if (!userUid) {
      setWebTransactions([])
      setLoading(false)
      return
    }

    const db = getFirestore()
    const transactionsQuery = query(collection(db, "users", userUid, "transactions"), orderBy("createdAt", "desc"))

    const unsub = onSnapshot(transactionsQuery, (snapshot) => {
      const rows = snapshot.docs.map((item) => normalizeTransaction(item.data(), item.id, "web"))
      setWebTransactions(rows)
      setLoading(false)
    })

    return () => unsub()
  }, [userUid])

  const transactions = React.useMemo(() => {
    const merged = new Map<string, DashboardTransaction>()
    for (const row of webTransactions) merged.set(row.id, row)
    for (const row of mobileTransactions) merged.set(row.id, row)
    return Array.from(merged.values())
  }, [mobileTransactions, webTransactions])

  const addWebTransaction = React.useCallback(
    async (partial?: Partial<DashboardTransaction>) => {
      if (!userUid) return
      const db = getFirestore()
      const ref = doc(collection(db, "users", userUid, "transactions"))
      const now = new Date().toISOString()
      await setDoc(ref, {
        name: partial?.name ?? "Manual entry",
        amount: partial?.amount ?? 0,
        date: partial?.date ?? now,
        tags: partial?.tags ?? ["Misc"],
        description: partial?.description ?? "",
        note: partial?.note ?? "",
        paymentMode: partial?.paymentMode ?? "UPI",
        type: partial?.type ?? "expense",
        source: "web",
        createdAt: now,
        updatedAt: now,
      })
    },
    [userUid]
  )

  const updateTransaction = React.useCallback(
    async (transaction: DashboardTransaction, field: string, value: unknown) => {
      if (transaction.source === "mobile") {
        await updateLocalTransactionField(transaction.id, field, value)
        await refreshLocal()
        return
      }

      if (!userUid) return
      const db = getFirestore()
      await setDoc(
        doc(db, "users", userUid, "transactions", transaction.id),
        {
          [field]: value,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    },
    [refreshLocal, userUid]
  )

  const deleteTransaction = React.useCallback(
    async (transaction: DashboardTransaction) => {
      if (transaction.source === "mobile") {
        await updateLocalTransactionField(transaction.id, "_deleted", true)
        await refreshLocal()
        return
      }
      if (!userUid) return
      const db = getFirestore()
      await deleteDoc(doc(db, "users", userUid, "transactions", transaction.id))
    },
    [refreshLocal, userUid]
  )

  const clearMobileTransactions = React.useCallback(async () => {
    await clearLocalTransactions()
    await refreshLocal()
  }, [refreshLocal])

  return {
    transactions,
    loading,
    lastSynced,
    mobileCount: mobileTransactions.length,
    addWebTransaction,
    updateTransaction,
    deleteTransaction,
    clearMobileTransactions,
    refreshLocal,
  }
}