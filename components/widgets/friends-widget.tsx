"use client"

import * as React from "react"
import { doc, getFirestore, onSnapshot } from "firebase/firestore"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FriendRow = {
  uid?: string
  displayName?: string
  email?: string
  photoUrl?: string
  addedAt?: unknown
}

function initials(displayName: string | null | undefined, email: string | null | undefined) {
  const source = displayName?.trim() || email?.trim() || "User"
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(value: unknown) {
  if (!value) return "-"

  if (typeof value === "object") {
    if ("toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
      const parsed = (value as { toDate: () => Date }).toDate()
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString("en-IN")
      }
    }

    if ("seconds" in value && typeof (value as { seconds?: unknown }).seconds === "number") {
      const parsed = new Date((value as { seconds: number }).seconds * 1000)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString("en-IN")
      }
    }
  }

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN")
}

export function FriendsWidget({ userUid }: { userUid: string | null }) {
  const [friendsFromDoc, setFriendsFromDoc] = React.useState<FriendRow[]>([])

  React.useEffect(() => {
    if (!userUid) {
      setFriendsFromDoc([])
      return
    }

    const db = getFirestore()
    const unsub = onSnapshot(doc(db, "users", userUid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const raw = data?.friends
        if (Array.isArray(raw)) {
          const filtered = raw.filter((item): item is FriendRow => Boolean(item && typeof item === "object"))
          setFriendsFromDoc(filtered)
        } else {
          setFriendsFromDoc([])
        }
      } else {
        setFriendsFromDoc([])
      }
    })

    return () => unsub()
  }, [userUid])

  return (
    <Card className="dark:border-border/30">
      <CardHeader className="border-b dark:border-border/30">
        <CardTitle className="dark:text-foreground">Friends</CardTitle>
        <CardDescription className="dark:text-muted-foreground/70">Friends from your user document profile.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 md:grid-cols-2">
        {friendsFromDoc.length === 0 ? (
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">No friends stored in profile document.</p>
        ) : null}
        {friendsFromDoc.map((friend, index) => (
          <div
            key={`${friend.uid ?? friend.email ?? "friend"}-${index}`}
            className="grid gap-2 border p-3 dark:border-border/30 dark:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                {friend.photoUrl ? <AvatarImage src={friend.photoUrl} alt={friend.displayName ?? "Friend"} /> : null}
                <AvatarFallback>{initials(friend.displayName, friend.email)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium dark:text-foreground">{friend.displayName || "Unknown"}</p>
                <p className="break-all text-muted-foreground dark:text-muted-foreground/70">{friend.email || "No email"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">UID: {friend.uid || "-"}</p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Added: {formatDate(friend.addedAt)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
