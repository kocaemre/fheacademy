"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ProgressProvider } from "@/components/providers/progress-provider"
import { HeaderWallet } from "@/components/layout/header-wallet"
import { useActiveAccount } from "thirdweb/react"
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb-client"
import { Wallet } from "lucide-react"

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const account = useActiveAccount()

  if (!account) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Connect Your Wallet
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Connect your wallet to access lessons, track your progress, and complete assignments.
            </p>
          </div>
          <ConnectButton client={thirdwebClient} />
        </div>
      </div>
    )
  }

  return (
    <ProgressProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 items-center justify-between border-b border-border px-4">
            <SidebarTrigger />
            <HeaderWallet />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProgressProvider>
  )
}
