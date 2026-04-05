"use client"

import { useAuthUser } from "@/hooks/use-auth-user"
import { TransactionsWidget } from "@/components/widgets/transactions-widget"

export default function TransactionsPage() {
  const { user } = useAuthUser()
  return <TransactionsWidget userUid={user?.uid ?? null} userEmail={user?.email ?? null} />
}