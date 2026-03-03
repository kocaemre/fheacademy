import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, FileCode } from "lucide-react"
import { getWeek, curriculum } from "@/lib/curriculum"

interface WeekPageProps {
  params: Promise<{ weekId: string }>
}

export async function generateStaticParams() {
  return curriculum.map((week) => ({
    weekId: String(week.id),
  }))
}

export async function generateMetadata({
  params,
}: WeekPageProps): Promise<Metadata> {
  const { weekId } = await params
  const week = getWeek(Number(weekId))
  if (!week) return { title: "Week Not Found" }

  return {
    title: `Week ${week.id}: ${week.title} | FHE Academy`,
    description: week.goal,
  }
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { weekId } = await params
  const week = getWeek(Number(weekId))

  if (!week) {
    notFound()
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-primary mb-2">
          Week {week.id} of {curriculum.length}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
          {week.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
          {week.goal}
        </p>

        {/* Lessons list */}
        <div className="space-y-2 mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Lessons
          </h2>
          {week.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/week/${week.id}/lesson/${lesson.slug}`}
              className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-sm font-mono font-medium text-primary">
                  {lesson.id}
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {lesson.type}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        {/* Homework */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Homework
          </h2>
          <Link
            href={`/week/${week.id}/homework/${week.homework.slug}`}
            className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-secondary/30 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-secondary/10">
                <FileCode className="size-4 text-secondary" />
              </span>
              <p className="font-medium text-foreground">
                {week.homework.title}
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-secondary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
