"use client"

import React, { useState, useEffect } from "react"
import { IconSquareRoundedX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const KYC_STEPS = [
  "Verifying PAN details",
  "Fetching financial profile",
  "Analyzing risk appetite",
  "Setting up your portfolio insights",
  "Almost done...",
]

interface KYCFlowProps {
  isOpen: boolean
  onComplete: () => void
}

export function KYCFlowWidget({ isOpen, onComplete }: KYCFlowProps) {
  const [step, setStep] = useState(0)
  const [pan, setPan] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleVerifyPAN = () => {
    if (pan.trim().length === 10) {
      setIsVerifying(true)
      setStep(0)

      // Auto-progress through steps
      const interval = setInterval(() => {
        setStep((prev) => {
          if (prev < KYC_STEPS.length - 1) {
            return prev + 1
          } else {
            clearInterval(interval)
            setTimeout(() => {
              setIsComplete(true)
              setTimeout(() => {
                onComplete()
              }, 1500)
            }, 1500)
            return prev
          }
        })
      }, 1500)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
        {!isVerifying ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your KYC</DialogTitle>
              <DialogDescription>Verify your PAN to access advanced portfolio insights</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pan" className="text-sm font-medium">
                  PAN Number
                </label>
                <Input
                  id="pan"
                  placeholder="e.g., AAAPA1234K"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  disabled={isVerifying}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Enter your 10-digit PAN number</p>
              </div>

              <Button
                onClick={handleVerifyPAN}
                disabled={pan.length !== 10 || isVerifying}
                className="w-full"
              >
                Verify PAN
              </Button>
            </div>
          </>
        ) : isComplete ? (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold">KYC Verification Complete</h3>
            <p className="text-sm text-muted-foreground">Your portfolio insights are ready!</p>
          </div>
        ) : (
          <div className="space-y-6 py-8">
            <div className="space-y-4">
              {KYC_STEPS.map((stepText, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                      idx < step ? "bg-emerald-600 text-white" : idx === step ? "bg-blue-600 text-white" : "bg-muted"
                    }`}
                  >
                    {idx < step ? "✓" : idx + 1}
                  </div>
                  <span className={idx <= step ? "font-medium" : "text-muted-foreground"}>{stepText}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-500"
                  style={{ width: `${((step + 1) / KYC_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">{Math.round(((step + 1) / KYC_STEPS.length) * 100)}% Complete</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
