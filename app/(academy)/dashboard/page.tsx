"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  ArrowRight,
  Wallet,
  Circle,
  BookOpen,
  FileCode,
  Github,
  ExternalLink,
  Trophy,
} from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { useProgress } from "@/components/providers/progress-provider"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { curriculum } from "@/lib/curriculum"
import { getAllItems, getItemId } from "@/lib/progress"
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from "@/lib/thirdweb-client"

interface Grade {
  homework_id: string
  score: number
}

interface CapstoneSubmission {
  repo_url: string
  status: string
}

export default function DashboardPage() {
  const account = useActiveAccount()
  const { isComplete, weekProgress, overallProgress, isLoading } = useProgress()
  const [grades, setGrades] = useState<Grade[]>([])
  const [capstone, setCapstone] = useState<CapstoneSubmission | null>(null)

  const overall = overallProgress()
  const percentage =
    overall.total === 0
      ? 0
      : Math.round((overall.completed / overall.total) * 100)

  const allItems = getAllItems()
  const nextItem = allItems.find((id) => !isComplete(id))

  // Load grades and capstone
  useEffect(() => {
    if (!account?.address) return
    fetch(`/api/grades?wallet=${account.address}`)
      .then((r) => r.json())
      .then((data) => setGrades(data.grades ?? []))
      .catch(() => {})
    fetch(`/api/capstone?wallet=${account.address}`)
      .then((r) => r.json())
      .then((data) => setCapstone(data.submission ?? null))
      .catch(() => {})
  }, [account?.address])

  function buildContinueUrl(itemId: string): string {
    const [type, weekId, ...slugParts] = itemId.split("-")
    const slug = slugParts.join("-")
    if (type === "lesson") {
      return `/week/${weekId}/lesson/${slug}`
    }
    return `/week/${weekId}/homework/${slug}`
  }

  function getGrade(homeworkId: string): number | null {
    const g = grades.find((g) => g.homework_id === homeworkId)
    return g ? g.score : null
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

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
              Connect your wallet to access the dashboard and track your progress
              across devices.
            </p>
          </div>
          <ConnectButton client={thirdwebClient} />
        </div>
      </div>
    )
  }

  const capstoneStatusLabel: Record<string, { text: string; color: string }> = {
    pending_review: { text: "Pending Review", color: "text-primary" },
    reviewed: { text: "Reviewed", color: "text-secondary" },
    passed: { text: "Passed", color: "text-success" },
    failed: { text: "Needs Revision", color: "text-destructive" },
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your learning progress at a glance
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">{percentage}%</p>
          <p className="text-xs text-muted-foreground">Overall Progress</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">
            {overall.completed}/{overall.total}
          </p>
          <p className="text-xs text-muted-foreground">Items Completed</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">
            {grades.length}/4
          </p>
          <p className="text-xs text-muted-foreground">Homework Graded</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">
            {capstone ? (capstone.status === "passed" ? "Done" : "Sent") : "--"}
          </p>
          <p className="text-xs text-muted-foreground">Capstone</p>
        </div>
      </div>

      {/* Overall progress bar */}
      <ProgressBar
        completed={overall.completed}
        total={overall.total}
        showText={false}
        className="[&>div:first-child]:h-3"
      />

      {/* Continue Learning */}
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

      {/* Weekly Progress */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Weekly Progress
        </h2>
        <div className="space-y-3">
          {curriculum.map((week) => {
            const wp = weekProgress(week.id)
            const hwId = getItemId("homework", week.id, week.homework.slug)
            const hwDone = isComplete(hwId)
            const grade = getGrade(`homework-${week.id}-${week.homework.slug}`)
            const lessonsDone = week.lessons.filter((l) =>
              isComplete(getItemId("lesson", week.id, l.slug))
            ).length

            return (
              <div
                key={week.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Week info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {week.id}
                      </span>
                      <Link
                        href={`/week/${week.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {week.title}
                      </Link>
                    </div>
                    <ProgressBar completed={wp.completed} total={wp.total} />
                  </div>

                  {/* Right: Lesson + Homework status */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {lessonsDone}/{week.lessons.length}
                      </span>
                    </div>
                    <Link
                      href={`/week/${week.id}/homework/${week.homework.slug}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      {hwDone ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                      <span className={hwDone ? "text-success" : "text-muted-foreground"}>
                        HW
                      </span>
                      {grade !== null && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                          {grade}/100
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Capstone Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Capstone Project
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          {capstone ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Github className="size-5 text-muted-foreground" />
                <a
                  href={capstone.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {capstone.repo_url.replace("https://github.com/", "")}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                {capstone.status === "passed" && (
                  <Trophy className="size-4 text-primary" />
                )}
                <span
                  className={`text-sm font-medium ${
                    capstoneStatusLabel[capstone.status]?.color ?? "text-muted-foreground"
                  }`}
                >
                  {capstoneStatusLabel[capstone.status]?.text ?? capstone.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Complete Week 4 homework and submit your capstone project
                </p>
              </div>
              <Link
                href={`/week/4/homework/capstone-confidential-dapp`}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Go to Capstone
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
