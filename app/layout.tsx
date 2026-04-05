import type { Metadata } from "next"
import { DM_Sans, Raleway } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'})
const ralewayHeading = Raleway({subsets:['latin'],variable:'--font-heading'})

export const metadata: Metadata = {
  title: "CashTrack Dashboard",
  description: "A shadcn-style finance dashboard built in the workspace root.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", dmSans.variable, ralewayHeading.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}