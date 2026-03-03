"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, BookOpen, FileCode, Circle } from "lucide-react"
import { curriculum } from "@/lib/curriculum"
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

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-sidebar-primary">
            FHE Academy
          </span>
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
                    <div className="flex items-center">
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === weekPath}
                        className="flex-1 pr-0"
                      >
                        <Link href={weekPath}>
                          <BookOpen className="size-4 shrink-0 text-sidebar-primary/70" />
                          <span className="truncate font-medium">
                            Week {week.id}: {week.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <button
                          className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          aria-label={`Toggle Week ${week.id} lessons`}
                        >
                          <ChevronDown className="size-4 transition-transform duration-200 [[data-state=closed]_&]:rotate-[-90deg]" />
                        </button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenuSub>
                          {week.lessons.map((lesson) => {
                            const lessonPath = `/week/${week.id}/lesson/${lesson.slug}`
                            const isLessonActive = pathname === lessonPath

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
                                    <Circle className="size-2 shrink-0 text-sidebar-foreground/20" />
                                    <span className="truncate">
                                      {lesson.id} {lesson.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}

                          {/* Homework entry */}
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
                                <FileCode className="size-3 shrink-0 text-sidebar-primary/40" />
                                <span className="truncate text-xs">
                                  HW: {week.homework.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
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
        <p className="text-xs text-sidebar-foreground/40">
          Powered by Zama
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
