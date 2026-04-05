"use client"

import * as React from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SyncModal } from "@/components/widgets/sync-modal"
import { hasFirebaseConfig } from "@/lib/firebase"
import { getTurnDiagnostics } from "@/lib/peer-sync"

interface SyncSettingsPanelProps {
  userUid: string | null
  authLoading?: boolean
  mobileCount: number
  lastSynced: string | null
  onRefreshLocal: () => void | Promise<void>
}

type BrowserConnection = {
  effectiveType?: string
  downlink?: number
  rtt?: number
}

function formatLastSynced(lastSynced: string | null) {
  if (!lastSynced) return "Never"
  const date = new Date(lastSynced)
  if (Number.isNaN(date.getTime())) return "Never"
  return date.toLocaleString()
}

export function SyncSettingsPanel({ userUid, authLoading = false, mobileCount, lastSynced, onRefreshLocal }: SyncSettingsPanelProps) {
  const [syncOpen, setSyncOpen] = React.useState(false)
  const [online, setOnline] = React.useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)

  const turn = React.useMemo(() => getTurnDiagnostics(), [])

  const connection = (typeof navigator !== "undefined"
    ? (navigator as Navigator & { connection?: BrowserConnection }).connection
    : undefined) as BrowserConnection | undefined

  React.useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  const webRtcSupported = typeof window !== "undefined" && "RTCPeerConnection" in window
  const secureContext = typeof window !== "undefined" ? window.isSecureContext : false
  const canStartSync = Boolean(userUid) && hasFirebaseConfig && !authLoading

  const healthScore =
    (webRtcSupported ? 35 : 0) +
    (secureContext ? 25 : 0) +
    (online ? 20 : 0) +
    (turn.turnEnabled ? 20 : 0)

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Sync & Connection Settings</CardTitle>
          <CardDescription>TURN status and WebRTC diagnostics for phone-to-web transaction sync.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>Connection Health</span>
              <span className="font-mono tabular-nums">{healthScore}%</span>
            </div>
            <Progress value={healthScore} />
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between border p-2">
              <span>WebRTC support</span>
              <Badge variant={webRtcSupported ? "secondary" : "destructive"}>{webRtcSupported ? "Available" : "Unavailable"}</Badge>
            </div>
            <div className="flex items-center justify-between border p-2">
              <span>Secure context</span>
              <Badge variant={secureContext ? "secondary" : "destructive"}>{secureContext ? "Enabled" : "Disabled"}</Badge>
            </div>
            <div className="flex items-center justify-between border p-2">
              <span>Network status</span>
              <Badge variant={online ? "secondary" : "destructive"}>{online ? "Online" : "Offline"}</Badge>
            </div>
            <div className="flex items-center justify-between border p-2">
              <span>TURN relay</span>
              <Badge variant={turn.turnEnabled ? "secondary" : "outline"}>{turn.turnEnabled ? `Configured (${turn.turnUrlCount})` : "Not configured"}</Badge>
            </div>
          </div>

          <div className="grid gap-1 border p-2 text-xs text-muted-foreground">
            <p>Detected transport: {connection?.effectiveType ?? "unknown"}</p>
            <p>Downlink: {connection?.downlink ? `${connection.downlink} Mbps` : "unknown"}</p>
            <p>RTT: {connection?.rtt ? `${connection.rtt} ms` : "unknown"}</p>
            <p>STUN servers: {turn.stunUrlCount}</p>
            <p>Last synced: {formatLastSynced(lastSynced)}</p>
            <p>Mobile records cached: {mobileCount}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setSyncOpen(true)} disabled={!canStartSync}>
              Sync from phone
            </Button>
            <Button variant="outline" onClick={() => void onRefreshLocal()}>
              Refresh local cache
            </Button>
          </div>

          {!hasFirebaseConfig ? (
            <p className="text-xs text-muted-foreground">
              Sync disabled: Firebase env variables are missing. Set NEXT_PUBLIC_FIREBASE_* to enable signaling.
            </p>
          ) : null}

          {!authLoading && hasFirebaseConfig && !userUid ? (
            <p className="text-xs text-muted-foreground">
              Sync disabled: sign in first to create a secure sync session. <Link href="/login" className="underline">Open login</Link>
            </p>
          ) : null}

          {authLoading ? <p className="text-xs text-muted-foreground">Checking auth session...</p> : null}
        </CardContent>
      </Card>

      <SyncModal
        open={syncOpen}
        userUid={userUid}
        onClose={() => setSyncOpen(false)}
        onSyncComplete={() => {
          setSyncOpen(false)
          void onRefreshLocal()
        }}
      />
    </>
  )
}
