"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  BookOpen,
  FileCode,
  FileText,
  LayoutDashboard,
  Circle,
  CheckCircle,
} from "lucide-react"
import { curriculum } from "@/lib/curriculum"
import { useProgress } from "@/components/providers/progress-provider"
import { ProgressBar } from "@/components/ui/progress-bar"
import { getItemId } from "@/lib/progress"
import { ConnectButton, darkTheme } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const sidebarTheme = darkTheme({
  colors: {
    modalBg: "#13131A",
    primaryButtonBg: "#F5C518",
    primaryButtonText: "#0A0A0F",
    accentButtonBg: "#8B5CF6",
    accentButtonText: "#F1F1F3",
    accentText: "#F5C518",
    borderColor: "#1E1E2E",
    separatorLine: "#1E1E2E",
    primaryText: "#F1F1F3",
    secondaryText: "#9191A4",
    connectedButtonBg: "#1A1A24",
    connectedButtonBgHover: "#252540",
    tertiaryBg: "#0A0A0F",
  },
})

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isComplete, weekProgress, overallProgress, isLoading } = useProgress()
  const account = useActiveAccount()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-sidebar-primary">
            FHE Academy
          </span>
        </Link>
        <Link
          href="/syllabus"
          className={cn(
            "mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            pathname === "/syllabus" &&
              "text-sidebar-primary bg-sidebar-primary/10"
          )}
        >
          <FileText className="size-3.5" />
          Syllabus
        </Link>
        <Link
          href="/dashboard"
          className={cn(
            "mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            pathname === "/dashboard" &&
              "text-sidebar-primary bg-sidebar-primary/10"
          )}
        >
          <LayoutDashboard className="size-3.5" />
          Dashboard
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {curriculum.map((week) => {
          const weekPath = `/week/${week.id}`
          const isWeekActive = pathname.startsWith(weekPath)

          return (
            <SidebarGroup key={week.id} className="p-0">
              <Collapsible defaultOpen={isWeekActive}>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isWeekActive}
                        className="w-full"
                      >
                        <BookOpen className="size-4 shrink-0 text-sidebar-primary/70" />
                        <div className="flex-1 min-w-0">
                          <span className="truncate font-medium block">
                            Week {week.id}: {week.title}
                          </span>
                          {(() => {
                            const wp = weekProgress(week.id)
                            return (
                              <ProgressBar
                                completed={wp.completed}
                                total={wp.total}
                                className="mt-0.5"
                              />
                            )
                          })()}
                        </div>
                        <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 [[data-state=closed]_&]:rotate-[-90deg]" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenuSub>
                          {/* Week Overview link */}
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === weekPath}
                            >
                              <Link href={weekPath}>
                                <FileText className="size-3 shrink-0 text-sidebar-primary/40" />
                                <span className="truncate text-xs">Overview</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {week.lessons.map((lesson) => {
                            const lessonPath = `/week/${week.id}/lesson/${lesson.slug}`
                            const isLessonActive = pathname === lessonPath
                            const lessonItemId = getItemId("lesson", week.id, lesson.slug)
                            const lessonDone = !isLoading && isComplete(lessonItemId)

                            return (
                              <SidebarMenuSubItem key={lesson.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isLessonActive}
                                  className={
                                    isLessonActive
                                      ? "border-l-2 border-sidebar-primary bg-sidebar-primary/10 -ml-px"
                                      : ""
                                  }
                                >
                                  <Link href={lessonPath}>
                                    {lessonDone ? (
                                      <CheckCircle className="size-3 shrink-0 text-success" />
                                    ) : (
                                      <Circle className="size-2 shrink-0 text-sidebar-foreground/20" />
                                    )}
                                    <span className="truncate">
                                      {lesson.id} {lesson.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}

                          {/* Homework entry */}
                          {(() => {
                            const hwItemId = getItemId("homework", week.id, week.homework.slug)
                            const hwDone = !isLoading && isComplete(hwItemId)
                            return (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    pathname ===
                                    `/week/${week.id}/homework/${week.homework.slug}`
                                  }
                                  className="text-sidebar-foreground/60"
                                >
                                  <Link
                                    href={`/week/${week.id}/homework/${week.homework.slug}`}
                                  >
                                    {hwDone ? (
                                      <CheckCircle className="size-3 shrink-0 text-success" />
                                    ) : (
                                      <FileCode className="size-3 shrink-0 text-sidebar-primary/40" />
                                    )}
                                    <span className="truncate text-xs">
                                      HW: {week.homework.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })()}
                        </SidebarMenuSub>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </SidebarMenu>
              </Collapsible>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {account ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-mono text-sidebar-foreground/60">
              {truncateAddress(account.address)}
            </p>
            {(() => {
              const overall = overallProgress()
              return (
                <p className="text-xs text-sidebar-foreground/40">
                  {overall.completed}/{overall.total} lessons
                </p>
              )
            })()}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <ConnectButton
              client={thirdwebClient}
              theme={sidebarTheme}
              connectButton={{ label: "Connect Wallet" }}
            />
            <p className="text-xs text-sidebar-foreground/40">
              Powered by Zama
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
