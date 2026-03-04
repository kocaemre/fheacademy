import { cn } from "@/lib/utils"

interface ProgressBarProps {
  completed: number
  total: number
  className?: string
  showText?: boolean
}

export function ProgressBar({
  completed,
  total,
  className,
  showText = true,
}: ProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {completed}/{total}
        </span>
      )}
    </div>
  )
}
