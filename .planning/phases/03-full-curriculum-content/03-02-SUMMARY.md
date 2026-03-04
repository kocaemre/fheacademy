---
phase: 03-full-curriculum-content
plan: 02
subsystem: curriculum
tags: [nextjs, fhevm, curriculum, lessons, homework, content-authoring]

# Dependency graph
requires:
  - phase: 03-full-curriculum-content
    plan: 01
    provides: "Content registry pattern, homework route, lesson content file template (lesson-1-4.tsx)"
  - phase: 02-platform-shell-and-core-components
    provides: "CodeDiff, CodeBlock, Quiz, QuizProvider, QuizScore, CalloutBox, InstructorNotes components"
provides:
  - "Full content for 4 Week 1 lessons (1.1, 1.2, 1.3, 1.5) with CodeDiff, Quiz, CalloutBox, InstructorNotes"
  - "Week 1 homework page with starter code, rubric table, transformation direction, and submission guidelines"
  - "11 unique quiz questions across 5 Week 1 lessons (mixing conceptual and code-reading types)"
  - "Homework content registry pattern (content/homework/homework-X.tsx)"
affects: [03-03, 03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["homework content files in content/homework/homework-X.tsx", "quiz ID format: X.Y-qN for lesson X.Y question N"]

key-files:
  created:
    - "content/lessons/lesson-1-1.tsx"
    - "content/lessons/lesson-1-2.tsx"
    - "content/lessons/lesson-1-3.tsx"
    - "content/lessons/lesson-1-5.tsx"
    - "content/homework/homework-1.tsx"
  modified:
    - "app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx"
    - "app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx"

key-decisions:
  - "Homework content extracted to content/homework/homework-X.tsx files (parallel to content/lessons/ pattern)"
  - "Quiz IDs follow X.Y-qN format for global uniqueness across all lessons"
  - "Homework shows transformation direction via CodeDiff but not complete solution"

patterns-established:
  - "Homework content: content/homework/homework-X.tsx exports HomeworkXContent component registered in homeworkContent record"
  - "Quiz ID format: lessonNumber-qSequence (e.g., 1.1-q1, 1.2-q2) for uniqueness across all 20 lessons"
  - "Lesson content depth: conceptual lessons get 1 CodeDiff + CodeBlocks; hands-on lessons get 2+ CodeDiff examples"

requirements-completed: [CURR-02, CURR-03, CURR-04, CURR-06, HW-02, HW-07, PLAT-04]

# Metrics
duration: 7min
completed: 2026-03-04
---

# Phase 03 Plan 02: Week 1 Content Summary

**4 lesson content files (privacy, ecosystem, dev setup, testing) with 11 quizzes and CodeDiff comparisons, plus Temperature Converter homework with rubric and starter code**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-04T10:22:40Z
- **Completed:** 2026-03-04T10:30:25Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Authored Lesson 1.1 (Why Privacy Matters) with ERC-20 vs Confidential ERC-20 CodeDiff, TEE/ZKP/FHE comparison, 3 quiz questions
- Authored Lesson 1.2 (Zama Ecosystem) with contract structure CodeDiff, boilerplate CodeBlock, symbolic execution explanation, 2 quiz questions
- Authored Lesson 1.3 (Dev Environment Setup) with Hardhat config CodeDiff, FHEVM import CodeDiff, project init commands, 2 quiz questions
- Authored Lesson 1.5 (Testing Encrypted Contracts) with standard vs FHEVM test CodeDiff, assertion comparison CodeDiff, complete test example, 2 quiz questions
- Created Week 1 homework page with starter contract, transformation direction hint, 4-criteria rubric table, and submission guidelines
- All 5 Week 1 lessons (1.1-1.5) now render full content at their URLs with zero deprecated FHEVM patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Author Week 1 lesson content (1.1, 1.2, 1.3, 1.5)** - `4ed8607` (feat)
2. **Task 2: Author Week 1 homework page (Temperature Converter Migration)** - `ac609db` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `content/lessons/lesson-1-1.tsx` - Why Privacy Matters: transparency problem, MEV, privacy solution comparison, 3 quizzes
- `content/lessons/lesson-1-2.tsx` - Zama Ecosystem Overview: symbolic execution, KMS, coprocessor model, 2 quizzes
- `content/lessons/lesson-1-3.tsx` - Development Environment Setup: Hardhat config, mock mode, project init, 2 quizzes
- `content/lessons/lesson-1-5.tsx` - Testing Encrypted Contracts: createEncryptedInput, handle trap, complete test suite, 2 quizzes
- `content/homework/homework-1.tsx` - Temperature Converter homework with starter code, rubric, transformation direction
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx` - Added 4 new lesson imports and registry entries
- `app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx` - Added homework-1 import and registry entry

## Decisions Made
- Homework content extracted to `content/homework/homework-X.tsx` files, mirroring the `content/lessons/` pattern for consistency
- Quiz IDs follow `X.Y-qN` format (e.g., `1.1-q1`) to guarantee global uniqueness across all 20 lessons
- Homework shows transformation direction via CodeDiff (function signatures only) but explicitly warns students it is not the full solution
- All FHE.div operations in homework use plaintext divisors only (constant 5), consistent with FHEVM v0.9 API constraints

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 Week 1 lessons have full content with CodeDiff, Quiz, CalloutBox, and InstructorNotes
- Week 1 homework page is complete with rubric and starter code
- Content registry patterns (lesson + homework) established and ready for Week 2-4 content (Plans 03-05)
- Homework content file pattern (`content/homework/homework-X.tsx`) ready for reuse

## Self-Check: PASSED

All 7 created/modified files verified on disk. Both task commits (4ed8607, ac609db) verified in git log. Build succeeds. Zero deprecated FHEVM patterns. 11 unique quiz IDs confirmed.

---
*Phase: 03-full-curriculum-content*
*Completed: 2026-03-04*
