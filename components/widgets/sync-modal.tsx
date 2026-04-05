"use client"

import * as React from "react"
import { IconCheck, IconCopy, IconLoader2, IconPhone, IconWifi, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PeerSyncReceiver, type SyncState } from "@/lib/peer-sync"

interface SyncModalProps {
  open: boolean
  userUid: string | null
  onClose: () => void
  onSyncComplete: () => void
}

export function SyncModal({ open, userUid, onClose, onSyncComplete }: SyncModalProps) {
  const [state, setState] = React.useState<SyncState>({
    status: "idle",
    pairingCode: null,
    receivedCount: 0,
    totalCount: 0,
    error: null,
  })
  const [copied, setCopied] = React.useState(false)
  const receiverRef = React.useRef<PeerSyncReceiver | null>(null)

  React.useEffect(() => {
    if (!open || !userUid) return
    if (state.status !== "idle") return

    const receiver = new PeerSyncReceiver(setState)
    receiverRef.current = receiver
    void receiver.start(userUid)
  }, [open, state.status, userUid])

  React.useEffect(() => {
    if (state.status !== "done") return
    const timer = setTimeout(() => onSyncComplete(), 1200)
    return () => clearTimeout(timer)
  }, [onSyncComplete, state.status])

  const reset = () => {
    receiverRef.current?.abort()
    receiverRef.current = null
    setState({ status: "idle", pairingCode: null, receivedCount: 0, totalCount: 0, error: null })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleCopy = () => {
    if (!state.pairingCode) return
    navigator.clipboard.writeText(state.pairingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconPhone className="size-5 text-primary" />
              <div>
                <CardTitle>Sync from mobile</CardTitle>
                <CardDescription>WebRTC transfer with Firebase signaling</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleClose} aria-label="Close sync modal">
              <IconX className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-4">
          {(state.status === "idle" || state.status === "waiting") && (
            <div className="grid gap-3 text-center">
              <p className="text-xs text-muted-foreground">Open mobile app and use the pairing code below.</p>
              {state.pairingCode ? (
                <div className="mx-auto flex items-center gap-2">
                  <div className="border bg-muted px-5 py-3 font-mono text-3xl font-semibold tracking-[0.2em]">{state.pairingCode}</div>
                  <Button variant="outline" size="icon-sm" onClick={handleCopy} aria-label="Copy pairing code">
                    {copied ? <IconCheck className="size-4 text-emerald-500" /> : <IconCopy className="size-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <IconLoader2 className="size-4 animate-spin" /> Creating session
                </div>
              )}
              <div className="mx-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <IconWifi className="size-3" /> Keep both devices on the same WiFi network.
              </div>
            </div>
          )}

          {state.status === "connecting" && (
            <div className="grid place-items-center gap-2 py-4 text-sm text-muted-foreground">
              <IconLoader2 className="size-7 animate-spin text-primary" />
              Establishing secure peer connection
            </div>
          )}

          {state.status === "receiving" && (
            <div className="grid gap-2 text-center">
              <p className="text-sm text-muted-foreground">Receiving transactions</p>
              <p className="font-mono text-4xl font-semibold text-primary">
                {state.receivedCount}
                {state.totalCount ? <span className="text-base text-muted-foreground"> / {state.totalCount}</span> : null}
              </p>
            </div>
          )}

          {state.status === "done" && <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">Sync complete. Local browser data updated.</p>}

          {state.status === "error" && <p className="text-center text-sm text-destructive">{state.error}</p>}

          {state.status === "error" ? (
            <Button onClick={reset}>Retry</Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              {state.status === "done" ? "Close" : "Cancel"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}