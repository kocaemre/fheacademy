import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  getLesson,
  getWeek,
  getAdjacentLessons,
  getAllLessons,
} from "@/lib/curriculum"
import { LessonLayout } from "@/components/layout/lesson-layout"
import {
  Lesson1_1Content,
  lesson1_1Meta,
} from "@/content/lessons/lesson-1-1"
import {
  Lesson1_2Content,
  lesson1_2Meta,
} from "@/content/lessons/lesson-1-2"
import {
  Lesson1_3Content,
  lesson1_3Meta,
} from "@/content/lessons/lesson-1-3"
import {
  Lesson1_4Content,
  lesson1_4Meta,
} from "@/content/lessons/lesson-1-4"
import {
  Lesson1_5Content,
  lesson1_5Meta,
} from "@/content/lessons/lesson-1-5"

interface LessonPageProps {
  params: Promise<{ weekId: string; lessonId: string }>
}

// Content registry: maps "weekNum-lessonSlug" to content component + meta
const lessonRegistry: Record<
  string,
  {
    Content: React.ComponentType
    objective: string
  }
> = {
  "1-why-privacy-matters": {
    Content: Lesson1_1Content,
    objective: lesson1_1Meta.learningObjective,
  },
  "1-zama-ecosystem-overview": {
    Content: Lesson1_2Content,
    objective: lesson1_2Meta.learningObjective,
  },
  "1-development-environment-setup": {
    Content: Lesson1_3Content,
    objective: lesson1_3Meta.learningObjective,
  },
  "1-your-first-fhevm-contract": {
    Content: Lesson1_4Content,
    objective: lesson1_4Meta.learningObjective,
  },
  "1-testing-encrypted-contracts": {
    Content: Lesson1_5Content,
    objective: lesson1_5Meta.learningObjective,
  },
  // Future lessons will be added here by Plans 03-06
}

export async function generateStaticParams() {
  return getAllLessons().map(({ weekId, lesson }) => ({
    weekId: String(weekId),
    lessonId: lesson.slug,
  }))
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { weekId, lessonId } = await params
  const weekNum = Number(weekId)
  const lesson = getLesson(weekNum, lessonId)
  const week = getWeek(weekNum)

  if (!lesson || !week) return { title: "Lesson Not Found" }

  return {
    title: `${lesson.title} | Week ${week.id} | FHE Academy`,
    description: `Lesson ${lesson.id}: ${lesson.title} - ${week.title}`,
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { weekId, lessonId } = await params
  const weekNum = Number(weekId)

  const lesson = getLesson(weekNum, lessonId)
  const week = getWeek(weekNum)

  if (!lesson || !week) {
    notFound()
  }

  const adjacent = getAdjacentLessons(weekNum, lessonId)

  const key = `${weekNum}-${lessonId}`
  const lessonData = lessonRegistry[key]

  if (lessonData) {
    const { Content, objective } = lessonData
    return (
      <LessonLayout
        weekId={week.id}
        weekTitle={week.title}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        learningObjective={objective}
        prev={adjacent.prev}
        next={adjacent.next}
      >
        <Content />
      </LessonLayout>
    )
  }

  // Fallback placeholder for lessons not yet authored
  return (
    <LessonLayout
      weekId={week.id}
      weekTitle={week.title}
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      learningObjective={`Lesson ${lesson.id} content is a ${lesson.type} lesson. Full content will be added in Phase 3.`}
      prev={adjacent.prev}
      next={adjacent.next}
    >
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Lesson content coming soon.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/60">
          This is a placeholder for{" "}
          <span className="font-medium text-foreground">{lesson.title}</span>{" "}
          ({lesson.type} lesson).
        </p>
      </div>
    </LessonLayout>
  )
}
