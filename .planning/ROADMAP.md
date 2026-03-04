# Roadmap: FHE Academy

## Milestones

- ✅ **v0.9 Curriculum MVP** — Phases 1-3 (shipped 2026-03-04)
- 🚧 **v1.0 Submission** — Phases 4-5 (planned)

## Phases

<details>
<summary>✅ v0.9 Curriculum MVP (Phases 1-3) — SHIPPED 2026-03-04</summary>

- [x] Phase 1: Foundation and FHEVM Research (2/2 plans) — completed 2026-03-03
- [x] Phase 2: Platform Shell and Core Components (2/2 plans) — completed 2026-03-03
- [x] Phase 3: Full Curriculum Content (6/6 plans) — completed 2026-03-04

</details>

### 🚧 v1.0 Submission (In Progress / Planned)

### Phase 4: Auth, Progress, and Backend
**Goal**: Users can connect their wallet and their lesson completion progress persists across devices via Supabase, with visual progress indicators throughout the platform
**Depends on**: Phase 3
**Requirements**: COMP-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can connect a wallet via thirdweb ConnectButton without blocking access to any content (all lessons remain publicly accessible)
  2. User can mark a lesson as complete and see that completion persist after page reload and across devices (when wallet is connected)
  3. Progress bars show accurate per-lesson, per-week, and overall completion percentages based on marked lessons
  4. Progress works with localStorage fallback when no wallet is connected, and syncs to Supabase when a wallet is connected
**Plans**: 2

Plans:
- [x] 04-01: Auth Infrastructure — thirdweb + Supabase setup, ProgressProvider context, API route (Wave 1)
- [x] 04-02: Progress UI Integration — ConnectButton, MarkComplete, progress bars, sidebar indicators (Wave 2)

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

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation and FHEVM Research | v0.9 | 2/2 | Complete | 2026-03-03 |
| 2. Platform Shell and Core Components | v0.9 | 2/2 | Complete | 2026-03-03 |
| 3. Full Curriculum Content | v0.9 | 6/6 | Complete | 2026-03-04 |
| 4. Auth, Progress, and Backend | v1.0 | 2/2 | Complete | 2026-03-04 |
| 5. Dashboard, Landing Page, and Polish | v1.0 | 0/3 | Not started | - |
