"use client"

import React, { useState } from "react"
import { IconX, IconMessage } from "@tabler/icons-react"

interface ChippyBubbleProps {
  message: string
  visible?: boolean
}

export function ChippyBubble({ message, visible = true }: ChippyBubbleProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!visible) return null

  return (
    <>
      {/* Chat Bubble */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-48px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl border border-border/60 bg-card shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-gradient-to-r from-blue-50 to-blue-50/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                  C
                </div>
                <div>
                  <p className="text-sm font-semibold">Chippy</p>
                  <p className="text-xs text-muted-foreground">Your portfolio assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconX className="size-4" />
              </button>
            </div>

            {/* Message */}
            <div className="space-y-3 px-4 py-4">
              <div className="flex gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                  C
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm leading-relaxed max-w-xs">
                  {message}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors">
                  View Details
                </button>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-xl hover:scale-110"
        }`}
      >
        {isOpen ? (
          <IconX className="size-6 text-white" />
        ) : (
          <IconMessage className="size-6 text-white" />
        )}
      </button>
    </>
  )
}
