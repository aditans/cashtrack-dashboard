"use client"

import * as React from "react"
import { onAuthStateChanged, type User } from "firebase/auth"

import { auth } from "@/lib/firebase"

function useAuthUser() {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(Boolean(auth))

  React.useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  return { user, loading }
}

export { useAuthUser }