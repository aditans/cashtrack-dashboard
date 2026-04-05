import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore"

import { type LocalTransaction, saveLocalTransactions } from "@/lib/local-db"

export type SyncStatus = "idle" | "waiting" | "connecting" | "receiving" | "done" | "error"

export interface SyncState {
  status: SyncStatus
  pairingCode: string | null
  receivedCount: number
  totalCount: number
  error: string | null
}

export interface TurnDiagnostics {
  hasCredentials: boolean
  turnEnabled: boolean
  turnUrlCount: number
  stunUrlCount: number
  urls: string[]
}

type OnStateChange = (state: SyncState) => void

function generatePairingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let index = 0; index < 6; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  ...buildTurnServers(),
]

function buildTurnServers(): RTCIceServer[] {
  const username = process.env.NEXT_PUBLIC_TURN_USERNAME
  const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

  if (!username || !credential) {
    return []
  }

  const explicitUrls = process.env.NEXT_PUBLIC_TURN_URLS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const urls = explicitUrls?.length
    ? explicitUrls
    : [
        "turn:global.relay.metered.ca:80",
        "turn:global.relay.metered.ca:80?transport=tcp",
        "turn:global.relay.metered.ca:443",
        "turn:global.relay.metered.ca:443?transport=tcp",
      ]

  return urls.map((url) => ({ urls: url, username, credential }))
}

export function getTurnDiagnostics(): TurnDiagnostics {
  const username = process.env.NEXT_PUBLIC_TURN_USERNAME
  const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL
  const hasCredentials = Boolean(username && credential)

  const explicitUrls = process.env.NEXT_PUBLIC_TURN_URLS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const urls = explicitUrls?.length
    ? explicitUrls
    : [
        "turn:global.relay.metered.ca:80",
        "turn:global.relay.metered.ca:80?transport=tcp",
        "turn:global.relay.metered.ca:443",
        "turn:global.relay.metered.ca:443?transport=tcp",
      ]

  return {
    hasCredentials,
    turnEnabled: hasCredentials,
    turnUrlCount: hasCredentials ? urls.length : 0,
    stunUrlCount: 3,
    urls,
  }
}

export class PeerSyncReceiver {
  private pc: RTCPeerConnection | null = null
  private unsubs: Unsubscribe[] = []
  private sessionDocPath = ""
  private chunks: LocalTransaction[] = []
  private aborted = false
  private state: SyncState = {
    status: "idle",
    pairingCode: null,
    receivedCount: 0,
    totalCount: 0,
    error: null,
  }

  constructor(private readonly onStateChange: OnStateChange) {}

  private update(patch: Partial<SyncState>) {
    this.state = { ...this.state, ...patch }
    this.onStateChange(this.state)
  }

  async start(userUid: string) {
    this.aborted = false
    this.chunks = []

    try {
      const db = getFirestore()
      const pairingCode = generatePairingCode()
      this.sessionDocPath = `sync_sessions/${pairingCode}`

      await setDoc(doc(db, this.sessionDocPath), {
        uid: userUid,
        createdAt: new Date().toISOString(),
        role: "web_waiting",
      })

      this.update({ status: "waiting", pairingCode })

      this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 })

      this.pc.onconnectionstatechange = () => {
        const state = this.pc?.connectionState
        if (state === "failed" || state === "disconnected") {
          this.update({ status: "error", error: `Peer connection ${state}. Keep both devices on the same network.` })
          this.cleanup()
        }
      }

      this.pc.ondatachannel = (event) => {
        this.update({ status: "receiving" })
        this.setupDataChannel(event.channel)
      }

      this.pc.onicecandidate = async (event) => {
        if (!event.candidate) return
        await addDoc(collection(db, this.sessionDocPath, "ice_web"), event.candidate.toJSON())
      }

      const offerUnsub = onSnapshot(doc(db, this.sessionDocPath, "signaling", "offer"), async (snap) => {
        if (this.aborted || !snap.exists() || !this.pc) {
          return
        }
        const offerData = snap.data()
        if (!offerData?.sdp) {
          return
        }

        this.update({ status: "connecting" })
        await this.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: offerData.sdp }))
        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(answer)

        await setDoc(doc(db, this.sessionDocPath, "signaling", "answer"), {
          sdp: answer.sdp,
          type: answer.type,
        })

        const iceUnsub = onSnapshot(collection(db, this.sessionDocPath, "ice_phone"), (iceSnap) => {
          for (const change of iceSnap.docChanges()) {
            if (change.type !== "added" || !this.pc) continue
            this.pc.addIceCandidate(new RTCIceCandidate(change.doc.data())).catch(() => {})
          }
        })

        this.unsubs.push(iceUnsub)
      })

      this.unsubs.push(offerUnsub)
    } catch (error) {
      this.update({ status: "error", error: error instanceof Error ? error.message : "Failed to start sync." })
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === "header") {
          this.update({ totalCount: message.totalTransactions ?? 0 })
          return
        }

        if (message.type === "chunk") {
          const chunk: LocalTransaction[] = (message.data ?? []).map((item: Record<string, unknown>) => ({
            id: String(item.id ?? `mobile_${Date.now()}_${Math.random().toString(36).slice(2)}`),
            name: String(item.name ?? ""),
            amount: Number(item.amount ?? 0),
            date: String(item.date ?? ""),
            tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
            description: String(item.description ?? item.note ?? ""),
            note: String(item.note ?? ""),
            paymentMode: String(item.paymentMode ?? item.mode ?? "UPI"),
            source: "mobile",
            syncedAt: new Date().toISOString(),
            txnType: String(item.type ?? "expense"),
          }))

          this.chunks.push(...chunk)
          this.update({ receivedCount: this.chunks.length })
          return
        }

        if (message.type === "done") {
          saveLocalTransactions(this.chunks)
            .then(() => {
              this.update({ status: "done", receivedCount: this.chunks.length })
              this.cleanup()
            })
            .catch((error) => {
              this.update({ status: "error", error: error instanceof Error ? error.message : "Save failed." })
            })
        }
      } catch {
        // Ignore non-json payloads.
      }
    }
  }

  async cleanup() {
    this.aborted = true

    if (this.pc) {
      this.pc.close()
      this.pc = null
    }

    for (const unsub of this.unsubs) {
      unsub()
    }
    this.unsubs = []

    if (!this.sessionDocPath) {
      return
    }

    const db = getFirestore()
    for (const subCollection of ["ice_web", "ice_phone"]) {
      const snapshot = await getDocs(collection(db, this.sessionDocPath, subCollection))
      for (const item of snapshot.docs) {
        await deleteDoc(item.ref)
      }
    }

    for (const item of ["offer", "answer"]) {
      await deleteDoc(doc(db, this.sessionDocPath, "signaling", item)).catch(() => {})
    }

    await deleteDoc(doc(db, this.sessionDocPath)).catch(() => {})
  }

  abort() {
    this.cleanup()
    this.update({ status: "idle", pairingCode: null, receivedCount: 0, totalCount: 0, error: null })
  }
}