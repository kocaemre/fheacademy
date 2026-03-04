# FHE Academy

## What This Is

A 4-week interactive bootcamp platform that teaches Web3 developers how to build confidential smart contracts using Zama's FHEVM. The platform delivers 20 lessons with side-by-side Solidity-to-FHEVM code comparisons ("Migration Mindset"), 56 inline quiz questions, collapsible instructor notes, and 4 graded homework assignments — all on a Zama-branded dark-themed Next.js 15 platform deployed to Vercel. Built as a Zama Bounty Track submission (deadline: March 15, 2026).

## Core Value

Developers can follow a structured, hands-on curriculum that bridges their existing Solidity knowledge to FHEVM — with side-by-side code comparisons, interactive quizzes, and graded homework assignments — on a polished, Zama-branded platform.

## Requirements

### Validated

- ✓ 4-week curriculum with 20 lessons covering FHEVM from basics to advanced — v0.9
- ✓ Next.js 15 web platform with Zama-inspired dark theme (gold/purple accents) — v0.9
- ✓ Side-by-side CodeDiff component (vanilla Solidity vs FHEVM) — v0.9
- ✓ Interactive quizzes per lesson (2-3 questions each) — v0.9
- ✓ 4 weekly homework assignments with detailed rubrics — v0.9
- ✓ Capstone project spec (Week 4) — v0.9
- ✓ Inline collapsible instructor notes per lesson — v0.9
- ✓ Syllabus, week overview, lesson pages — v0.9
- ✓ Sidebar navigation with week/lesson structure — v0.9
- ✓ FHEVM v0.9 API accuracy verified (zero deprecated patterns) — v0.9

### Active

- [ ] "Mark as Complete" progress tracking per lesson
- [ ] Wallet-based auth via thirdweb Connect (content publicly accessible)
- [ ] Supabase backend for cross-device progress sync
- [ ] Progress bars (per lesson, per week, overall)
- [ ] AI Grader — copy-paste prompt generator for homework feedback (model-agnostic)
- [ ] Hardhat monorepo with starter code + solutions per week
- [ ] Landing page with hero section and Zama-branded CTA
- [ ] Dashboard showing overall progress and "Continue Learning" button
- [ ] Responsive layout — desktop-first with tablet/mobile support
- [ ] Visual FHE concept diagrams

### Out of Scope

- Demo video — will be recorded separately after platform is complete
- Light mode — dark-only, aligned with Zama branding
- Real FHE computation on platform — content is educational, not a live FHE environment
- Mobile app — web-first, responsive design sufficient
- User accounts beyond wallet — no email/password auth
- CMS or MDX — content is hardcoded TSX for full component access

## Context

- **Competition**: Zama Bounty Track submission. Judged on curriculum quality, FHEVM coverage completeness, practicality for real-world use, homework design, clarity/engagement, and production-readiness.
- **Deadline**: March 15, 2026 (11 days remaining)
- **Target audience**: Web3 developers with basic Ethereum/Solidity knowledge, no FHE experience required
- **Shipped v0.9**: 13,790 LOC TypeScript/TSX/CSS across 113 files. Next.js 15, Tailwind v4, shadcn/ui, Shiki syntax highlighting. Deployed at fheacademy.vercel.app.
- **FHEVM domain**: Teaching encrypted types (ebool, euint8-256, eaddress, ebytes), FHE operations (add, sub, mul, select, rand), ACL system (allow/allowThis), encrypted inputs (externalEuint + inputProof/ZKPoK), async decryption via KMS
- **Teaching philosophy**: "Migration Mindset" — every lesson shows the transformation from familiar Solidity to FHEVM equivalent, side-by-side
- **Tech debt**: 4 minor items — orphaned reference TSX files (2), dead shiki wrapper (1), doc discrepancy (1)

## Constraints

- **Timeline**: 11 days to competition deadline — platform works, need auth + polish
- **Tech stack**: Next.js 15 (App Router), Tailwind v4 + shadcn/ui, thirdweb Connect, Supabase, Vercel
- **Design**: Zama-inspired dark theme is critical for jury impression — gold (#F5C518) and purple (#8B5CF6) accents, premium feel
- **Content format**: Hardcoded TSX pages — no MDX, full component access per lesson
- **Accounts**: thirdweb and Supabase accounts need to be created — build with env vars initially
- **FHEVM accuracy**: Content verified against Zama docs — v0.9 audit passed 29/29

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hardcoded TSX over MDX | Full component access, no MDX build complexity | ✓ Good — enabled rich interactive components in all 20 lessons |
| Tailwind v4 CSS-first config | @theme directive, design tokens in globals.css | ✓ Good — clean theming, Zama brand colors as custom properties |
| Exact dependency pinning | Reproducible builds, no version drift | ✓ Good — zero build issues |
| Shiki vitesse-dark theme | Matches Zama dark brand, VS Code-grade highlighting | ✓ Good — consistent syntax highlighting across all code blocks |
| Content registry pattern | Maps weekNum-lessonSlug to imported components | ✓ Good — extensible lesson dispatching, clean routing |
| Quiz single-attempt model | No retry; incorrect shows correct answer + explanation | ✓ Good — prevents gaming, teaches on failure |
| CVA for component variants | Type-safe variant styling for CalloutBox | ✓ Good — clean 4-variant system (tip/warning/mistake/info) |
| Dark mode only | Zama brand alignment, reduces design work, jury expectation | ✓ Good — halved design work |
| Use project plan as content source | Detailed curriculum already written | ✓ Good — all 20 lessons authored in 2 days |
| thirdweb + Supabase over simpler auth | Cross-device progress sync, wallet-native for Web3 audience | — Pending (Phase 4) |
| AI Grader as copy-paste prompt | No API key dependency, works with any AI model | — Pending (Phase 5) |
| Inline instructor notes (not separate page) | Jury sees notes while reviewing lessons | ✓ Good — collapsible accordion per lesson |

---
*Last updated: 2026-03-04 after v0.9 milestone*
