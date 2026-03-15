"use client"

import { useEffect, useRef } from "react"
import { Check, Circle } from "lucide-react"
import { useProgress } from "@/components/providers/progress-provider"
import { cn } from "@/lib/utils"

interface MarkCompleteProps {
  itemId: string
}

export function MarkComplete({ itemId }: MarkCompleteProps) {
  const { isComplete, toggleComplete, markComplete } = useProgress()
  const completed = isComplete(itemId)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Auto-mark complete when user scrolls to this element
  useEffect(() => {
    if (completed) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markComplete(itemId)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [itemId, completed, markComplete])

  return (
    <div ref={sentinelRef}>
      <button
        onClick={() => toggleComplete(itemId)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95",
          completed
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        {completed ? (
          <Check className="size-4" />
        ) : (
          <Circle className="size-4" />
        )}
        {completed ? "Completed" : "Mark as Complete"}
      </button>
    </div>
  )
}
