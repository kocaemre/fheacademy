# Project Research Summary

**Project:** FHE Academy
**Domain:** Interactive developer education platform / FHEVM bootcamp (Zama competition submission)
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

FHE Academy is a competition-submission bootcamp platform teaching developers how to build confidential smart contracts using Zama's FHEVM. The recommended approach treats this as a static-content-heavy education site with a thin data layer: lesson content is hardcoded TSX (no CMS, no MDX), while the only dynamic data is user progress persisted to Supabase keyed by wallet address. This architecture is correct for the domain because it maximizes developer velocity, keeps the platform publicly accessible without auth, and keeps the bundle lean by rendering syntax-highlighted code server-side via Shiki. The stack (Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + thirdweb + Supabase) is mature, well-documented, and internally consistent. All dependencies should be version-pinned given the 12-day deadline.

The highest-leverage decision for winning the competition is content depth, not platform feature count. Judges evaluate curriculum quality, FHEVM coverage completeness, and homework design above all else. The recommended approach is content-first: write lesson outlines and key code snippets for all 20 lessons before building more than the shell. The platform shell and reusable components (CodeDiff, Quiz, InstructorNotes) should be built to a "good enough" state in 2-3 days so the remaining 9-10 days can be spent on curriculum authoring. The differentiator is the "Migration Mindset" framing — every lesson is explicitly structured as Solidity pattern to FHEVM equivalent — which no existing FHEVM education resource does systematically.

The dominant risk for this project is FHEVM API staleness. FHEVM was renamed from TFHE to FHE in v0.7 and underwent further breaking changes in v0.9 including a completely new self-relaying decryption model. Most online tutorials and AI training data still reflect the old API. Teaching `TFHE.asEuint8()` or the Oracle-based `FHE.requestDecryption` in a Zama competition is a disqualification-level mistake. Every code example must be verified against the current v0.9 docs at `docs.zama.org/protocol/solidity-guides` before being published. The second major risk is scope creep: the feature list is already ambitious for 12 days, and any unplanned additions directly threaten curriculum completeness.

---

## Key Findings

### Recommended Stack

The stack is built around Next.js 15.5.12 with React 19 and Tailwind v4. Next.js 15 is the correct choice over 14 (lacks Turbopack stable and React 19) and over 16 (too new, Cache Components experimental). Shiki 4 runs as a Server Component for zero-JS syntax highlighting with full Solidity language support — this is the correct choice over Prism.js or react-syntax-highlighter. The CodeDiff component should be a custom implementation using two Shiki-highlighted `<pre>` blocks in CSS Grid, not react-diff-viewer (which computes textual git-style diffs and ships Emotion runtime). thirdweb v5 (unified `thirdweb` package, not deprecated `@thirdweb-dev/react`) handles wallet auth with `ConnectButton`. Supabase v2 with `@supabase/ssr` handles progress persistence. State management is React Context only — no Zustand, no Redux. All versions should be pinned exactly in package.json.

**Core technologies:**
- **Next.js 15.5.12**: App framework — Turbopack default, React 19, App Router, stable for 1+ year
- **React 19.2.4**: UI library — Server Components for zero-JS code blocks, required by Next.js 15
- **Tailwind CSS v4 + shadcn/ui**: Styling — CSS-first config, full component ownership, Radix UI primitives
- **Shiki 4.0.1**: Syntax highlighting — VS Code-grade, Solidity support, zero client JS via Server Components
- **thirdweb 5.119.0**: Wallet auth — unified SDK, `ConnectButton` handles wallet modal, Web3-native
- **@supabase/supabase-js 2.98.0 + @supabase/ssr 0.9.0**: Database — Postgres, SSR-aware, service_role server-side only
- **React Context (built-in)**: State — ~3 pieces of global state, no external state library needed
- **Vercel**: Hosting — zero-config Next.js deployment, preview URLs, free tier sufficient

See `/Users/0xemrek/Desktop/fheacademy/.planning/research/STACK.md` for full rationale and installation commands.

### Expected Features

This is a competition submission first, education platform second. Judges evaluate: curriculum quality, FHEVM coverage completeness, practicality, homework design, clarity/engagement, and production-readiness. The tension is breadth of platform features vs. depth of curriculum content — depth wins.

**Must have (table stakes):**
- Structured 4-week curriculum with ~20 lessons — this IS the product, judges evaluate it first
- Side-by-side CodeDiff (Solidity vs FHEVM) — core "Migration Mindset" visual hook
- Navigation sidebar with week/lesson structure and active state — every bootcamp platform has this
- Inline quizzes per lesson (2-3 questions) — reinforces learning, shows pedagogical rigor
- Weekly homework assignments with rubrics — judges specifically evaluate homework design
- Progress tracking with mark-as-complete per lesson — elevates from static site to platform
- Landing page — first impression for judges, sets tone
- Dark theme with Zama branding (gold #F5C518, purple #8B5CF6) — explicitly required, signals platform is built FOR Zama
- Syntax-highlighted Solidity code blocks — unformatted code is unreadable
- Capstone project specification — proves curriculum completeness

**Should have (competitive differentiators):**
- AI Grader prompt generator — novel, low-complexity, no other FHEVM platform has this
- Dashboard with progress overview and "continue" button — home base for learners
- Week overview pages with learning objectives — professional course design
- Hardhat monorepo with starter code and solutions — goes beyond "read about it" to "build it"
- Instructor notes (collapsible per lesson) — unique for competition, shows pedagogical methodology
- Visual diagrams for FHE concepts (encryption lifecycle, ACL flow) — FHE is abstract, visuals help
- Wallet-based auth with cross-device progress sync — Web3-native, demonstrates real infrastructure

**Defer to post-competition:**
- In-browser code editor / sandbox — massive complexity, Hardhat monorepo achieves similar value
- Video content / recorded lectures — text + code faster to produce, easier for judges to skim
- Leaderboards / gamification — retention mechanics not needed for 4-week competition bootcamp
- Certificate / NFT badge — cool but requires smart contract deployment unrelated to FHEVM teaching
- Discussion forums — link to Zama Discord instead
- Light mode — halves design work, Zama brand is dark-mode

See `/Users/0xemrek/Desktop/fheacademy/.planning/research/FEATURES.md` for full feature dependency graph and MVP prioritization.

### Architecture Approach

The platform is a static-content-heavy site with a thin data layer. Content (lessons, quizzes, specs) is hardcoded TSX — no CMS, no MDX, no runtime content fetching. The only dynamic data is user progress. The architecture uses the Server Components with Client Islands pattern throughout: layout and content render server-side, interactive elements (Quiz, MarkAsComplete, Sidebar, ProgressProvider) are client components. A route group `(academy)/` wraps all bootcamp pages in the sidebar layout without adding URL segments, while the landing page stays outside. The simplified auth flow avoids full SIWE/JWT complexity: thirdweb provides wallet address as identifier, API routes use Supabase service_role server-side (never exposing the key to clients). Curriculum metadata in `lib/curriculum.ts` is the single source of truth for lesson ordering — sidebar, dashboard, and navigation all read from this.

**Major components:**
1. **Root Layout** (`app/layout.tsx`) — HTML shell, ThirdwebProvider, global styles; Server Component
2. **Academy Layout** (`app/(academy)/layout.tsx`) — persistent sidebar + ProgressProvider; Server + Client boundary
3. **Sidebar** (`components/Sidebar.tsx`) — week/lesson tree, active state via usePathname; Client Component
4. **ProgressProvider** (`providers/ProgressProvider.tsx`) — React Context holding progress, sync to Supabase via API routes, localStorage fallback; Client Component
5. **CodeDiff** (`components/CodeDiff.tsx`) — side-by-side Solidity vs FHEVM, custom implementation with two Shiki `<pre>` blocks; Server Component
6. **Quiz** (`components/Quiz.tsx`) — multiple-choice questions, local score tracking; Client Component
7. **API Route: Progress** (`app/api/progress/route.ts`) — GET/POST progress for a wallet address using service_role Supabase client; Server-only
8. **lib/curriculum.ts** — typed metadata for all weeks/lessons, single source of truth for navigation and progress calculation
9. **content/week[N]/lesson[N].tsx** — lesson content as React components, imported by the dynamic route page

See `/Users/0xemrek/Desktop/fheacademy/.planning/research/ARCHITECTURE.md` for full file structure, all data flows, code examples for each pattern, and Supabase schema.

### Critical Pitfalls

1. **Teaching outdated FHEVM API (TFHE vs FHE rename, old decryption model)** — Use ONLY `FHE.*` syntax from `@fhevm/solidity` package targeting v0.9. Never reference `TFHE.*`, `einput`, `SepoliaConfig`, `GatewayCaller`, or `FHE.requestDecryption`. Grep all content before submission. Teach the self-relaying decryption model (`FHE.makePubliclyDecryptable()` + `@zama-fhe/relayer-sdk`) not the deprecated Oracle model.

2. **Building platform before curriculum content exists** — Content-first development is mandatory. Days 1-2: curriculum outline + FHEVM API research + key code snippets for all 20 lessons. Days 3-5: shell + first week of full lessons. Judges evaluate curriculum quality above everything else. A beautiful empty shell loses to a rough platform with complete, accurate content.

3. **Incorrect FHE operation semantics in code examples** — Create a "Solidity-to-FHEVM Transformation" reference sheet before writing any lessons. Key transforms: `if (encryptedBool)` becomes `FHE.select()`, `require()` with encrypted values becomes encrypted conditional logic, encrypted-by-encrypted division is not supported, every encrypted result needs `FHE.allowThis()` or `FHE.allow()` for ACL.

4. **Scope creep destroying the deadline** — MoSCoW from day 1. Must: 20 lessons, working navigation, CodeDiff, basic progress tracking, Zama dark theme, Vercel deployment. Should: quizzes, homework, landing page, wallet auth. Could: AI Grader, Supabase sync, instructor notes, Hardhat monorepo. Won't: anything else. Reserve days 11-12 exclusively for submission prep.

5. **Deploying untested on submission day** — Deploy to Vercel on day 1 or 2 (even a "Coming Soon" page). Set environment variables early. Test production URL on day 10 not day 12. Late submissions are not considered.

See `/Users/0xemrek/Desktop/fheacademy/.planning/research/PITFALLS.md` for 14 pitfalls with detection criteria and phase-specific warnings.

---

## Implications for Roadmap

Based on combined research, the following 5-phase structure is recommended. Phase ordering is driven by three constraints: (1) content is the primary judging criterion and must be developed early, (2) components must exist before content can be authored using them, (3) auth and backend are progressive enhancements on top of working content. The architecture's suggested build order aligns with these constraints.

### Phase 1: Foundation and FHEVM Research (Days 1-2)

**Rationale:** FHEVM API correctness is the #1 risk. Before writing a single line of lesson content or platform code, the developer must have a verified, accurate understanding of v0.9 API surface. This phase also defines the curriculum outline — the skeleton that all subsequent content fills in. Without this foundation, every subsequent phase risks building on wrong assumptions.

**Delivers:**
- FHEVM v0.9 API reference cheatsheet (FHE.* functions, types, operation constraints)
- Verified "Solidity-to-FHEVM Transformation" reference (the conceptual backbone of every lesson)
- Complete curriculum outline: 4 weeks, ~20 lesson titles, key code concepts per lesson, learning objectives
- Project skeleton: Next.js 15 initialized, Vercel connected, env vars configured, shadcn/ui initialized

**Addresses:** Curriculum structure, lesson dependency mapping, tech stack setup
**Avoids:** Pitfall 1 (outdated API), Pitfall 3 (incorrect FHE semantics), Pitfall 14 (late deployment)

### Phase 2: Platform Shell and Core Components (Days 2-4)

**Rationale:** Content authoring needs a home. The lesson page shell, navigation, and reusable components (CodeDiff, Quiz, InstructorNotes) must exist before any lesson can be authored with the real tools. This phase is intentionally narrow — build the minimum component set to unblock content work. Time-box CodeDiff at 4 hours.

**Delivers:**
- Root layout + Academy layout with route group `(academy)/`
- `lib/curriculum.ts` — typed metadata as single source of truth
- Sidebar with week/lesson tree (active state, completion indicators)
- CodeDiff component (two Shiki `<pre>` blocks, CSS Grid, custom highlight colors)
- CodeBlock component (single Shiki-highlighted block, Server Component)
- Quiz component (UI and local state only — no persistence yet)
- InstructorNotes component (collapsible accordion via Radix UI)
- Zama dark theme applied (gold + purple accents, CSS variables)

**Uses:** Next.js 15, Tailwind v4, shadcn/ui, Shiki 4, Radix UI (Accordion, RadioGroup)
**Implements:** Server Components with Client Islands pattern; Route Group for layout isolation; Curriculum metadata as single source of truth
**Avoids:** Pitfall 8 (CodeDiff over-engineering), Anti-Pattern 2 (use client on layouts)

### Phase 3: Content Authoring — Full Curriculum (Days 3-9)

**Rationale:** This is the longest and most critical phase. It starts in parallel with Phase 2 (once the lesson template is defined, content can begin even before all components are complete). All 20 lessons, 4 homework assignments, 4 week overviews, syllabus page, and capstone spec must be written here. This phase determines whether the competition is won or lost. Content-first, platform-second.

**Delivers:**
- Week 1 (5 lessons): FHE foundations — encrypted types, `FHE.asEuintX()`, type coercion, input handles, basic operations
- Week 2 (5 lessons): Core patterns — conditional logic with `FHE.select()`, ACL model, `FHE.allow()`/`FHE.allowThis()`, encrypted transfers, events
- Week 3 (5 lessons): Advanced FHEVM — async decryption self-relaying model, `FHE.makePubliclyDecryptable()`, `@zama-fhe/relayer-sdk`, KMS, gas optimization
- Week 4 (5 lessons): Production patterns — upgrade patterns, testing strategies, capstone project spec, production security
- 4 weekly homework assignments with rubrics (completeness 50-70%, correctness 10-30%, design 0-20%, style 10-20%)
- Inline quizzes per lesson (conceptual, spot-the-bug, transformation questions — not memorization)
- Syllabus page (full curriculum overview)
- Instructor notes per lesson (pedagogical rationale, common mistakes)

**Addresses:** Curriculum quality, FHEVM coverage completeness, homework design, Migration Mindset framing
**Avoids:** Pitfall 1 (API staleness — grep for TFHE. after each lesson), Pitfall 2 (content-last development), Pitfall 3 (incorrect semantics), Pitfall 5 (decryption model mismatch), Pitfall 12 (shallow quiz questions), Pitfall 13 (AI-generated voice)

### Phase 4: Auth, Progress, and Backend (Days 7-9, parallel with Phase 3 tail)

**Rationale:** Auth and backend are progressive enhancements on top of working content. The platform works without wallet auth (all content is public). Wallet auth adds cross-device progress sync — valuable but not critical for judging. Build this in parallel with the final lessons to maximize time. Hard limit: if wallet auth is not working in 4 hours, fall back to localStorage-only and document as future enhancement.

**Delivers:**
- thirdweb `ConnectButton` integration (wallet modal, `useActiveAccount()` hook)
- `ProgressProvider` with React Context (optimistic updates, localStorage fallback)
- Supabase schema (`user_progress` table with wallet_address, lesson_key, completed_at, quiz_score)
- API route `GET/POST /api/progress` (service_role client, wallet address validation)
- `MarkAsComplete` button wired to ProgressProvider
- Progress bars (per-week and overall) reading from ProgressProvider
- Quiz persistence (scores saved to ProgressProvider on submit)

**Uses:** thirdweb 5.119.0, @supabase/supabase-js 2.98.0, @supabase/ssr 0.9.0, React Context
**Implements:** Simplified auth flow (no SIWE/JWT), Optimistic updates with server sync, localStorage offline fallback
**Avoids:** Pitfall 6 (thirdweb time sink — 4-hour limit), Pitfall 7 (Supabase RLS misconfiguration — use service_role server-side), Anti-Pattern 4 (full SIWE overengineering)

### Phase 5: Dashboard, Landing Page, and Polish (Days 9-12)

**Rationale:** Dashboard needs real progress data to be meaningful, so it comes after Phase 4. The landing page is marketing — build it when you know what to market. Polish touches everything and should be last. Reserve days 11-12 for submission prep. AI Grader is low-complexity and high-novelty — include here.

**Delivers:**
- Dashboard (overall progress, week cards, next uncompleted lesson, "Continue Learning" CTA)
- Week overview pages (learning objectives, lesson list, homework preview, week progress bar)
- Landing page (hero, curriculum overview, week structure, Zama-branded CTA, tech stack badges)
- AI Grader prompt generator (template-based, copy-paste output for any AI, no API keys)
- Hardhat monorepo (minimal: Zama template base, one contract skeleton per week with TODOs)
- Visual diagrams for FHE concepts (if time permits — encryption lifecycle, ACL model, decryption flow)
- Final deployment verification, responsive testing (desktop, tablet, mobile)
- README with setup instructions, curriculum overview, architecture decisions, screenshots

**Addresses:** Dashboard, landing page, AI Grader differentiator, Hardhat monorepo, submission polish
**Avoids:** Pitfall 10 (landing page neglect — 3-4 hour timebox), Pitfall 11 (Hardhat complexity — use Zama's template), Pitfall 14 (untested deployment)

### Phase Ordering Rationale

- **FHEVM research must precede content** — Writing even one lesson with wrong API is compounding technical debt across 20 lessons. The investment in a verified API cheatsheet on day 1 pays dividends for 8+ days of content authoring.
- **Components must precede content authoring** — Content in TSX uses custom components. You cannot write a lesson with a CodeDiff block if CodeDiff does not exist. However, the lesson page template can be defined (even as a placeholder) before CodeDiff is fully built, allowing content drafts to begin by day 3.
- **Content (Phase 3) is the longest phase and partially parallelizes with Phase 2** — Once the lesson component API is defined (even if not fully built), content authoring can proceed in a separate workstream.
- **Auth (Phase 4) is a progressive enhancement, not a prerequisite** — The platform works without wallet auth. Building auth after content means the worst-case scenario (auth completely broken) doesn't affect curriculum delivery.
- **Dashboard comes after auth** — The dashboard shows progress data; it's meaningless without the ProgressProvider wired up.

### Research Flags

Phases that will benefit from additional research during implementation:

- **Phase 1 (FHEVM v0.9 API Research):** CRITICAL — needs fresh verification against `docs.zama.org/protocol/solidity-guides` each time a new lesson topic is addressed. AI-generated content about FHEVM is likely stale. Use only official Zama docs.
- **Phase 3, Weeks 3-4 (Decryption and Production Patterns):** HIGH research need — the self-relaying decryption model (`@zama-fhe/relayer-sdk`) is newer and less community-documented. Every decryption lesson needs to be traced step-by-step through the v0.9 migration guide.
- **Phase 4 (thirdweb Integration):** MEDIUM research need — thirdweb v5 API changes frequently (version 5.119.0). Check the thirdweb portal docs at integration time; don't rely on cached blog posts.

Phases with standard patterns (skip additional research):

- **Phase 2 (Next.js / Shiki / shadcn/ui setup):** All well-documented, official docs are current.
- **Phase 4 (Supabase schema and API routes):** Minimal schema, standard Supabase SSR patterns.
- **Phase 5 (Dashboard, Landing Page):** Standard Next.js UI work, no domain-specific research needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry on 2026-03-03. Official docs confirmed for every major technology. Single medium-confidence area: thirdweb v5 (rapid release cadence). |
| Features | MEDIUM-HIGH | Competition judging criteria verified against Zama's published bounty specs. Feature value assessments are informed by competitor analysis (Cyfrin Updraft, ZamaSchool). Some judging weight assignments are inferred from hackathon patterns rather than explicit Zama rubrics. |
| Architecture | HIGH | Next.js App Router patterns are well-documented. Supabase + thirdweb integration approach verified against official examples. The simplified auth (service_role API routes, no SIWE) is a deliberate tradeoff — correct for this use case. |
| Pitfalls | HIGH | FHEVM API pitfalls verified against official v0.9 migration docs and changelog. thirdweb and Supabase pitfalls from documented community issues. Competition/deadline pitfalls from published Zama criteria and hackathon best practices. |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact FHEVM v0.9 code examples not yet written:** The transformation reference sheet (Pitfall 3 prevention) needs to be built in Phase 1. It cannot be researched in advance generically — it requires implementing each pattern against a real Hardhat + FHEVM environment to verify it compiles.
- **thirdweb ConnectButton behavior in Next.js 15:** thirdweb 5.119.0 is the latest version but the API is in rapid flux. The exact import paths and provider setup should be verified against the portal docs at integration time, not assumed from this research.
- **Zama testnet connectivity for homework validation:** The homework assignments should ideally have code that can be run against Zama's testnet. The specific testnet configuration (RPC endpoints, chain ID) for v0.9 is not captured in this research and needs verification during homework design in Phase 3.
- **AI Grader prompt design:** The prompt template for the AI Grader is not yet designed. It needs to include rubric, assignment spec, and grading instructions in a format that works well with Claude/ChatGPT. This can be designed during Phase 5 using the homework rubrics from Phase 3.

---

## Sources

### Primary (HIGH confidence)
- `docs.zama.org/protocol/solidity-guides` — FHEVM v0.9 API, migration guide, operations table
- `docs.zama.org/change-log/release/fhevm-v0.7-july-2025` — TFHE to FHE rename confirmation
- `nextjs.org/blog/next-15` — Next.js 15 stable release and feature rationale
- `ui.shadcn.com/docs/tailwind-v4` — shadcn/ui Tailwind v4 compatibility
- `tailwindcss.com/blog/tailwindcss-v4` — Tailwind v4 stable (Feb 2025)
- `shiki.style/packages/next` — Shiki Next.js Server Components integration
- `supabase.com/docs/guides/auth/server-side/nextjs` — Supabase SSR for Next.js App Router
- `portal.thirdweb.com/react/v5/ConnectButton` — thirdweb v5 ConnectButton API
- `zama.org/post/zama-bounty-program-season-10-create-a-hello-fhevm-tutorial` — official bounty judging criteria
- `github.com/zama-ai/fhevm` — official FHEVM GitHub repository
- npm registry (verified all package versions on 2026-03-03)

### Secondary (MEDIUM confidence)
- `github.com/MadeleineAguil/ZamaSchool` — ZamaSchool competitor analysis (direct inspection)
- `updraft.cyfrin.io/courses` — Cyfrin Updraft platform features (direct inspection)
- `community.zama.org/t/zama-developer-program-december-2025-winners/4127` — Zama judging patterns from December 2025 winners
- `portal.thirdweb.com/connect/auth/integrations/supabase` — thirdweb + Supabase integration
- `supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package` — @supabase/ssr migration guide
- `info.devpost.com/blog/understanding-hackathon-submission-and-judging-criteria` — hackathon judging patterns

### Tertiary (LOW confidence)
- `dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k` — state management tradeoffs (used only to validate React Context choice)
- `www.yogijs.tech/blog/nextjs-project-architecture-app-router` — Next.js architecture patterns (blog post, corroborated by official docs)

---
*Research completed: 2026-03-03*
*Ready for roadmap: yes*
