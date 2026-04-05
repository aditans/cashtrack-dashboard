"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react"
import { onAuthStateChanged } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth, hasFirebaseConfig, signInWithGoogle } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/home")
    })
    return () => unsub()
  }, [router])

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      router.push("/home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader className="border-b">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Firebase-auth login used by transactions, splits, and sync widgets.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          <Button onClick={handleGoogle} disabled={loading || !hasFirebaseConfig}>
            {loading ? <IconLoader2 className="size-4 animate-spin" /> : <IconBrandGoogleFilled className="size-4" />} Sign in with Google
          </Button>
          {!hasFirebaseConfig ? <p className="text-xs text-muted-foreground">Set NEXT_PUBLIC_FIREBASE_* environment variables to enable authentication.</p> : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    </main>
  )
}