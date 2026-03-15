"use client"

import Link from "next/link"
import { CheckCircle2, ArrowRight, Wallet } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { useProgress } from "@/components/providers/progress-provider"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { curriculum } from "@/lib/curriculum"
import { getAllItems } from "@/lib/progress"
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb-client"

export default function DashboardPage() {
  const account = useActiveAccount()
  const { isComplete, weekProgress, overallProgress, isLoading } = useProgress()

  const overall = overallProgress()
  const percentage =
    overall.total === 0
      ? 0
      : Math.round((overall.completed / overall.total) * 100)

  // Calculate next uncompleted item for "Continue Learning"
  const allItems = getAllItems()
  const nextItem = allItems.find((id) => !isComplete(id))

  function buildContinueUrl(itemId: string): string {
    const [type, weekId, ...slugParts] = itemId.split("-")
    const slug = slugParts.join("-")
    if (type === "lesson") {
      return `/week/${weekId}/lesson/${slug}`
    }
    return `/week/${weekId}/homework/${slug}`
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Gate: require wallet connection
  if (!account) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Connect Your Wallet
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Connect your wallet to access the dashboard and track your progress across devices.
            </p>
          </div>
          <ConnectButton client={thirdwebClient} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Page Header + Overall Progress */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {overall.completed} of {overall.total} completed ({percentage}%)
          </p>
        </div>

        {/* Large overall progress bar */}
        <ProgressBar
          completed={overall.completed}
          total={overall.total}
          showText={false}
          className="[&>div:first-child]:h-3"
        />
      </div>

      {/* Continue Learning / Congratulations */}
      {nextItem ? (
        <Link
          href={buildContinueUrl(nextItem)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue Learning
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-6 py-4">
          <CheckCircle2 className="size-6 text-success" />
          <div>
            <p className="font-semibold text-foreground">
              All lessons completed!
            </p>
            <p className="text-sm text-muted-foreground">
              Congratulations on finishing the entire FHEVM Academy curriculum.
            </p>
          </div>
        </div>
      )}

      {/* Per-Week Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {curriculum.map((week) => {
          const wp = weekProgress(week.id)
          return (
            <Link
              key={week.id}
              href={`/week/${week.id}`}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              {/* Week number badge */}
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {week.id}
                </span>
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                  {week.title}
                </h3>
              </div>

              {/* Week goal */}
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {week.goal}
              </p>

              {/* Progress bar */}
              <ProgressBar completed={wp.completed} total={wp.total} />

              {/* Fraction text */}
              <p className="mt-2 text-xs text-muted-foreground">
                {wp.completed}/{wp.total} completed
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
