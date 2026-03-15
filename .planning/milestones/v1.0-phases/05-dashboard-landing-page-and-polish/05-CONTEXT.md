# Phase 5: Dashboard, Landing Page, and Polish - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

The platform gets a polished landing page, a functional dashboard, the AI Grader prompt generator on homework pages, a Hardhat monorepo with starter code and solutions per week, and responsive design across desktop/tablet/mobile. This makes the platform submission-ready for the Zama Bounty Track (March 15 deadline).

</domain>

<decisions>
## Implementation Decisions

### Landing Page Design
- Goal: both jury impression AND student onboarding — premium showcase that works as a real course landing
- Sections: Hero + 4-week curriculum overview + features section (code comparisons, quizzes, AI Grader, progress tracking) + CTA
- Hero: bold headline with subtle animation (animated gradient or particle effect in background), Zama dark theme with gold/purple accents
- CTA: single "Start Learning" button linking to first lesson — no wallet connect on landing page
- Landing page is root (/) with no sidebar — full-width marketing layout

### Dashboard Layout
- Dedicated /dashboard route inside the (academy) layout with sidebar
- "Continue Learning" button navigates to the next uncompleted lesson in curriculum order; if all complete, show congratulations state
- Per-week progress: 4 cards in a grid, each with week title, progress bar, fraction (e.g., "4/6"), and week goal — uses existing ProgressBar component
- Accessible without wallet — shows localStorage progress for anonymous users, Supabase progress for connected users

### AI Grader UX
- Lives on each homework page, below the rubric — no separate tool page
- Flow: paste code textarea → "Generate Grading Prompt" button → readonly output area with "Copy to Clipboard" button
- Generated prompt includes: homework rubric criteria + student's pasted code + grading instructions (e.g., "Grade against rubric, state pass/fail per criterion with explanation")
- Collapsed by default (collapsible section like instructor notes) — students expand when needed

### Hardhat Monorepo Structure
- Subdirectory in same repo (e.g., /hardhat or /contracts folder)
- Per-week organization: hardhat/week-N/starter/ and hardhat/week-N/solution/
- Starter code compiles with TODO placeholders (stub functions that compile but don't pass tests); solution code is the completed version
- Uses fhevm-hardhat-plugin with mock mode for local testing — no real FHE network dependency

### Responsive Design
- Full responsive: desktop (1280px+), tablet (768px-1279px), phone (375px+)
- Mobile sidebar: sheet overlay (hamburger menu opens slide-over sheet) — leverages existing shadcn sidebar Sheet component
- CodeDiff: two-pane layout stacks vertically on mobile (Solidity on top, FHEVM below); code blocks scroll horizontally
- Landing page: all sections stack vertically on mobile — week cards go from grid to single column, nothing hidden

### Navigation & Routing
- Landing page at / (no sidebar, full-width) → "Start Learning" enters (academy) layout with sidebar
- Sidebar header: "FHE Academy" title links back to landing page (/); "Dashboard" link also in sidebar header
- Homework pages accessible from both sidebar (last item under each week with completion icon) and week overview pages

### Claude's Discretion
- Landing page animation implementation (gradient, particles, etc.)
- Dashboard card styling details
- AI Grader prompt engineering (exact wording of grading instructions)
- Hardhat project configuration details (package.json, tsconfig, etc.)
- Responsive breakpoint fine-tuning
- Loading states and transitions

</decisions>

<specifics>
## Specific Ideas

- Landing page should balance jury impression with real student usability — not just a marketing page
- Hero animation should be subtle, not distracting — enhances premium feel
- AI Grader is model-agnostic by design — generated prompt works with any AI (ChatGPT, Claude, etc.)
- Hardhat mock mode matches Week 1 Lesson 3 curriculum content — students learn the same setup they use
- "Continue Learning" provides a smart default — users don't have to remember where they left off

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/progress-bar.tsx`: Reusable for dashboard week cards and any progress display
- `components/ui/mark-complete.tsx`: Already wired for all 24 items — dashboard reads same progress state
- `components/providers/progress-provider.tsx`: useProgress() hook provides completedItems, isComplete, toggleComplete
- `lib/progress.ts`: getItemId, getWeekItems, getAllItems, TOTAL_ITEMS utilities
- `components/ui/accordion.tsx`: Can be used for AI Grader collapsible section (same pattern as instructor notes)
- `components/ui/skeleton.tsx`: Loading states for dashboard data
- `components/ui/sheet.tsx`: Already imported by sidebar — used for mobile sheet overlay
- `lib/curriculum.ts`: Week/Lesson/Homework types and data — curriculum overview for landing page

### Established Patterns
- Tailwind v4 with CSS custom properties for theming (globals.css) — Zama brand colors as custom props
- shadcn/ui component library (radix primitives) — consistent UI system
- Server components by default, "use client" only where needed
- Content registry pattern for lesson pages
- Client component island pattern for server pages needing progress data (from Phase 4)
- CVA for component variants (CalloutBox)

### Integration Points
- `app/page.tsx`: Current minimal placeholder — needs full landing page redesign
- `app/(academy)/layout.tsx`: Academy layout with sidebar — dashboard route goes inside this
- `components/layout/app-sidebar.tsx`: Needs Dashboard link in header, homework items per week
- Homework pages (week/[weekId]/homework/[homeworkId]): Need AI Grader section
- New /hardhat directory at project root for monorepo

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-dashboard-landing-page-and-polish*
*Context gathered: 2026-03-04*
