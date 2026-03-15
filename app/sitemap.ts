import type { MetadataRoute } from "next"
import { curriculum } from "@/lib/curriculum"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fheacademy.vercel.app"

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/syllabus`, lastModified: new Date(), priority: 0.9 },
  ]

  const weekPages = curriculum.flatMap((week) => [
    {
      url: `${baseUrl}/week/${week.id}`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/week/${week.id}/video`,
      lastModified: new Date(),
      priority: 0.7,
    },
    ...week.lessons.map((lesson) => ({
      url: `${baseUrl}/week/${week.id}/lesson/${lesson.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/week/${week.id}/homework/${week.homework.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    },
  ])

  return [...staticPages, ...weekPages]
}
