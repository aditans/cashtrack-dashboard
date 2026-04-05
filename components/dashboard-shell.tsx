"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconChartBar,
  IconCalendar,
  IconHome,
  IconMenu2,
  IconMessageCircle,
  IconReceipt,
  IconUserCircle,
  IconUsers,
  IconX,
  IconTrendingUp,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthUser } from "@/hooks/use-auth-user"

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: IconHome },
  { href: "/transactions", label: "Transactions", icon: IconReceipt },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/splits", label: "Splits", icon: IconUsers },
  { href: "/sandbox", label: "Sandbox", icon: IconTrendingUp },
  { href: "/chippy", label: "Chippy", icon: IconMessageCircle },
  { href: "/profile", label: "Profile", icon: IconUserCircle },
] as const

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`justify-start gap-3 border px-3 ${active ? "border-primary/20 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"}`}
            >
              <Link href={item.href} onClick={onNavigate}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}

        <div className="mt-auto grid gap-2 border-t pt-3 text-xs text-muted-foreground">
          <a href="https://www.instagram.com/cashtrack_app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <IconBrandInstagram className="size-4 text-pink-500" /> @cashtrack_app
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <IconBrandGithub className="size-4" /> source workspace
          </a>
        </div>
      </CardContent>
    </>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { user } = useAuthUser()
  const router = useRouter()

  React.useEffect(() => {
    const prefetch = () => {
      for (const item of NAV_ITEMS) {
        router.prefetch(item.href)
      }
    }

    const idleCallback = window.requestIdleCallback
    if (typeof idleCallback === "function") {
      const id = idleCallback(prefetch)
      return () => window.cancelIdleCallback(id)
    }

    const timeout = window.setTimeout(prefetch, 0)
    return () => window.clearTimeout(timeout)
  }, [router])

  const avatarFallback = React.useMemo(() => {
    if (user?.displayName?.trim()) {
      const initials = user.displayName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
      if (initials) return initials
    }
    if (user?.email?.trim()) return user.email.trim()[0].toUpperCase()
    return "CT"
  }, [user?.displayName, user?.email])

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMobileOpen((open) => !open)} className="lg:hidden" aria-label="Toggle sidebar">
              <IconMenu2 className="size-5" />
            </Button>
            <Image src="/assets/app_assets/logo.png" alt="CashTrack" width={32} height={32} className="size-8 object-contain" priority />
            <span className="font-heading text-base font-semibold">CashTrack</span>
          </div>
          <Avatar>
            <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "Profile"} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {mobileOpen ? <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" /> : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm text-muted-foreground">Menu</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
            <IconX className="size-4" />
          </Button>
        </div>
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-6">
        <Card className="hidden h-[calc(100vh-7rem)] min-h-[560px] lg:flex lg:flex-col">
          <SidebarNav />
        </Card>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  )
}