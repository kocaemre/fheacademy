"use client"

import { useProgress } from "@/components/providers/progress-provider"
import { ProgressBar } from "@/components/ui/progress-bar"

interface SyllabusWeekProgressProps {
  weekId: number
}

export function SyllabusWeekProgress({ weekId }: SyllabusWeekProgressProps) {
  const { weekProgress, isLoading } = useProgress()

  if (isLoading) {
    return null
  }

  const wp = weekProgress(weekId)

  return <ProgressBar completed={wp.completed} total={wp.total} className="mt-2" />
}
