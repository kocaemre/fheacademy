import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight } from "lucide-react"
import { getWeek, curriculum } from "@/lib/curriculum"

interface VideoPageProps {
  params: Promise<{ weekId: string }>
}

const weekVideos: Record<number, string> = {
  1: "https://zepatrol.xyz/week1.mp4",
  2: "https://zepatrol.xyz/week2.mp4",
  3: "https://zepatrol.xyz/week3.mp4",
  4: "https://zepatrol.xyz/week4.mp4",
}

export async function generateStaticParams() {
  return curriculum.map((week) => ({
    weekId: String(week.id),
  }))
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { weekId } = await params
  const week = getWeek(Number(weekId))
  if (!week) return { title: "Video Not Found" }

  return {
    title: `Week ${week.id} Video | FHE Academy`,
    description: `Video lesson for Week ${week.id}: ${week.title}`,
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { weekId } = await params
  const week = getWeek(Number(weekId))

  if (!week) {
    notFound()
  }

  const videoUrl = weekVideos[week.id]

  if (!videoUrl) {
    notFound()
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href={`/week/${week.id}`}
            className="hover:text-foreground transition-colors"
          >
            Week {week.id}: {week.title}
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="text-foreground">Video</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
          Week {week.id} Video
        </h1>
        <p className="text-muted-foreground mb-8">
          {week.title}
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-black">
          <video
            controls
            preload="metadata"
            className="w-full"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}
