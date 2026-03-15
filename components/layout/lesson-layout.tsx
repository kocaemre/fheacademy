import Link from "next/link"
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"
import { MarkComplete } from "@/components/ui/mark-complete"

interface LessonLayoutProps {
  weekId: number
  weekTitle: string
  lessonId: string
  lessonTitle: string
  learningObjective: string
  children: React.ReactNode
  prev?: { weekId: number; lesson: { slug: string; title: string } }
  next?: { weekId: number; lesson: { slug: string; title: string } }
  itemId?: string
}

export function LessonLayout({
  weekId,
  weekTitle,
  lessonId,
  lessonTitle,
  learningObjective,
  children,
  prev,
  next,
  itemId,
}: LessonLayoutProps) {
  return (
    <div className="px-6 py-8 lg:px-10">
      {/* Breadcrumb */}
      <nav className="mx-auto mb-6 flex max-w-3xl items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href={`/week/${weekId}`}
          className="hover:text-foreground transition-colors"
        >
          Week {weekId}: {weekTitle}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground">Lesson {lessonId}</span>
      </nav>

      {/* Lesson header */}
      <div className="mx-auto mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {lessonTitle}
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          {learningObjective}
        </p>
      </div>

      {/* Lesson content -- max-w-3xl for prose, code blocks can break out via lesson-content class */}
      <div className="lesson-content mx-auto max-w-3xl">
        {children}
      </div>

      {/* Mark as Complete */}
      {itemId && (
        <div className="mx-auto mt-8 mb-4 max-w-3xl">
          <MarkComplete itemId={itemId} />
        </div>
      )}

      {/* Prev/Next navigation */}
      <nav className="mx-auto mt-16 flex max-w-3xl items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/week/${prev.weekId}/lesson/${prev.lesson.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <div className="text-right">
              <div className="text-xs text-muted-foreground/70">Previous</div>
              <div className="font-medium">{prev.lesson.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/week/${next.weekId}/lesson/${next.lesson.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
          >
            <div>
              <div className="text-xs text-muted-foreground/70">Next</div>
              <div className="font-medium">{next.lesson.title}</div>
            </div>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  )
}
