---
phase: 03-full-curriculum-content
plan: 01
subsystem: curriculum
tags: [nextjs, curriculum, routing, content-architecture, fhevm]

# Dependency graph
requires:
  - phase: 02-platform-shell-and-core-components
    provides: "Lesson layout, sidebar, content components (CodeDiff, Quiz, CalloutBox, etc.)"
provides:
  - "Extended curriculum data model with learningObjectives, homework descriptions, deliverables, difficulty"
  - "Content registry pattern for lesson route handler dispatching"
  - "Homework route with generateStaticParams for all 4 homework pages"
  - "Syllabus page with full 4-week overview"
  - "Enriched week overview with narrative intro, learning objectives, homework mini spec card"
  - "Extracted lesson 1.4 content file as template for all future lessons"
  - "getAllHomeworks() helper function"
affects: [03-02, 03-03, 03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["content registry pattern for lesson/homework dispatching", "extracted content files in content/lessons/"]

key-files:
  created:
    - "content/lessons/lesson-1-4.tsx"
    - "app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx"
    - "app/(academy)/syllabus/page.tsx"
  modified:
    - "lib/curriculum.ts"
    - "app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx"
    - "app/(academy)/week/[weekId]/page.tsx"
    - "components/layout/app-sidebar.tsx"

key-decisions:
  - "Content registry pattern maps weekNum-lessonSlug keys to imported content components for extensible lesson dispatching"
  - "Homework skeleton renders from enriched curriculum.ts data when content not yet authored"
  - "Syllabus placed in (academy) layout group to share sidebar navigation"

patterns-established:
  - "Content registry: lessonRegistry record maps 'weekNum-slug' to {Content, objective} for lesson route dispatching"
  - "Content extraction: lesson content lives in content/lessons/lesson-X-Y.tsx, exports ContentComponent + meta object"
  - "Homework content: homeworkContent record maps 'weekId-slug' to content component, falls back to skeleton"
  - "Difficulty badges: bg-success/10 text-success for beginner, bg-warning/10 text-warning for intermediate, bg-error/10 text-error for advanced"

requirements-completed: [CURR-01, CURR-10, HW-01, PLAT-04]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 03 Plan 01: Content Architecture Summary

**Content registry pattern for 20 lessons, homework and syllabus routes, enriched curriculum data model with learning objectives and homework specs**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04T10:15:09Z
- **Completed:** 2026-03-04T10:19:50Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Extended curriculum.ts with learningObjectives per week and enriched Homework type (description, deliverables, difficulty)
- Extracted lesson 1.4 content to content/lessons/lesson-1-4.tsx and refactored lesson route to use content registry pattern
- Created homework route with generateStaticParams rendering skeleton pages from curriculum data
- Created syllabus page with full course overview, prerequisites, and linked 4-week curriculum
- Enriched week overview pages with narrative intros, learning objectives, and homework mini spec cards
- Added syllabus link to sidebar header

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend curriculum data model and extract lesson 1.4** - `0d84d24` (feat)
2. **Task 2: Refactor route handler, create homework route, syllabus page, enrich week overview, add sidebar syllabus link** - `db4cd42` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `lib/curriculum.ts` - Extended Homework/Week interfaces, added learningObjectives, homework enrichment, getAllHomeworks()
- `content/lessons/lesson-1-4.tsx` - Extracted lesson 1.4 content component and meta
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx` - Refactored to content registry pattern
- `app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx` - New homework route with generateStaticParams
- `app/(academy)/syllabus/page.tsx` - New syllabus page with 4-week curriculum overview
- `app/(academy)/week/[weekId]/page.tsx` - Enriched with narrative, learning objectives, homework mini spec card
- `components/layout/app-sidebar.tsx` - Added syllabus link in header

## Decisions Made
- Content registry pattern maps `{weekNum}-{lessonSlug}` keys to imported content components -- extensible for Plans 02-05
- Homework skeleton renders from enriched curriculum.ts data when content not yet authored, allowing immediate navigation
- Syllabus placed in (academy) layout group to share sidebar navigation
- Difficulty badge color mapping: success (beginner), warning (intermediate), error (advanced)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Content registry pattern ready for Plans 02-05 to add lesson imports
- Homework content mapping ready for Plans 02-05 to add homework content
- All 20 lesson placeholders render correctly with "coming soon" message
- All 4 homework skeleton pages accessible with curriculum data
- Syllabus provides navigation hub for entire curriculum

## Self-Check: PASSED

All 7 created/modified files verified on disk. Both task commits (0d84d24, db4cd42) verified in git log.

---
*Phase: 03-full-curriculum-content*
*Completed: 2026-03-04*
