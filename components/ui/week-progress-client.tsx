"use client"

import { useProgress } from "@/components/providers/progress-provider"
import { ProgressBar } from "@/components/ui/progress-bar"

interface WeekProgressClientProps {
  weekId: number
}

export function WeekProgressClient({ weekId }: WeekProgressClientProps) {
  const { weekProgress, isLoading } = useProgress()

  if (isLoading) {
    return null
  }

  const wp = weekProgress(weekId)

  return (
    <div className="rounded-lg border border-border bg-card p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Your Progress
        </span>
        <span className="text-sm text-muted-foreground">
          {wp.completed} of {wp.total} items completed
        </span>
      </div>
      <ProgressBar completed={wp.completed} total={wp.total} showText={false} />
    </div>
  )
}
