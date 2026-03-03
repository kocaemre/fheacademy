import { cva, type VariantProps } from "class-variance-authority"
import { Lightbulb, AlertTriangle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const calloutVariants = cva("my-6 rounded-lg border-l-4 p-4", {
  variants: {
    type: {
      tip: "border-l-primary bg-primary/5",
      warning: "border-l-warning bg-warning/5",
      mistake: "border-l-error bg-error/5",
      info: "border-l-info bg-info/5",
    },
  },
  defaultVariants: {
    type: "info",
  },
})

const icons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  mistake: XCircle,
  info: Info,
}

const iconColors = {
  tip: "text-primary",
  warning: "text-warning",
  mistake: "text-error",
  info: "text-info",
}

interface CalloutBoxProps extends VariantProps<typeof calloutVariants> {
  title?: string
  children: React.ReactNode
}

export function CalloutBox({
  type = "info",
  title,
  children,
}: CalloutBoxProps) {
  const Icon = icons[type!]
  return (
    <div className={cn(calloutVariants({ type }))}>
      <div className="flex items-start gap-3">
        <Icon
          className={cn("mt-0.5 h-5 w-5 shrink-0", iconColors[type!])}
        />
        <div>
          {title && (
            <p className="mb-1 font-semibold text-text-primary">{title}</p>
          )}
          <div className="text-sm text-text-secondary">{children}</div>
        </div>
      </div>
    </div>
  )
}
