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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v0.9 | ~5 | 3 | First milestone — established GSD workflow, content-first strategy |

### Cumulative Quality

| Milestone | Audit Score | Requirements Met | Tech Debt Items |
|-----------|------------|-----------------|-----------------|
| v0.9 | 29/29 | 100% | 4 minor |

### Top Lessons (Verified Across Milestones)

1. Build infrastructure before content — pays back in authoring velocity
2. Research phase for domain-specific work eliminates costly rework
