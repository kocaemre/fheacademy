"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ProgressProvider } from "@/components/providers/progress-provider"

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProgressProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 items-center border-b border-border px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProgressProvider>
  )
}
