import { curriculum } from "@/lib/curriculum";

/**
 * Generate a deterministic item ID for a lesson or homework.
 * Format: "lesson-{weekId}-{slug}" or "homework-{weekId}-{slug}"
 */
export function getItemId(
  type: "lesson" | "homework",
  weekId: number,
  slug: string
): string {
  return `${type}-${weekId}-${slug}`;
}

/**
 * Get all trackable item IDs for a given week (lessons + homework).
 */
export function getWeekItems(weekId: number): string[] {
  const week = curriculum.find((w) => w.id === weekId);
  if (!week) return [];

  const lessonIds = week.lessons.map((l) =>
    getItemId("lesson", weekId, l.slug)
  );
  const homeworkId = getItemId("homework", weekId, week.homework.slug);

  return [...lessonIds, homeworkId];
}

/**
 * Get the total number of trackable items in a week.
 */
export function getWeekTotal(weekId: number): number {
  return getWeekItems(weekId).length;
}

/**
 * Get all trackable item IDs across the entire curriculum.
 */
export function getAllItems(): string[] {
  return curriculum.flatMap((week) => getWeekItems(week.id));
}

/** Total number of completable items (20 lessons + 4 homeworks). */
export const TOTAL_ITEMS = getAllItems().length;
