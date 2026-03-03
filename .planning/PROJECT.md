# FHE Academy

## What This Is

A 4-week interactive bootcamp platform that teaches Web3 developers how to build confidential smart contracts using Zama's FHEVM. The platform takes developers from zero FHE knowledge to production-ready confidential dApps, following a "Migration Mindset" — teaching FHEVM by showing the transformation from familiar Solidity patterns to their encrypted equivalents. Built as a Zama Bounty Track submission (deadline: March 15, 2026).

## Core Value

Developers can follow a structured, hands-on curriculum that bridges their existing Solidity knowledge to FHEVM — with side-by-side code comparisons, interactive quizzes, and graded homework assignments — on a polished, Zama-branded platform.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 4-week curriculum with 20 lessons covering FHEVM from basics to advanced
- [ ] Next.js 14 web platform with Zama-inspired dark theme (gold/purple accents)
- [ ] Side-by-side CodeDiff component (vanilla Solidity vs FHEVM)
- [ ] Interactive quizzes per lesson (2-3 questions each)
- [ ] "Mark as Complete" progress tracking per lesson
- [ ] Wallet-based auth via thirdweb Connect (content publicly accessible)
- [ ] Supabase backend for cross-device progress sync
- [ ] 4 weekly homework assignments with detailed rubrics
- [ ] AI Grader — copy-paste prompt generator for homework feedback (model-agnostic)
- [ ] Capstone project spec (Week 4)
- [ ] Hardhat monorepo with starter code + solutions per week
- [ ] Inline collapsible instructor notes per lesson
- [ ] Landing page, dashboard, syllabus, week overview, lesson pages
- [ ] Sidebar navigation with week/lesson structure
- [ ] Progress bars (per lesson, per week, overall)

### Out of Scope

- Demo video — will be recorded separately after platform is complete
- Light mode — dark-only, aligned with Zama branding
- Real FHE computation on platform — content is educational, not a live FHE environment
- Mobile app — web-first, responsive design sufficient
- User accounts beyond wallet — no email/password auth
- CMS or MDX — content is hardcoded TSX for full component access

## Context

- **Competition**: Zama Bounty Track submission. Judged on curriculum quality, FHEVM coverage completeness, practicality for real-world use, homework design, clarity/engagement, and production-readiness.
- **Deadline**: March 15, 2026 (12 days from project start)
- **Target audience**: Web3 developers with basic Ethereum/Solidity knowledge, no FHE experience required
- **Content source**: Detailed project plan document serves as the primary content guide. Content will be generated from this document and verified against current Zama documentation.
- **FHEVM domain**: Teaching encrypted types (ebool, euint8-256, eaddress, ebytes), FHE operations (add, sub, mul, select, rand), ACL system (allow/allowThis), encrypted inputs (externalEuint + inputProof/ZKPoK), async decryption via KMS
- **Teaching philosophy**: "Migration Mindset" — every lesson shows the transformation from familiar Solidity to FHEVM equivalent, side-by-side

## Constraints

- **Timeline**: 12 days to competition deadline — must ship both platform and curriculum
- **Tech stack**: Next.js 14 (App Router), Tailwind CSS + shadcn/ui, thirdweb Connect, Supabase, Vercel
- **Design**: Zama-inspired dark theme is critical for jury impression — gold (#F5C518) and purple (#8B5CF6) accents, premium feel
- **Content format**: Hardcoded TSX pages — no MDX, full component access per lesson
- **Accounts**: thirdweb and Supabase accounts need to be created — build with env vars initially
- **FHEVM accuracy**: Content must be verified against current Zama docs (developer is learning FHEVM alongside building)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hardcoded TSX over MDX | Full component access, no MDX build complexity, plan recommendation | — Pending |
| thirdweb + Supabase over simpler auth | Cross-device progress sync, wallet-native for Web3 audience, plan recommendation | — Pending |
| Inline instructor notes (not separate page) | Jury sees notes while reviewing lessons, faster to build, more practical | — Pending |
| AI Grader as copy-paste prompt | No API key dependency, works with any AI model, always available | — Pending |
| Dark mode only | Zama brand alignment, reduces design work, jury expectation | — Pending |
| Use project plan as content source | Detailed curriculum already written, generate and verify against Zama docs | — Pending |

---
*Last updated: 2026-03-03 after initialization*
