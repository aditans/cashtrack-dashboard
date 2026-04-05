"use client"

import * as React from "react"
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore"
import {
  IconCalendar,
  IconCopy,
  IconExternalLink,
  IconSend,
  IconTrash,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SplitItem {
  id: string
  title?: string
  amount?: number
  memberIds?: string[]
  createdAt?: unknown
  updatedAt?: unknown
  progress?: number
}

interface GroupItem {
  id: string
  name?: string
  memberIds?: string[]
  inviteCode?: string
}

interface FriendItem {
  id: string
  uid?: string
  displayName?: string
  email?: string
  photoUrl?: string
  photoURL?: string
}

type SplitStatus = "On Track" | "At Risk" | "On Hold"

type SplitRow = {
  id: string
  title: string
  amount: number
  memberIds: string[]
  progress: number
  status: SplitStatus
  period: string
}

function amountToNumber(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseDateValue(input: unknown): Date | null {
  if (!input) return null

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }

  if (typeof input === "string" || typeof input === "number") {
    const parsed = new Date(input)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof input === "object") {
    if ("toDate" in input && typeof (input as { toDate?: unknown }).toDate === "function") {
      const parsed = (input as { toDate: () => Date }).toDate()
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    if ("seconds" in input && typeof (input as { seconds?: unknown }).seconds === "number") {
      const milliseconds = (input as { seconds: number }).seconds * 1000
      const parsed = new Date(milliseconds)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
  }

  return null
}

function toMonthDateString(input: unknown) {
  const date = parseDateValue(input)
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function stableProgress(id: string, explicit?: number) {
  if (typeof explicit === "number" && explicit >= 0 && explicit <= 100) {
    return Math.round(explicit)
  }

  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(index)
    hash |= 0
  }
  return Math.max(20, Math.min(95, Math.abs(hash % 100)))
}

function statusFromProgress(progress: number): SplitStatus {
  if (progress >= 70) return "On Track"
  if (progress >= 45) return "At Risk"
  return "On Hold"
}

function statusTone(status: SplitStatus) {
  if (status === "On Track") return { ring: "#22c55e", text: "text-emerald-400" }
  if (status === "At Risk") return { ring: "#ef4444", text: "text-rose-400" }
  return { ring: "#a1a1aa", text: "text-zinc-300" }
}

function buildPeriod(createdAt?: unknown) {
  const startDate = parseDateValue(createdAt) ?? new Date()
  const start = toMonthDateString(startDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 45)
  const end = toMonthDateString(endDate)
  return `${start} - ${end}`
}

function currency(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`
}

function buildOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function initials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "FR"
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function SplitsWidget({ userUid }: { userUid: string | null }) {
  const [splits, setSplits] = React.useState<SplitItem[]>([])
  const [groups, setGroups] = React.useState<GroupItem[]>([])
  const [friends, setFriends] = React.useState<FriendItem[]>([])
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedSplitId, setSelectedSplitId] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<"view" | "create">("view")
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftAmount, setDraftAmount] = React.useState(0)
  const [draftStatus, setDraftStatus] = React.useState<SplitStatus>("On Track")
  const [memberInput, setMemberInput] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  const [otpInput, setOtpInput] = React.useState("")
  const [otpVerified, setOtpVerified] = React.useState(false)
  const [splitFilterLabel, setSplitFilterLabel] = React.useState<string | null>(null)
  const [splitFilterMemberIds, setSplitFilterMemberIds] = React.useState<string[] | null>(null)

  React.useEffect(() => {
    if (!userUid) {
      setSplits([])
      setGroups([])
      setFriends([])
      return
    }

    const db = getFirestore()

    const unsubSplits = onSnapshot(
      query(collection(db, "users", userUid, "splits"), where("memberIds", "array-contains", userUid)),
      (snapshot) => {
        setSplits(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<SplitItem, "id">) })))
      }
    )

    const unsubGroups = onSnapshot(
      query(collection(db, "groups"), where("memberIds", "array-contains", userUid)),
      (snapshot) => {
        setGroups(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<GroupItem, "id">) })))
      }
    )

    const unsubFriends = onSnapshot(collection(db, "users", userUid, "friends"), (snapshot) => {
      setFriends(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendItem, "id">) })))
    })

    return () => {
      unsubSplits()
      unsubGroups()
      unsubFriends()
    }
  }, [userUid])

  const splitRows = React.useMemo<SplitRow[]>(() => {
    return splits.map((split) => {
      const progress = stableProgress(split.id, split.progress)
      const status = statusFromProgress(progress)
      return {
        id: split.id,
        title: split.title?.trim() || "Split expense",
        amount: amountToNumber(split.amount),
        memberIds: split.memberIds ?? [],
        progress,
        status,
        period: buildPeriod(split.createdAt),
      }
    })
  }, [splits])

  const visibleSplitRows = React.useMemo(() => {
    if (!splitFilterMemberIds || splitFilterMemberIds.length === 0) return splitRows
    return splitRows.filter((split) => split.memberIds.some((memberId) => splitFilterMemberIds.includes(memberId)))
  }, [splitFilterMemberIds, splitRows])

  const selectedRow = React.useMemo(
    () => splitRows.find((item) => item.id === selectedSplitId) ?? null,
    [selectedSplitId, splitRows]
  )

  React.useEffect(() => {
    if (!modalOpen) {
      setOtpCode("")
      setOtpInput("")
      setOtpVerified(false)
      return
    }

    if (mode === "view" && selectedRow) {
      setDraftTitle(selectedRow.title)
      setDraftAmount(selectedRow.amount)
      setDraftStatus(selectedRow.status)
    }

    if (mode === "create") {
      setDraftTitle("New split")
      setDraftAmount(0)
      setDraftStatus("On Track")
      setMemberInput("")
    }
  }, [modalOpen, mode, selectedRow])

  const openSplitModal = (splitId: string) => {
    setMode("view")
    setSelectedSplitId(splitId)
    setModalOpen(true)
  }

  const openCreateModal = () => {
    setMode("create")
    setSelectedSplitId(null)
    setModalOpen(true)
  }

  const sendOtp = () => {
    const code = buildOtp()
    setOtpCode(code)
    setOtpInput("")
    setOtpVerified(false)
  }

  const verifyOtp = () => {
    setOtpVerified(otpCode.length > 0 && otpInput === otpCode)
  }

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // no-op
    }
  }

  const openRelatedForFriend = (friend: FriendItem) => {
    const friendUid = friend.uid || friend.id
    if (!friendUid) return
    setSplitFilterMemberIds([friendUid])
    setSplitFilterLabel(`Filtered by friend: ${friend.displayName || friendUid}`)
  }

  const openRelatedForGroup = (group: GroupItem) => {
    const memberIds = (group.memberIds ?? []).filter(Boolean)
    if (!memberIds.length) return
    setSplitFilterMemberIds(memberIds)
    setSplitFilterLabel(`Filtered by group: ${group.name || group.id}`)
  }

  const clearSplitFilter = () => {
    setSplitFilterMemberIds(null)
    setSplitFilterLabel(null)
  }

  const inviteFriend = (friend: FriendItem) => {
    const email = friend.email
    if (email) {
      window.open(
        `mailto:${email}?subject=CashTrack%20Split%20Invite&body=Join%20my%20CashTrack%20split%20group!`,
        "_blank"
      )
      return
    }

    void copyToClipboard(`Join my CashTrack split, uid: ${friend.uid || friend.id}`)
  }

  const inviteGroup = async (group: GroupItem) => {
    const inviteCode = group.inviteCode || group.id.slice(0, 8)
    await copyToClipboard(`Join my CashTrack group \"${group.name || "Group"}\" with code: ${inviteCode}`)
  }

  const deleteFriend = async (friendId: string) => {
    if (!userUid) return
    if (!window.confirm("Delete this friend?")) return
    const db = getFirestore()
    await deleteDoc(doc(db, "users", userUid, "friends", friendId))
  }

  const deleteGroup = async (groupId: string) => {
    if (!userUid) return
    if (!window.confirm("Delete this group?")) return
    const db = getFirestore()
    await deleteDoc(doc(db, "groups", groupId))
  }

  const handleSave = async () => {
    if (!userUid || !selectedRow || !otpVerified) return
    const db = getFirestore()
    await setDoc(
      doc(db, "users", userUid, "splits", selectedRow.id),
      {
        title: draftTitle,
        amount: amountToNumber(draftAmount),
        status: draftStatus,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!userUid || !selectedRow || !otpVerified) return
    const db = getFirestore()
    await deleteDoc(doc(db, "users", userUid, "splits", selectedRow.id))
    setModalOpen(false)
  }

  const handleAddMember = async () => {
    if (!userUid || !selectedRow || !memberInput.trim() || !otpVerified) return
    const db = getFirestore()
    await setDoc(
      doc(db, "users", userUid, "splits", selectedRow.id),
      {
        memberIds: arrayUnion(memberInput.trim()),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
    setMemberInput("")
  }

  const handleCreate = async () => {
    if (!userUid || !otpVerified) return
    const db = getFirestore()
    const extraMembers = memberInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

    await addDoc(collection(db, "users", userUid, "splits"), {
      title: draftTitle,
      amount: amountToNumber(draftAmount),
      memberIds: [userUid, ...extraMembers],
      status: draftStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setModalOpen(false)
  }

  return (
    <div className="grid gap-6">
      <Card className="dark:border-border/30">
        <CardHeader className="border-b dark:border-border/30">
          <CardTitle className="dark:text-foreground">Splits</CardTitle>
          <CardDescription className="dark:text-muted-foreground/70">Split listeners plus top-level groups and profile-linked friends with actionable cards.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4 md:grid-cols-3">
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Active splits</p>
            <p className="font-heading text-2xl font-semibold dark:text-foreground">{splits.length}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Groups</p>
            <p className="font-heading text-2xl font-semibold dark:text-foreground">{groups.length}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Friends</p>
            <p className="font-heading text-2xl font-semibold dark:text-foreground">{friends.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 dark:border-border/30 dark:bg-muted/40">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 dark:border-border/30">
          <div>
            <CardTitle className="dark:text-foreground">Active Splits</CardTitle>
            <CardDescription className="dark:text-muted-foreground/70">Click any split to open OTP-protected edit/delete/add actions.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {splitFilterLabel ? (
              <Button variant="ghost" className="dark:hover:bg-muted" onClick={clearSplitFilter}>
                Clear filter
              </Button>
            ) : null}
            <Button variant="outline" className="dark:border-border/50 dark:hover:bg-muted" onClick={openCreateModal}>
              Add split
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          {splitFilterLabel ? <Badge variant="outline" className="dark:border-border/50">{splitFilterLabel}</Badge> : null}
          {visibleSplitRows.length === 0 ? <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">No split records yet.</p> : null}

          {visibleSplitRows.map((split) => {
            const tone = statusTone(split.status)
            return (
              <button
                key={split.id}
                type="button"
                onClick={() => openSplitModal(split.id)}
                className="flex items-center gap-4 rounded-xl border border-border/30 bg-card p-4 text-left transition hover:bg-muted dark:border-border/30 dark:bg-muted/40 dark:hover:bg-muted/60"
              >
                <div
                  className="relative grid size-[74px] place-items-center rounded-full"
                  style={{ background: `conic-gradient(${tone.ring} ${split.progress * 3.6}deg, rgba(255,255,255,0.13) 0deg)` }}
                >
                  <div className="grid size-[58px] place-items-center rounded-full bg-card text-lg font-semibold dark:bg-background">
                    {split.progress}%
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className={cn("text-lg font-semibold", tone.text)}>{split.status}</p>
                  <p className="truncate text-2xl font-semibold dark:text-foreground">{split.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/70">Amount: {currency(split.amount)}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground/70">
                    <IconCalendar className="size-4" />
                    {split.period}
                  </p>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="dark:border-border/30">
          <CardHeader className="border-b dark:border-border/30">
            <CardTitle className="dark:text-foreground">Groups</CardTitle>
            <CardDescription className="dark:text-muted-foreground/70">Top-level groups where your UID appears in memberIds.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4">
            {groups.length === 0 ? <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">No groups found.</p> : null}
            {groups.map((group) => (
              <div key={group.id} className="grid gap-2 border p-3 text-sm dark:border-border/30 dark:bg-muted/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(group.name, group.id)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-foreground">{group.name || "Unnamed group"}</p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Members: {(group.memberIds ?? []).length}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="dark:border-border/50">{group.id.slice(0, 8)}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => void copyToClipboard(group.id)} className="dark:border-border/50 dark:hover:bg-muted">
                    <IconCopy className="size-3.5" /> Copy UID
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openRelatedForGroup(group)} className="dark:border-border/50 dark:hover:bg-muted">
                    <IconExternalLink className="size-3.5" /> Open related splits
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void inviteGroup(group)} className="dark:border-border/50 dark:hover:bg-muted">
                    <IconSend className="size-3.5" /> Invite
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => void deleteGroup(group.id)}>
                    <IconTrash className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dark:border-border/30">
          <CardHeader className="border-b dark:border-border/30">
            <CardTitle className="dark:text-foreground">Friends</CardTitle>
            <CardDescription className="dark:text-muted-foreground/70">Friends list synced for the signed-in user.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4">
            {friends.length === 0 ? <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">No friends found.</p> : null}
            {friends.map((friend) => {
              const friendUid = friend.uid || friend.id
              const photo = friend.photoUrl || friend.photoURL
              return (
                <div key={friend.id} className="grid gap-2 border p-3 text-sm dark:border-border/30 dark:bg-muted/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        {photo ? <AvatarImage src={photo} alt={friend.displayName || "Friend"} /> : null}
                        <AvatarFallback>{initials(friend.displayName, friend.email)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium dark:text-foreground">{friend.displayName || "Unknown"}</p>
                        <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground/70">{friend.email || "No email"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="dark:border-border/50">{friendUid.slice(0, 8)}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => void copyToClipboard(friendUid)} className="dark:border-border/50 dark:hover:bg-muted">
                      <IconCopy className="size-3.5" /> Copy UID
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openRelatedForFriend(friend)} className="dark:border-border/50 dark:hover:bg-muted">
                      <IconExternalLink className="size-3.5" /> Open related splits
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => inviteFriend(friend)} className="dark:border-border/50 dark:hover:bg-muted">
                      <IconSend className="size-3.5" /> Invite
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => void deleteFriend(friend.id)}>
                      <IconTrash className="size-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="dark:border-border/30">
          <DialogHeader>
            <DialogTitle className="dark:text-foreground">{mode === "create" ? "Add split" : selectedRow?.title ?? "Split details"}</DialogTitle>
            <DialogDescription className="dark:text-muted-foreground/70">Verify OTP to unlock add/edit/delete actions.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="split-title" className="dark:text-foreground">Title</Label>
              <Input id="split-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="dark:border-border/50 dark:bg-muted dark:text-foreground" />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="split-amount" className="dark:text-foreground">Amount</Label>
                <Input
                  id="split-amount"
                  type="number"
                  value={draftAmount}
                  onChange={(event) => setDraftAmount(Number(event.target.value || 0))}
                  className="dark:border-border/50 dark:bg-muted dark:text-foreground"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="split-status" className="dark:text-foreground">Status</Label>
                <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as SplitStatus)}>
                  <SelectTrigger id="split-status" className="w-full dark:border-border/50 dark:bg-muted dark:text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:border-border/30 dark:bg-muted">
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-input" className="dark:text-foreground">{mode === "create" ? "Member IDs (comma separated)" : "Add member ID"}</Label>
              <Input
                id="member-input"
                value={memberInput}
                onChange={(event) => setMemberInput(event.target.value)}
                placeholder="friend_uid_123"
                className="dark:border-border/50 dark:bg-muted dark:text-foreground"
              />
            </div>

            <div className="rounded-lg border bg-muted/25 p-3 dark:border-border/30 dark:bg-muted/40">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={sendOtp} className="dark:border-border/50 dark:hover:bg-muted">Send OTP</Button>
                <Input
                  value={otpInput}
                  onChange={(event) => setOtpInput(event.target.value)}
                  placeholder="Enter OTP"
                  className="max-w-[180px] dark:border-border/50 dark:bg-muted dark:text-foreground"
                />
                <Button onClick={verifyOtp} className="dark:hover:bg-primary/90">Verify OTP</Button>
              </div>

              {otpCode ? <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground/70">Demo OTP: {otpCode}</p> : null}
              <p className={cn("mt-2 text-xs", otpVerified ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground dark:text-muted-foreground/70")}>
                {otpVerified ? "OTP verified. Actions unlocked." : "Verify OTP to enable actions."}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {mode === "create" ? (
              <Button onClick={handleCreate} disabled={!otpVerified}>Create split</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleAddMember} disabled={!otpVerified || !memberInput.trim()} className="dark:border-border/50 dark:hover:bg-muted">
                  Add member
                </Button>
                <Button onClick={handleSave} disabled={!otpVerified}>Save changes</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={!otpVerified}>Delete split</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
