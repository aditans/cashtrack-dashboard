"use client"

import { useAuthUser } from "@/hooks/use-auth-user"
import { AnalyticsWidget } from "@/components/widgets/analytics-widget"

export default function AnalyticsPage() {
  const { user } = useAuthUser()
  return <AnalyticsWidget userUid={user?.uid ?? null} />
}