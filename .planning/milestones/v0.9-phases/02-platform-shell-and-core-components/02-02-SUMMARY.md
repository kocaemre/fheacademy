---
phase: 02-platform-shell-and-core-components
plan: 02
subsystem: ui
tags: [shiki, quiz, callout, accordion, code-diff, code-block, content-components, cva]

# Dependency graph
requires:
  - phase: 02-platform-shell-and-core-components
    plan: 01
    provides: "Sidebar navigation, lesson layout, Shiki singleton, curriculum data, globals.css theme tokens"
provides:
  - "CodeDiff component for side-by-side Solidity vs FHEVM code comparison with line highlighting"
  - "CodeBlock component for single syntax-highlighted code with copy button"
  - "CopyButton client island for clipboard copy with icon feedback"
  - "Quiz component with single-attempt check, correct/incorrect feedback, explanation"
  - "QuizProvider/QuizScore for lesson-scoped quiz score tracking"
  - "CalloutBox component with 4 semantic variants (tip/warning/mistake/info)"
  - "InstructorNotes collapsible accordion section"
  - "Demo lesson page at /week/1/lesson/your-first-fhevm-contract exercising all 5 components"
affects: [phase-3-curriculum-content]

# Tech tracking
tech-stack:
  added: [shadcn-accordion]
  patterns: [async-server-component-shiki, client-island-pattern, codeToHast-line-highlighting, cva-variant-styling, react-context-quiz-tracking]

key-files:
  created:
    - components/content/code-diff.tsx
    - components/content/code-block.tsx
    - components/content/copy-button.tsx
    - components/content/quiz.tsx
    - components/content/quiz-score.tsx
    - components/content/callout-box.tsx
    - components/content/instructor-notes.tsx
  modified:
    - app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx
    - app/globals.css

key-decisions:
  - "CodeBlock uses Shiki codeToHtml (simple HTML) while CodeDiff uses codeToHast + hast-util-to-jsx-runtime for per-line highlighting control"
  - "Quiz uses single-attempt model with no retry -- incorrect answers immediately reveal correct answer with explanation"
  - "QuizProvider tracks scores via React context, QuizScore badge only shows after all questions answered"
  - "CalloutBox uses CVA for type-safe variant styling with 4 semantic types"
  - "Shiki pre backgrounds overridden to transparent via .shiki-wrapper CSS so theme CSS variables control it"

patterns-established:
  - "Async server components for Shiki code highlighting (zero client JS for syntax coloring)"
  - "Client island pattern: CopyButton and Quiz are 'use client' islands within server-rendered lesson pages"
  - "codeToHast + transformer for line-level CSS class injection (highlighted-line)"
  - "CVA variant pattern for semantic component types (CalloutBox)"
  - "React context for cross-component state sharing within lesson scope (QuizProvider)"

requirements-completed: [COMP-01, COMP-02, COMP-03, COMP-04, COMP-06, DSGN-02]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 2 Plan 02: Content Components Summary

**Five reusable content components (CodeDiff, CodeBlock, Quiz, CalloutBox, InstructorNotes) with Shiki syntax highlighting and a demo lesson page proving integration**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T15:31:41Z
- **Completed:** 2026-03-03T15:35:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Built all 5 content components with clean props APIs ready for Phase 3 content authoring
- CodeDiff renders side-by-side Solidity vs FHEVM panels with gold-tinted highlighted lines on the FHEVM side via Shiki codeToHast transformer
- Quiz supports single-attempt answers with immediate feedback, explanation text, and lesson-scoped score tracking
- Demo lesson at /week/1/lesson/your-first-fhevm-contract exercises all 5 components together in a real lesson context

## Task Commits

Each task was committed atomically:

1. **Task 1: Build CodeDiff, CodeBlock, and CopyButton components with Shiki integration** - `68bdfd9` (feat)
2. **Task 2: Build Quiz, CalloutBox, InstructorNotes components and create demo lesson** - `fb72ce9` (feat)

## Files Created/Modified
- `components/content/code-diff.tsx` - Side-by-side code comparison with Shiki codeToHast + line highlighting
- `components/content/code-block.tsx` - Single syntax-highlighted code block with filename header
- `components/content/copy-button.tsx` - Client island for clipboard copy with Check icon feedback
- `components/content/quiz.tsx` - Interactive multiple-choice quiz with single-attempt behavior
- `components/content/quiz-score.tsx` - QuizProvider context + QuizScore badge component
- `components/content/callout-box.tsx` - Four-variant callout box (tip/warning/mistake/info) with CVA
- `components/content/instructor-notes.tsx` - Collapsible accordion section with BookOpen icon
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx` - Demo lesson for 1.4 with all 5 components, placeholder for rest
- `app/globals.css` - Added .shiki-wrapper CSS for transparent pre backgrounds

## Decisions Made
- Used codeToHtml for CodeBlock (simpler, no line highlights needed) and codeToHast for CodeDiff (per-line control for highlighting)
- Quiz is strictly single-attempt: no retry after submission, incorrect answers immediately reveal the correct answer
- QuizScore badge only appears after all registered questions in a lesson are answered
- Shiki pre background set to transparent via CSS class so theme CSS variables control the background color
- CalloutBox uses CVA for type-safe variant styling rather than manual conditional classes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript lint errors for hast-util-to-jsx-runtime types**
- **Found during:** Task 1 (CodeDiff component)
- **Issue:** `@typescript-eslint/no-explicit-any` lint rule blocked build due to `any` casts on jsx/jsxs functions passed to toJsxRuntime
- **Fix:** Used explicit function type signatures instead of `any` casts
- **Files modified:** components/content/code-diff.tsx
- **Verification:** pnpm build passes with no lint errors
- **Committed in:** 68bdfd9 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed CodeDiff grid layout with divider elements**
- **Found during:** Task 1 (CodeDiff component)
- **Issue:** Separate divider elements were extra grid children that broke the 2-column layout
- **Fix:** Replaced standalone divider elements with border-r on Solidity panel and border-b for mobile stacking
- **Files modified:** components/content/code-diff.tsx
- **Verification:** pnpm build passes, grid renders correctly with 2 children
- **Committed in:** 68bdfd9 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correct build and layout. No scope creep.

## Issues Encountered
None beyond the auto-fixed items above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 content components are production-ready with clean props APIs for Phase 3 content authoring
- Demo lesson proves all components work together in a real lesson context
- Phase 3 can import CodeDiff, CodeBlock, Quiz, CalloutBox, InstructorNotes directly
- All 19 remaining lesson pages have placeholder content ready to be replaced in Phase 3

## Self-Check: PASSED

All 9 files verified present. Both commit hashes (68bdfd9, fb72ce9) found in git log.

---
*Phase: 02-platform-shell-and-core-components*
*Completed: 2026-03-03*
