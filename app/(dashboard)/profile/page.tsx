"use client"

import * as React from "react"
import { signOut } from "firebase/auth"
import { doc, getFirestore, onSnapshot } from "firebase/firestore"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthUser } from "@/hooks/use-auth-user"
import { auth } from "@/lib/firebase"

type ProfileDoc = Record<string, unknown> | null

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

function formatPrimitive(value: unknown) {
  if (value === null || value === undefined) return "-"
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "number") return value.toLocaleString("en-IN")
  if (typeof value === "string") return value
  return JSON.stringify(value)
}

export default function ProfilePage() {
  const { user, loading } = useAuthUser()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [profileDoc, setProfileDoc] = React.useState<ProfileDoc>(null)

  React.useEffect(() => {
    if (!user?.uid) {
      setProfileDoc(null)
      return
    }

    const db = getFirestore()
    const unsub = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfileDoc(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : null)
    })

    return () => unsub()
  }, [user?.uid])

  const handleSignOut = async () => {
    if (!auth) return
    await signOut(auth)
  }

  const userFields = React.useMemo(() => {
    if (!profileDoc) return [] as Array<[string, unknown]>
    return Object.entries(profileDoc)
  }, [profileDoc])

  const preferences = React.useMemo(() => {
    if (!profileDoc || typeof profileDoc.preferences !== "object" || profileDoc.preferences === null) return null
    return profileDoc.preferences as Record<string, unknown>
  }, [profileDoc])

  return (
    <div className="grid gap-6">
      <header className="border bg-card p-4 dark:border-border/30 dark:bg-card/50">
        <h1 className="font-heading text-3xl font-semibold dark:text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">User-specific account view for the currently signed-in Google user.</p>
      </header>

      <Card className="dark:border-border/30">
        <CardHeader className="border-b dark:border-border/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar>
                {user?.photoURL ? <AvatarImage src={user.photoURL} alt={user.displayName ?? "User"} /> : null}
                <AvatarFallback>{initials(user?.displayName, user?.email)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="dark:text-foreground">{user?.displayName || "Google User"}</CardTitle>
                <CardDescription className="dark:text-muted-foreground/70">{user?.email || "No email available"}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="dark:border-border/50 dark:hover:bg-muted">
              Sign out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">UID</p>
            <p className="break-all text-sm font-medium dark:text-foreground">{user?.uid || "-"}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Email verified</p>
            <p className="text-sm font-medium dark:text-foreground">{user?.emailVerified ? "Yes" : "No"}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Last sign in</p>
            <p className="text-sm font-medium dark:text-foreground">{formatDate(user?.metadata?.lastSignInTime)}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Account created</p>
            <p className="text-sm font-medium dark:text-foreground">{formatDate(user?.metadata?.creationTime)}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Theme active</p>
            <p className="text-sm font-medium dark:text-foreground">{resolvedTheme || "system"}</p>
          </div>
          <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Auth provider</p>
            <p className="text-sm font-medium dark:text-foreground">{user?.providerData?.[0]?.providerId || "google.com"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1 dark:border-border/30">
          <CardHeader className="border-b dark:border-border/30">
            <CardTitle className="dark:text-foreground">Light / Dark Compatibility</CardTitle>
            <CardDescription className="dark:text-muted-foreground/70">Switch theme mode for this dashboard session.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "system" },
              ].map((mode) => (
                <Button
                  key={mode.value}
                  variant={theme === mode.value ? "default" : "outline"}
                  onClick={() => setTheme(mode.value)}
                  className={theme !== mode.value ? "dark:border-border/50 dark:hover:bg-muted" : ""}
                >
                  {mode.label}
                </Button>
              ))}
            </div>

            <div className="border p-3 dark:border-border/30 dark:bg-muted/40">
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Theme active</p>
              <p className="text-sm font-medium dark:text-foreground">{resolvedTheme || "system"}</p>
            </div>

            {preferences ? (
              <div className="grid gap-2 border p-3 text-sm dark:border-border/30 dark:bg-muted/40">
                <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Preferences</p>
                {Object.entries(preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground dark:text-muted-foreground/70">{key}</span>
                    <span className="font-medium dark:text-foreground">{formatPrimitive(value)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 dark:border-border/30">
          <CardHeader className="border-b dark:border-border/30">
            <CardTitle className="dark:text-foreground">Profile Details</CardTitle>
            <CardDescription className="dark:text-muted-foreground/70">Widgetized user information from users/&lt;uid&gt; only.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4 md:grid-cols-2">
            {loading ? <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">Loading auth session...</p> : null}
            {!loading && !user?.uid ? <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">Sign in with Google to view profile details.</p> : null}
            {user?.uid && !profileDoc ? <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">No user profile document found at users/&lt;uid&gt;.</p> : null}

            {profileDoc ? (
              userFields.map(([key, value]) => (
                <div key={key} className="border p-3 text-sm dark:border-border/30 dark:bg-muted/40">
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">{key}</p>
                  <p className="mt-1 break-all font-medium dark:text-foreground">
                    {key.toLowerCase().includes("at") || key.toLowerCase().includes("date") ? formatDate(value) : formatPrimitive(value)}
                  </p>
                </div>
              ))
            ) : null}

            {user?.uid ? (
              <div className="md:col-span-2">
                <Badge variant="outline" className="dark:border-border/50">Scoped path: users/{user.uid}</Badge>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
