import Link from "next/link"
import type { Metadata } from "next"
import {
  BookOpen,
  Target,
  FileCode,
  ArrowRight,
  GraduationCap,
  Code2,
  Shield,
  Rocket,
} from "lucide-react"
import { curriculum } from "@/lib/curriculum"

export const metadata: Metadata = {
  title: "Syllabus | FHE Academy",
  description:
    "Complete syllabus for the 4-week FHEVM Developer Bootcamp. Learn to build confidential smart contracts with Fully Homomorphic Encryption.",
}

const weekIcons = [BookOpen, Code2, Shield, Rocket]

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

export default function SyllabusPage() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="max-w-4xl">
        {/* Course Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary mb-3">
            <GraduationCap className="size-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Course Syllabus
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            FHEVM Developer Bootcamp
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            A 4-week hands-on curriculum for building confidential smart
            contracts with Zama&apos;s FHEVM
          </p>
          <div className="space-y-3 text-text-secondary leading-relaxed mb-6">
            <p>
              This bootcamp uses a <strong className="text-foreground">Migration Mindset</strong> approach:
              every lesson starts with familiar Solidity code and shows you,
              side-by-side, how to transform it into a confidential FHEVM
              contract. You will never stare at encrypted types in isolation --
              you will always see where they came from and why.
            </p>
            <p>
              Each week builds on the last. You start by migrating a simple
              counter, graduate to encrypted tokens and access control, build
              full-stack dApps with React frontends, and finish with a
              capstone project you design yourself. By the end, you will have
              deployed a real confidential dApp to testnet.
            </p>
            <p>
              No prior FHE knowledge is required. If you can write a Solidity
              contract and run Hardhat tests, you have everything you need to
              get started.
            </p>
          </div>

          {/* Course Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="font-semibold text-foreground">4 Weeks</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Lessons</p>
              <p className="font-semibold text-foreground">20 Lessons</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-1">Homework</p>
              <p className="font-semibold text-foreground">
                4 Projects + Capstone
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="rounded-lg border border-border bg-card p-5 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Prerequisites
            </h2>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-2.5">
                <Target className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <span className="leading-relaxed">
                  Basic understanding of Ethereum and smart contract concepts
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Target className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <span className="leading-relaxed">
                  Working knowledge of Solidity (variables, functions,
                  mappings, modifiers)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Target className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <span className="leading-relaxed">
                  Experience with Hardhat or similar development framework
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Target className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <span className="leading-relaxed">
                  Basic React knowledge for frontend integration lessons
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Target className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <span className="leading-relaxed">
                  No prior FHE or cryptography knowledge required -- the
                  course teaches everything from scratch
                </span>
              </li>
            </ul>
          </div>

          {/* What You'll Build */}
          <div className="rounded-lg border border-border bg-card p-5 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              What You&apos;ll Build
            </h2>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-2.5">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span className="leading-relaxed">
                  Encrypted counter contract (Week 1 demo)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span className="leading-relaxed">
                  Temperature converter migration (Week 1 homework)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span className="leading-relaxed">
                  Confidential ERC-20 token with encrypted balances (Week 2
                  homework)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span className="leading-relaxed">
                  Sealed-bid auction dApp with React frontend (Week 3
                  homework)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span className="leading-relaxed">
                  Capstone: your own confidential dApp deployed to testnet
                  (Week 4)
                </span>
              </li>
            </ul>
          </div>

          {/* How to Use This Course */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              How to Use This Course
            </h2>
            <ol className="space-y-2 text-text-secondary list-decimal pl-5">
              <li className="leading-relaxed">
                Work through each week&apos;s lessons in order -- they build
                on each other progressively
              </li>
              <li className="leading-relaxed">
                Study the side-by-side code comparisons (CodeDiff) to
                understand the Solidity to FHEVM migration pattern
              </li>
              <li className="leading-relaxed">
                Complete the quizzes at the end of each lesson to test your
                understanding before moving on
              </li>
              <li className="leading-relaxed">
                Complete each week&apos;s homework assignment to solidify
                your skills before advancing
              </li>
              <li className="leading-relaxed">
                If you are an instructor, expand the Instructor Notes in each
                lesson for teaching tips and common student misconceptions
              </li>
            </ol>
          </div>
        </div>

        {/* Week Cards */}
        <div className="space-y-8">
          {curriculum.map((week, index) => {
            const WeekIcon = weekIcons[index]
            const difficulty = difficultyStyles[week.homework.difficulty]

            return (
              <div
                key={week.id}
                className="rounded-xl border border-border bg-card overflow-hidden border-l-4 border-l-primary"
              >
                {/* Week Header */}
                <div className="border-b border-border bg-card/80 px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <WeekIcon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/week/${week.id}`}
                        className="group inline-flex items-center gap-2"
                      >
                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          Week {week.id}: {week.title}
                        </h2>
                        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="mt-1 text-text-secondary leading-relaxed">
                        {week.goal}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Learning Objectives */}
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Learning Objectives
                    </h3>
                    <ul className="space-y-1.5">
                      {week.learningObjectives.map((objective, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-text-secondary"
                        >
                          <Target className="mt-0.5 size-3.5 shrink-0 text-primary/50" />
                          <span className="leading-relaxed">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lessons */}
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Lessons
                    </h3>
                    <div className="space-y-1">
                      {week.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/week/${week.id}/lesson/${lesson.slug}`}
                          className="group flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-mono font-medium text-primary">
                            {lesson.id}
                          </span>
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                            {lesson.title}
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground capitalize">
                            {lesson.type}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Homework */}
                  <div className="border-t border-border pt-4">
                    <Link
                      href={`/week/${week.id}/homework/${week.homework.slug}`}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-background/50 p-4 hover:border-secondary/30 transition-colors"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary/10">
                        <FileCode className="size-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground group-hover:text-secondary transition-colors">
                            HW: {week.homework.title}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${difficulty.bg} ${difficulty.text}`}
                          >
                            {difficulty.label}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {week.homework.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
