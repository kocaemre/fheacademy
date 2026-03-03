# Roadmap: FHE Academy

## Overview

FHE Academy ships as a 5-phase build: foundation and FHEVM research first (ensuring API accuracy), then platform shell and reusable components (enabling content authoring), then the full 20-lesson curriculum (the core product judges evaluate), then auth and progress tracking (progressive enhancement), and finally dashboard, landing page, and polish (submission readiness). Content is the primary judging criterion and receives the longest phase. Auth is deliberately late because the platform works without it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation and FHEVM Research** - Project skeleton, verified FHEVM v0.9 reference, curriculum outline
- [ ] **Phase 2: Platform Shell and Core Components** - Layouts, navigation, CodeDiff, Quiz, InstructorNotes, Zama dark theme
- [ ] **Phase 3: Full Curriculum Content** - All 20 lessons, 4 homework assignments, quizzes, instructor notes, syllabus
- [ ] **Phase 4: Auth, Progress, and Backend** - Wallet auth, Supabase progress sync, MarkAsComplete, progress bars
- [ ] **Phase 5: Dashboard, Landing Page, and Polish** - Dashboard, landing page, AI Grader, Hardhat monorepo, responsive polish, deployment

## Phase Details

### Phase 1: Foundation and FHEVM Research
**Goal**: Developer has a verified FHEVM v0.9 reference and a working Next.js 15 project deployed to Vercel, with the full curriculum outline defined
**Depends on**: Nothing (first phase)
**Requirements**: CURR-05, INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Next.js 15 project with App Router, Tailwind v4, and shadcn/ui runs locally and is deployed to Vercel (even as a placeholder page)
  2. A verified FHEVM v0.9 API reference exists covering FHE.* functions, encrypted types, ACL patterns, and self-relaying decryption -- no references to deprecated TFHE.* or Oracle decryption
  3. A "Solidity-to-FHEVM Transformation" reference sheet maps every common Solidity pattern to its FHEVM equivalent
  4. A complete curriculum outline exists with 4 weeks, ~20 lesson titles, key code concepts per lesson, and learning objectives
  5. All dependency versions are pinned exactly in package.json
**Plans**: TBD

Plans:
- [x] 01-01: Next.js 15 scaffold with Tailwind v4 and Vercel deployment
- [x] 01-02: FHEVM reference docs and curriculum outline

### Phase 2: Platform Shell and Core Components
**Goal**: Developers can navigate the full week/lesson structure and all reusable content components (CodeDiff, Quiz, CodeBlock, CalloutBox, InstructorNotes) are built and ready for content authoring
**Depends on**: Phase 1
**Requirements**: PLAT-01, PLAT-05, COMP-01, COMP-02, COMP-03, COMP-04, COMP-06, DSGN-01, DSGN-02
**Success Criteria** (what must be TRUE):
  1. Sidebar shows all 4 weeks with their lessons, highlights the active lesson, and navigates between lessons
  2. CodeDiff component renders side-by-side Solidity vs FHEVM code with Shiki syntax highlighting and labeled panels
  3. Quiz component presents multiple-choice questions, shows correct/incorrect feedback with explanations, and tracks score
  4. Lesson pages render hardcoded TSX content using CodeDiff, CodeBlock, CalloutBox, and InstructorNotes components in a Zama-branded dark theme with gold and purple accents
  5. InstructorNotes renders as a collapsible accordion section within lesson pages
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Full Curriculum Content
**Goal**: The complete 4-week FHEVM curriculum is authored -- 20 lessons with Migration Mindset code comparisons, inline quizzes, instructor notes, 4 homework assignments with rubrics, week overviews, and syllabus
**Depends on**: Phase 2
**Requirements**: CURR-01, CURR-02, CURR-03, CURR-04, CURR-06, CURR-07, CURR-08, CURR-09, CURR-10, HW-01, HW-02, HW-03, HW-04, HW-05, HW-07, PLAT-04
**Success Criteria** (what must be TRUE):
  1. All 20 lessons are accessible and each one shows a Solidity pattern transforming to its FHEVM equivalent via the CodeDiff component (Migration Mindset)
  2. Each lesson contains 2-3 inline quiz questions with correct answers and explanations that test conceptual understanding (not memorization)
  3. Each lesson includes a collapsible instructor notes section with teaching guidance and common mistakes
  4. Week overview pages display learning objectives, a list of lessons for that week, and a homework preview
  5. The syllabus page shows the full 4-week curriculum overview with all weeks and lessons listed
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD
- [ ] 03-04: TBD
- [ ] 03-05: TBD

### Phase 4: Auth, Progress, and Backend
**Goal**: Users can connect their wallet and their lesson completion progress persists across devices via Supabase, with visual progress indicators throughout the platform
**Depends on**: Phase 3
**Requirements**: COMP-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can connect a wallet via thirdweb ConnectButton without blocking access to any content (all lessons remain publicly accessible)
  2. User can mark a lesson as complete and see that completion persist after page reload and across devices (when wallet is connected)
  3. Progress bars show accurate per-lesson, per-week, and overall completion percentages based on marked lessons
  4. Progress works with localStorage fallback when no wallet is connected, and syncs to Supabase when a wallet is connected
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Dashboard, Landing Page, and Polish
**Goal**: The platform has a polished landing page, a functional dashboard, the AI Grader differentiator, the Hardhat monorepo, and is submission-ready with responsive design verified
**Depends on**: Phase 4
**Requirements**: HW-06, PLAT-02, PLAT-03, DSGN-03, DSGN-04, REPO-01, REPO-02, REPO-03
**Success Criteria** (what must be TRUE):
  1. Landing page presents a hero section, curriculum overview, week structure, and a clear call-to-action with Zama branding
  2. Dashboard shows overall progress percentage, per-week progress cards, and a "Continue Learning" button that navigates to the next uncompleted lesson
  3. AI Grader component generates a copy-paste prompt combining rubric and student code that works with any AI model (no API keys required)
  4. Hardhat monorepo contains starter code (with TODOs) and complete solutions for each week, and both starter and solution projects compile
  5. Platform is responsive across desktop, tablet, and mobile viewports with no layout breaks
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and FHEVM Research | 2/2 | Complete | 2026-03-03 |
| 2. Platform Shell and Core Components | 0/2 | Not started | - |
| 3. Full Curriculum Content | 0/5 | Not started | - |
| 4. Auth, Progress, and Backend | 0/2 | Not started | - |
| 5. Dashboard, Landing Page, and Polish | 0/3 | Not started | - |
