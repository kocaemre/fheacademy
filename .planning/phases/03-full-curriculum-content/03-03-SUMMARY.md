---
phase: 03-full-curriculum-content
plan: 03
subsystem: curriculum
tags: [nextjs, fhevm, curriculum, lessons, homework, content-authoring, week-2]

# Dependency graph
requires:
  - phase: 03-full-curriculum-content
    plan: 02
    provides: "Week 1 content pattern, homework content file template (homework-1.tsx), quiz ID format, lesson registry"
  - phase: 03-full-curriculum-content
    plan: 01
    provides: "Content registry pattern, lesson content file template (lesson-1-4.tsx)"
  - phase: 02-platform-shell-and-core-components
    provides: "CodeDiff, CodeBlock, Quiz, QuizProvider, QuizScore, CalloutBox, InstructorNotes components"
provides:
  - "Full content for 5 Week 2 lessons (2.1-2.5) with CodeDiff, Quiz, CalloutBox, InstructorNotes"
  - "Week 2 homework page (Confidential ERC-20 Token) with contract skeleton, rubric, and transformation direction"
  - "15 unique quiz questions across 5 Week 2 lessons (3 per lesson, mixing conceptual and code-reading types)"
  - "Complete safe transfer pattern documented as reusable template in Lesson 2.5"
affects: [03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["safe transfer pattern (FHE.ge + FHE.select + ACL) as canonical token transfer template", "contract skeleton with TODO stubs for homework assignments"]

key-files:
  created:
    - "content/lessons/lesson-2-1.tsx"
    - "content/lessons/lesson-2-2.tsx"
    - "content/lessons/lesson-2-3.tsx"
    - "content/lessons/lesson-2-4.tsx"
    - "content/lessons/lesson-2-5.tsx"
    - "content/homework/homework-2.tsx"
  modified:
    - "app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx"
    - "app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx"

key-decisions:
  - "Week 2 homework includes a contract skeleton with TODO stubs (unlike Week 1 which only had starter contract)"
  - "Safe transfer pattern (FHE.ge + FHE.select + ACL) documented as the canonical reusable template in Lesson 2.5"
  - "All 5 Week 2 lessons get 3 quiz questions each (15 total) for deeper assessment vs Week 1"

patterns-established:
  - "Homework contract skeleton pattern: provide function stubs with TODO comments for students to implement"
  - "Safe transfer pattern: FHE.ge check -> FHE.select for both sender/recipient -> FHE.allowThis + FHE.allow for all handles"
  - "Lesson depth scaling: hands-on lessons get 2-3 CodeDiff + 3 quizzes; conceptual lesson (2.5) gets 1 CodeDiff + 3 quizzes"

requirements-completed: [CURR-02, CURR-03, CURR-04, CURR-07, HW-03, HW-07, PLAT-04]

# Metrics
duration: 9min
completed: 2026-03-04
---

# Phase 03 Plan 03: Week 2 Content Summary

**5 Week 2 lessons covering encrypted types, FHE operations, FHE.select paradigm shift, encrypted inputs/ZKPoK, ACL system, and safe transfer patterns, plus Confidential ERC-20 homework with rubric and contract skeleton**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-04T10:34:36Z
- **Completed:** 2026-03-04T10:43:36Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Authored Lesson 2.1 (Encrypted Types Deep Dive) with type catalog CodeBlock, variable declaration CodeDiff, casting CodeDiff, trivial encryption, 3 quizzes
- Authored Lesson 2.2 (Operations on Encrypted Data) with arithmetic CodeDiff, comparison CodeDiff, FHE.select paradigm shift CodeDiff (most important in curriculum), bitwise reference, 3 quizzes
- Authored Lesson 2.3 (Encrypted Inputs and ZKPoK) with single-input CodeDiff, multi-input CodeDiff, client-side TypeScript SDK example, lifecycle diagram, 3 quizzes
- Authored Lesson 2.4 (ACL System) with token transfer ACL CodeDiff, multi-party escrow CodeDiff, complete ACL function reference, 3 quizzes
- Authored Lesson 2.5 (Patterns and Best Practices) with safe/unsafe transfer CodeDiff, complete safe transfer pattern, initialization checks, 5 defensive rules, 3 quizzes
- Created Week 2 homework page (Confidential ERC-20 Token) with contract skeleton, transformation direction CodeDiff, 5-criteria rubric, getting started links
- All 10 Week 2 lesson + homework URLs render full content with zero deprecated FHEVM patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Author Week 2 lesson content (2.1-2.5)** - `b7d2e96` (feat)
2. **Task 2: Author Week 2 homework page (Confidential ERC-20 Token)** - `1727ca0` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `content/lessons/lesson-2-1.tsx` - Encrypted Types Deep Dive: type catalog, casting, trivial encryption, 3 quizzes
- `content/lessons/lesson-2-2.tsx` - Operations on Encrypted Data: arithmetic/comparison/bitwise, FHE.select paradigm shift, 3 quizzes
- `content/lessons/lesson-2-3.tsx` - Encrypted Inputs and ZKPoK: lifecycle, multi-input pattern, client SDK, 3 quizzes
- `content/lessons/lesson-2-4.tsx` - ACL System: transfer flow, multi-party escrow, permission reference, 3 quizzes
- `content/lessons/lesson-2-5.tsx` - Patterns and Best Practices: safe transfer, initialization, 5 rules, 3 quizzes
- `content/homework/homework-2.tsx` - Confidential ERC-20 homework with contract skeleton, rubric, transformation direction
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx` - Added 5 Week 2 lesson imports and registry entries
- `app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx` - Added homework-2 import and registry entry

## Decisions Made
- Week 2 homework includes a contract skeleton with TODO stubs, giving students more scaffolding than Week 1 (which only provided the starter plaintext contract). This matches the increased complexity of the Confidential ERC-20.
- The safe transfer pattern (FHE.ge + FHE.select for sender/recipient + full ACL) is documented as a standalone reusable template in Lesson 2.5, designed to be memorizable.
- All 5 Week 2 lessons get 3 quiz questions each (15 total), up from the 2-3 average in Week 1, reflecting the denser technical material.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 10 lessons (Week 1 + Week 2) now have full content with CodeDiff, Quiz, CalloutBox, and InstructorNotes
- Both Week 1 and Week 2 homework pages are complete with rubrics
- Content registry pattern stable and ready for Week 3-4 content (Plans 04-05)
- Safe transfer pattern established as reusable reference for Week 3+ homework and lessons

## Self-Check: PASSED

All 8 created/modified files verified on disk. Both task commits (b7d2e96, 1727ca0) verified in git log. Build succeeds with all 20 lesson paths + 4 homework pages. Zero deprecated FHEVM patterns. 15 unique quiz IDs confirmed (2.1-q1 through 2.5-q3).

---
*Phase: 03-full-curriculum-content*
*Completed: 2026-03-04*
