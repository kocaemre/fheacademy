import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  FileCode,
  Target,
  CheckCircle2,
} from "lucide-react"
import { getWeek, curriculum } from "@/lib/curriculum"
import { WeekProgressClient } from "@/components/ui/week-progress-client"

interface WeekPageProps {
  params: Promise<{ weekId: string }>
}

const weekNarratives: Record<number, string> = {
  1: "This week bridges the gap between familiar Solidity development and the world of confidential smart contracts. You will set up your development environment, understand why privacy matters on-chain, and write your first FHEVM contract by migrating a simple counter.",
  2: "Building on your first FHEVM contract, this week takes a deep dive into the full encrypted type system, all available FHE operations, and the critical ACL permission mechanism. By the end, you will be able to build real token contracts with encrypted balances.",
  3: "This week moves from contracts to complete dApps. You will learn the decryption mechanism, build frontends that interact with encrypted contracts, and implement real-world patterns like sealed-bid auctions and private voting systems.",
  4: "The final week focuses on production readiness. You will learn gas optimization strategies, security best practices, and confidential DeFi design patterns before deploying to testnet and tackling your capstone project.",
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

  const narrative = weekNarratives[week.id]
  const difficulty = difficultyStyles[week.homework.difficulty]

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-primary mb-2">
          Week {week.id} of {curriculum.length}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
          {week.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          {week.goal}
        </p>

        {/* Narrative intro */}
        {narrative && (
          <p className="text-text-secondary leading-relaxed mb-10">
            {narrative}
          </p>
        )}

        {/* Per-Week Progress */}
        <WeekProgressClient weekId={week.id} />

        {/* Learning Objectives */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Learning Objectives
          </h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <ul className="space-y-2.5">
              {week.learningObjectives.map((objective, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-text-secondary"
                >
                  <Target className="mt-0.5 size-4 shrink-0 text-primary/60" />
                  <span className="leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

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

        {/* Homework Mini Spec Card */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Homework
          </h2>
          <Link
            href={`/week/${week.id}/homework/${week.homework.slug}`}
            className="group block rounded-lg border border-border bg-card hover:border-secondary/30 hover:bg-card/80 transition-colors overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-secondary/10">
                  <FileCode className="size-4 text-secondary" />
                </span>
                <div className="flex items-center gap-2.5">
                  <p className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                    {week.homework.title}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${difficulty.bg} ${difficulty.text}`}
                  >
                    {difficulty.label}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {week.homework.description}
              </p>
              <ul className="space-y-1.5">
                {week.homework.deliverables.map((deliverable, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success/50" />
                    <span className="leading-relaxed">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3 text-sm text-muted-foreground group-hover:text-secondary transition-colors">
              View homework details
              <ArrowRight className="size-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
