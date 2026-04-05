"use client"

import { useAuthUser } from "@/hooks/use-auth-user"
import { SplitsWidget } from "@/components/widgets/splits-widget"

export default function SplitsPage() {
  const { user } = useAuthUser()
  return <SplitsWidget userUid={user?.uid ?? null} />
}