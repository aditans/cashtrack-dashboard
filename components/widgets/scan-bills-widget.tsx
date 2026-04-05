"use client"

import * as React from "react"
import { IconPhotoScan, IconUpload } from "@tabler/icons-react"
import { collection, doc, getFirestore, setDoc } from "firebase/firestore"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ScanBillsWidget({ userUid }: { userUid?: string | null }) {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"idle" | "ready" | "uploaded" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const onFile = (nextFile: File) => {
    if (!nextFile.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    setError(null)
    setFile(nextFile)
    setStatus("ready")
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null)
    reader.readAsDataURL(nextFile)
  }

  const handleUpload = async () => {
    if (!file) return
    if (!userUid) {
      setError("Sign in required for Firestore upload")
      return
    }

    try {
      const db = getFirestore()
      const ref = doc(collection(db, "users", userUid, "scannedBills"))
      await setDoc(ref, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: "pending",
        createdAt: new Date().toISOString(),
      })
      setStatus("uploaded")
    } catch (uploadError) {
      setStatus("error")
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed")
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Scan Bills</CardTitle>
        <CardDescription>Old implementation retained: image selection with Firestore upload record.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0]
            if (nextFile) onFile(nextFile)
          }}
        />

        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <IconPhotoScan className="size-4" /> Choose receipt image
        </Button>

        {preview ? <img src={preview} alt={file?.name ?? "Bill preview"} className="h-44 w-full border object-cover" /> : null}
        {file ? <p className="text-xs text-muted-foreground">{file.name}</p> : null}

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={!file || status === "uploaded"}>
            <IconUpload className="size-4" /> Upload
          </Button>
          <Badge variant={status === "uploaded" ? "secondary" : "outline"}>{status}</Badge>
        </div>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  )
}