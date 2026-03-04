import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, CheckCircle2, BookOpen } from "lucide-react"
import { getWeek, curriculum } from "@/lib/curriculum"
import { Homework1Content } from "@/content/homework/homework-1"
import { Homework2Content } from "@/content/homework/homework-2"
import { Homework3Content } from "@/content/homework/homework-3"
import { Homework4Content } from "@/content/homework/homework-4"

interface HomeworkPageProps {
  params: Promise<{ weekId: string; homeworkSlug: string }>
}

// Content registry: maps "weekId-homeworkSlug" to content component
const homeworkContent: Record<string, React.ComponentType> = {
  "1-temperature-converter-migration": Homework1Content,
  "2-confidential-erc20-token": Homework2Content,
  "3-sealed-bid-auction-dapp": Homework3Content,
  "4-capstone-confidential-dapp": Homework4Content,
}

const difficultyStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  beginner: {
    bg: "bg-success/10",
    text: "text-success",
    label: "Beginner",
  },
  intermediate: {
    bg: "bg-warning/10",
    text: "text-warning",
    label: "Intermediate",
  },
  advanced: {
    bg: "bg-error/10",
    text: "text-error",
    label: "Advanced",
  },
}

export async function generateStaticParams() {
  return curriculum.map((week) => ({
    weekId: String(week.id),
    homeworkSlug: week.homework.slug,
  }))
}

export async function generateMetadata({
  params,
}: HomeworkPageProps): Promise<Metadata> {
  const { weekId, homeworkSlug } = await params
  const week = getWeek(Number(weekId))

  if (!week || week.homework.slug !== homeworkSlug) {
    return { title: "Homework Not Found" }
  }

  return {
    title: `${week.homework.title} | Week ${week.id} Homework | FHE Academy`,
    description: week.homework.description,
  }
}

export default async function HomeworkPage({ params }: HomeworkPageProps) {
  const { weekId, homeworkSlug } = await params
  const weekNum = Number(weekId)
  const week = getWeek(weekNum)

  if (!week || week.homework.slug !== homeworkSlug) {
    notFound()
  }

  const { homework } = week
  const difficulty = difficultyStyles[homework.difficulty]
  const key = `${weekNum}-${homeworkSlug}`
  const Content = homeworkContent[key]

  // If homework has authored content, render it
  if (Content) {
    return (
      <div className="px-6 py-8 lg:px-10">
        <div className="max-w-3xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/week/${week.id}`}
              className="hover:text-foreground transition-colors"
            >
              Week {week.id}
            </Link>
            <span>/</span>
            <span className="text-foreground">Homework</span>
          </nav>
          <Content />
        </div>
      </div>
    )
  }

  // Skeleton from curriculum.ts data
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/week/${week.id}`}
            className="hover:text-foreground transition-colors"
          >
            Week {week.id}: {week.title}
          </Link>
          <span>/</span>
          <span className="text-foreground">Homework</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${difficulty.bg} ${difficulty.text}`}
            >
              {difficulty.label}
            </span>
            <span className="text-sm text-muted-foreground">
              Week {week.id} Homework
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {homework.title}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            {homework.description}
          </p>
        </div>

        {/* Learning Objectives */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Week {week.id} Learning Objectives
          </h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <ul className="space-y-2">
              {week.learningObjectives.map((objective, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-text-secondary"
                >
                  <BookOpen className="mt-0.5 size-4 shrink-0 text-primary/60" />
                  <span className="leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Requirements / Deliverables */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Requirements
          </h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <ul className="space-y-2">
              {homework.deliverables.map((deliverable, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-text-secondary"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success/60" />
                  <span className="leading-relaxed">{deliverable}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Starter Code Placeholder */}
        {/* TODO: Plans 02-05 will add week-specific starter code and detailed instructions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Starter Code
          </h2>
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">
              Starter code and step-by-step instructions will be added when
              this homework content is authored.
            </p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Getting Started
          </h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-text-secondary leading-relaxed mb-3">
              Before starting this homework, make sure you have completed all
              lessons in Week {week.id}:
            </p>
            <ul className="space-y-1.5">
              {week.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/week/${week.id}/lesson/${lesson.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Lesson {lesson.id}: {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Rubric Placeholder */}
        {/* TODO: Plans 02-05 will add week-specific grading rubric */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Grading Rubric
          </h2>
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">
              Detailed grading rubric will be added when this homework
              content is authored.
            </p>
          </div>
        </section>

        {/* Submission Guidelines */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Submission Guidelines
          </h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  1
                </span>
                <span className="leading-relaxed">
                  Complete all deliverables listed in the requirements section
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  2
                </span>
                <span className="leading-relaxed">
                  Ensure all tests pass in mock mode before submission
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  3
                </span>
                <span className="leading-relaxed">
                  Push your code to a GitHub repository and share the link
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Back to Week */}
        <div className="mt-10 border-t border-border pt-6">
          <Link
            href={`/week/${week.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Week {week.id}: {week.title}
          </Link>
        </div>
      </div>
    </div>
  )
}
