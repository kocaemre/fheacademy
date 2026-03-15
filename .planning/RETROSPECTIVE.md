# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v0.9 — Curriculum MVP

**Shipped:** 2026-03-04
**Phases:** 3 | **Plans:** 10 | **Sessions:** ~5

### What Was Built
- Next.js 15 platform with Tailwind v4, Zama dark theme, deployed to Vercel
- Verified FHEVM v0.9 API reference and Solidity-to-FHEVM migration guide
- Full navigation shell with sidebar, week/lesson routing, content components
- Complete 4-week curriculum: 20 lessons with Migration Mindset code comparisons
- 56 inline quiz questions with explanations across all lessons
- 4 graded homework assignments with rubrics and transformation direction
- Syllabus page with course overview

### What Worked
- Phase-first approach: building infrastructure (Phase 1-2) before content (Phase 3) meant content authoring was fast and consistent
- Content registry pattern enabled parallel-style lesson authoring — each lesson file was self-contained
- Yolo mode with comprehensive research kept velocity high — 10 plans in ~70 minutes of execution time
- Single source of truth (lib/curriculum.ts) eliminated data duplication across routes
- Quality gate in final plan (03-06) with human sign-off caught zero issues — content was clean throughout

### What Was Inefficient
- Phase 2 ROADMAP checkbox not marked complete (cosmetic, caught in audit)
- Two orphaned TSX reference files (fhevm-api-reference.tsx, solidity-to-fhevm-guide.tsx) created during Phase 1 never wired to routes — could have been markdown
- lib/shiki.ts singleton created but never used — components imported shiki directly
- Quiz count documentation said 60, actual was 56 — small doc drift

### Patterns Established
- Content files in `content/lessons/lesson-X-Y.tsx` and `content/homework/homework-X.tsx`
- Quiz ID format: `X.Y-qN` for global uniqueness
- CVA for component variant styling (CalloutBox)
- Homework shows transformation direction via CodeDiff without complete solution
- Shiki vitesse-dark theme as standard code highlighting

### Key Lessons
1. Research phase pays off massively for domain-specific content — FHEVM v0.9 accuracy was verified clean (zero deprecated patterns)
2. Content authoring at ~7min/plan is fast when components are pre-built and patterns are established
3. Audit after content completion is valuable — caught dead code and orphaned files before milestone close
4. Hardcoded TSX over MDX was the right call — full component access enabled rich interactive lessons

### Cost Observations
- Model mix: ~80% opus, ~20% sonnet/haiku (research/verify agents)
- Sessions: ~5 sessions over 2 days
- Notable: Content phase (6 plans) was 3x the plans of other phases but only 2x the time — patterns compound

---

## Milestone: v1.0 — Submission

**Shipped:** 2026-03-15
**Phases:** 2 | **Plans:** 5 | **Sessions:** ~4

### What Was Built
- Wallet-based auth via thirdweb Connect with Supabase cross-device progress sync and localStorage fallback
- Progress tracking: MarkComplete toggles, per-lesson/week/overall progress bars, sidebar indicators
- Landing page with animated gradient hero, 4-week curriculum overview, features showcase, "How FHE Works" diagram, and CTA
- Dashboard with overall/per-week progress cards and Continue Learning smart navigation
- AI Grader copy-paste prompt generator on all 4 homework pages (model-agnostic)
- Hardhat monorepo: 8 independent projects with FHEVM starter/solution contracts for all 4 weeks

### What Worked
- Wave-based parallelization in Phase 5: Plans 01, 02, 03 executed in parallel (~28min wall time for 57min of work)
- Client component island pattern kept server rendering for most pages while enabling interactive progress features
- Structured rubric data in homework files made AI Grader integration clean — typed arrays fed to generic prompt builder
- Research phase caught fhevm 0.6.2 API differences early (no fhevm/hardhat module) — avoided rework during execution
- UAT with browser automation (Chrome extension) gave real visual verification of all features

### What Was Inefficient
- Phase 5 ROADMAP.md plan entries left as "TBD" and never updated with actual plan names
- thirdweb module resolution issue caused build warnings — pre-existing from wallet integration
- Dashboard sidebar click didn't navigate on first try during UAT — may be a client-side navigation issue worth investigating

### Patterns Established
- ProgressProvider → useProgress hook for all progress-aware components
- AI Grader pattern: RubricCriterion[] typed array fed to generic prompt builder component
- Independent Hardhat projects per week (not monorepo workspaces) for student isolation
- SepoliaZamaFHEVMConfig inheritance for FHEVM solution contracts

### Key Lessons
1. Parallel plan execution (3 plans in one wave) dramatically reduces wall clock time — 57min of work in ~28min
2. Browser automation UAT catches visual issues that code-level verification misses (responsive layout, gradient rendering)
3. fhevm package versions change API surface significantly — always research before planning contract work
4. Copy-paste AI Grader (no API keys) is a better UX than API-based grading for a learning platform

### Cost Observations
- Model mix: ~70% opus, ~30% sonnet (planner/checker agents)
- Sessions: ~4 sessions over 11 days (intermittent work)
- Notable: v1.0 had 50% of the plans of v0.9 but similar impact — later phases build on established patterns

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v0.9 | ~5 | 3 | First milestone — established GSD workflow, content-first strategy |
| v1.0 | ~4 | 2 | Parallel plan execution, browser automation UAT, wave-based Phase 5 |

### Cumulative Quality

| Milestone | UAT Score | Requirements Met | Tech Debt Items |
|-----------|-----------|-----------------|-----------------|
| v0.9 | 29/29 audit | 100% | 4 minor |
| v1.0 | 18/18 UAT | 100% (10/10) | 4 minor (carried) + 1 new |

### Top Lessons (Verified Across Milestones)

1. Build infrastructure before content — pays back in authoring velocity (v0.9 + v1.0)
2. Research phase for domain-specific work eliminates costly rework (v0.9 FHEVM, v1.0 fhevm 0.6.2)
3. Parallel execution of independent plans dramatically reduces wall clock time (v1.0 Phase 5)
