# Phase 1: Foundation and FHEVM Research - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Project skeleton (Next.js 15 + Tailwind v4 + shadcn/ui), verified FHEVM v0.9 API reference, Solidity-to-FHEVM transformation reference, and complete curriculum outline. Deployed to Vercel as placeholder. No lesson content, no components, no auth — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### FHEVM Reference Format
- Ship as a reusable content asset — polished cheatsheet that lives on the platform as bonus content (judges see it)
- Also serves as internal source of truth for all 20 lessons in Phase 3
- Must be verified against current v0.9 docs via Context7 and docs.zama.org — no AI-generated FHEVM content without verification
- Covers: all encrypted types, all FHE.* operations, ACL system, encrypted inputs, self-relaying decryption model

### Solidity-to-FHEVM Transformation Reference
- Organized by migration step (sequential): import → types → operations → ACL → inputs → decrypt
- Mirrors how a developer would actually migrate a contract — matches the "Migration Mindset" teaching philosophy
- Each step shows vanilla Solidity on left, FHEVM equivalent on right, with explanation of what changed and why

### Curriculum Outline Depth
- Full outline: title + learning objectives + key code concepts + quiz topic ideas per lesson
- Follow the project plan document closely — it already has detailed lesson breakdowns
- Verify FHEVM API accuracy against current docs; update any outdated references (TFHE.* → FHE.*, Oracle → self-relaying)
- 4 weeks, 20 lessons, 4 homeworks, 1 capstone — structure matches the plan document

### Project Scaffolding
- Package manager: pnpm
- Framework: Next.js 15 (App Router, Turbopack, React 19)
- Styling: Tailwind CSS v4 + shadcn/ui
- All dependency versions pinned exactly in package.json
- Deploy to Vercel on day 1 (even as placeholder)

### Claude's Discretion
- Exact folder structure within app/ (route groups, layout nesting)
- shadcn/ui component selection during init
- .env.example structure and variable naming
- README content for initial commit

</decisions>

<specifics>
## Specific Ideas

- The project plan document at `/Users/0xemrek/Downloads/FHE_Academy___Complete_Project_Plan.md` is the primary content reference — use its lesson structure as the curriculum outline backbone
- FHEVM v0.9 confirmed via Context7: `FHE.fromExternal()`, `FHE.allow()`/`FHE.allowThis()`/`FHE.allowTransient()`, `FHE.select()`, `FHE.makePubliclyDecryptable()` + `@zama-fhe/relayer-sdk` for decryption
- Zama dark theme colors already decided: gold #F5C518, purple #8B5CF6, backgrounds #0A0A0F/#13131A

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, empty repository

### Established Patterns
- None yet — Phase 1 establishes the patterns

### Integration Points
- Vercel deployment (needs NEXT_PUBLIC_THIRDWEB_CLIENT_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY as env vars — values TBD in Phase 4)
- pnpm workspace for future Hardhat monorepo packages (Phase 5)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-fhevm-research*
*Context gathered: 2026-03-03*
