# FHE Academy

## What This Is

A 4-week interactive bootcamp platform that teaches Web3 developers how to build confidential smart contracts using Zama's FHEVM. The platform delivers 20 lessons with side-by-side Solidity-to-FHEVM code comparisons ("Migration Mindset"), 56 inline quiz questions, collapsible instructor notes, 4 graded homework assignments with AI-powered grading prompts, wallet-based progress tracking, a Hardhat monorepo with starter/solution contracts, and a polished landing page — all on a Zama-branded dark-themed Next.js 15 platform deployed to Vercel. Submitted for the Zama Bounty Track (March 15, 2026).

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
- ✓ "Mark as Complete" progress tracking per lesson — v1.0
- ✓ Wallet-based auth via thirdweb Connect (content publicly accessible) — v1.0
- ✓ Supabase backend for cross-device progress sync — v1.0
- ✓ Progress bars (per lesson, per week, overall) — v1.0
- ✓ AI Grader copy-paste prompt generator for homework feedback (model-agnostic) — v1.0
- ✓ Hardhat monorepo with starter code + solutions per week — v1.0
- ✓ Landing page with hero section and Zama-branded CTA — v1.0
- ✓ Dashboard showing overall progress and "Continue Learning" button — v1.0
- ✓ Responsive layout — desktop-first with tablet/mobile support — v1.0
- ✓ Visual FHE concept diagrams (How FHE Works: Encrypt → Compute → Decrypt) — v1.0

### Active

(None — all v1.0 requirements shipped)

### Out of Scope

- Demo video — will be recorded separately after platform is complete
- Light mode — dark-only, aligned with Zama branding
- Real FHE computation on platform — content is educational, not a live FHE environment
- Mobile app — web-first, responsive design sufficient
- User accounts beyond wallet — no email/password auth
- CMS or MDX — content is hardcoded TSX for full component access

## Context

- **Competition**: Zama Bounty Track submission. Judged on curriculum quality, FHEVM coverage completeness, practicality for real-world use, homework design, clarity/engagement, and production-readiness.
- **Deadline**: March 15, 2026 (submitted)
- **Target audience**: Web3 developers with basic Ethereum/Solidity knowledge, no FHE experience required
- **Shipped v1.0**: 16,733 LOC TypeScript/TSX/CSS/Solidity across 218+ files. Next.js 15, Tailwind v4, shadcn/ui, Shiki, thirdweb Connect, Supabase, Hardhat + fhevm 0.6.2. Deployed at fheacademy.vercel.app.
- **FHEVM domain**: Teaching encrypted types (ebool, euint8-256, eaddress, ebytes), FHE operations (add, sub, mul, select, rand), ACL system (allow/allowThis), encrypted inputs (externalEuint + inputProof/ZKPoK), async decryption via KMS
- **Teaching philosophy**: "Migration Mindset" — every lesson shows the transformation from familiar Solidity to FHEVM equivalent, side-by-side
- **Tech debt**: 4 minor items from v0.9 (orphaned reference TSX files, dead shiki wrapper, doc discrepancy) + thirdweb peer dep warning for react-native (irrelevant for web)

## Constraints

- **Timeline**: Submitted on deadline (March 15, 2026)
- **Tech stack**: Next.js 15 (App Router), Tailwind v4 + shadcn/ui, thirdweb Connect, Supabase, Hardhat + fhevm 0.6.2, Vercel
- **Design**: Zama-inspired dark theme — gold (#F5C518) and purple (#8B5CF6) accents, premium feel
- **Content format**: Hardcoded TSX pages — no MDX, full component access per lesson
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
| thirdweb + Supabase over simpler auth | Cross-device progress sync, wallet-native for Web3 audience | ✓ Good — seamless wallet connect, localStorage fallback |
| AI Grader as copy-paste prompt | No API key dependency, works with any AI model | ✓ Good — zero friction, works with ChatGPT/Claude/any LLM |
| ProgressProvider wraps outside SidebarProvider | Progress state available to sidebar indicators | ✓ Good — clean data flow |
| Client component island pattern | Server pages needing progress use client islands | ✓ Good — minimal client JS |
| tsconfig excludes hardhat/ | Prevent Next.js build errors from Hardhat config | ✓ Good — clean separation |
| fhevm 0.6.2 direct import pattern | No fhevm/hardhat submodule, contracts import TFHE.sol directly | ✓ Good — all 8 projects compile |
| Week 4 capstone as Confidential Voting | Combines all FHEVM patterns: encrypted state, einput, ACL | ✓ Good — comprehensive capstone |
| Inline instructor notes (not separate page) | Jury sees notes while reviewing lessons | ✓ Good — collapsible accordion per lesson |

---
*Last updated: 2026-03-15 after v1.0 milestone*
