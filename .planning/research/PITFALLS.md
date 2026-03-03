# Domain Pitfalls

**Domain:** FHEVM Developer Education Platform (Competition Submission)
**Researched:** 2026-03-03
**Context:** 4-week bootcamp platform, 12-day build deadline, Zama competition submission

---

## Critical Pitfalls

Mistakes that cause rewrites, disqualification, or major time waste.

### Pitfall 1: Teaching Outdated FHEVM API (TFHE vs FHE Library Rename)

**What goes wrong:** The FHEVM library was renamed from `TFHE` to `FHE` in v0.7 (July 2025), and v0.9 introduced further breaking changes including removal of the Oracle-based decryption, removal of `ebytesXXX` types, replacement of `einput` with `externalEuintXXX`/`externalEbool`/`externalEaddress`, and renaming of `SepoliaConfig` to `ZamaEthereumConfig`. Most tutorials, blog posts, and even some Zama documentation still reference `TFHE.asEuint8()` instead of `FHE.asEuint8()`. Teaching the old API means every code example in the curriculum is wrong.

**Why it happens:** The developer building the curriculum is learning FHEVM while building. They will encounter old blog posts, cached documentation, and stale examples that use `TFHE.*` syntax. The `fhevm` npm package itself is deprecated in favor of `@fhevm/solidity`. Google results heavily favor older content.

**Consequences:** Judges from Zama will immediately recognize outdated API usage. This signals the creator did not use current documentation. All 20 lessons, homework assignments, and code examples become invalid. Students following the curriculum would hit compilation errors on current FHEVM. This is a disqualification-level mistake for a Zama competition.

**Prevention:**
- Pin to the EXACT version documented at `docs.zama.org/protocol/solidity-guides` (currently v0.9)
- Use ONLY `FHE.*` syntax in all code examples, never `TFHE.*`
- Use `@fhevm/solidity` package, not the deprecated `fhevm` package
- Cross-reference every code snippet against the v0.9 migration guide at `docs.zama.org/protocol/solidity-guides/development-guide/migration`
- Create a version reference card in the first lesson that explicitly states the target FHEVM version
- Search-and-replace audit before submission: grep for `TFHE.` across all content

**Detection:** Search all lesson content for `TFHE.`, `einput`, `SepoliaConfig`, `GatewayCaller`, `ebytes64`, `ebytes128`, `ebytes256`, `requestDecryption` (the old Oracle-based version). Any hit means outdated content.

**Phase relevance:** Content creation phase -- must be enforced from the first line of the first lesson. Create a "FHEVM API Reference" constants file that all lessons import from.

**Confidence:** HIGH -- Verified against official Zama migration docs.

---

### Pitfall 2: Building Platform Before Curriculum Content Exists

**What goes wrong:** Developers instinctively start with the platform (Next.js setup, components, navigation, design system) because it feels productive and familiar. Days 1-6 go toward building a beautiful shell. Days 7-12 are a panicked rush to write 20 lessons of technically accurate FHEVM content. The result: a polished platform with thin, inaccurate, or incomplete curriculum. Judges see through this instantly.

**Why it happens:** Platform work is comfortable -- it is standard Next.js/React development. Writing accurate FHEVM educational content requires deep research into an unfamiliar domain. The developer avoids the harder work until deadline pressure forces it.

**Consequences:** Curriculum quality is THE primary judging criterion for Zama education bounties. Per Zama's published criteria, submissions are evaluated on: (1) educational clarity, (2) completeness of workflow coverage, (3) effectiveness at onboarding developers, (4) creativity. A gorgeous platform with shallow content loses to an ugly platform with excellent content. The Zama December 2025 winners were evaluated on "quality of submissions" and "clear, proven human effort."

**Prevention:**
- Content-first development: Write lesson outlines and key code examples BEFORE building platform components
- Days 1-2: Curriculum outline + FHEVM API research + key code snippets for all 20 lessons
- Days 3-5: Platform skeleton + first week of full lessons
- Days 6-9: Remaining lessons + homework assignments
- Days 10-12: Polish, integration, testing, demo prep
- Each lesson's code examples must compile against a reference Hardhat project BEFORE being placed in the platform

**Detection:** By day 4, if fewer than 5 lessons have written content (even rough), the project is platform-heavy and content-light. Course-correct immediately.

**Phase relevance:** Project planning and phase ordering. Content creation must be Phase 1 or parallel with Phase 1 infrastructure.

**Confidence:** HIGH -- Based on Zama's published judging criteria and hackathon best practices.

---

### Pitfall 3: Incorrect FHE Operation Semantics in Code Examples

**What goes wrong:** Code examples teach FHE operations incorrectly -- using `if` statements with encrypted booleans, attempting encrypted division by encrypted values, not handling overflow, missing ACL permissions, or showing `require()` with encrypted values. Students learn broken patterns. Judges catch the errors.

**Why it happens:** The developer's Solidity instincts carry over. In normal Solidity, you write `if (balance > threshold)` and `require(msg.sender == owner)`. In FHEVM, comparisons return `ebool` (not `bool`), so you must use `FHE.select()` instead of `if`. Division only works with plaintext divisors. Every `require()` with an encrypted value must be replaced with encrypted conditional logic. These are non-obvious to someone learning FHEVM.

**Consequences:** The entire "Migration Mindset" teaching philosophy depends on showing correct transformations from Solidity to FHEVM. If the FHEVM side of the side-by-side comparison is wrong, the educational value is negative -- students learn anti-patterns. This contradicts the core value proposition of the bootcamp.

**Prevention:**
- Create a "Common Solidity-to-FHEVM Transformation" reference sheet BEFORE writing lessons:
  - `if (encryptedBool)` becomes `FHE.select(encryptedBool, valueIfTrue, valueIfFalse)`
  - `require(condition)` becomes encrypted conditional logic with `FHE.select`
  - `a / b` (both encrypted) is NOT SUPPORTED -- must use plaintext divisor
  - Every encrypted result needs `FHE.allowThis()` or `FHE.allow()` for ACL
  - `FHE.randEuintX()` for on-chain randomness (not block.timestamp tricks)
- Validate all code examples against the operations table at `docs.zama.org/protocol/solidity-guides/smart-contract/operations`
- Specifically call out shift modulo behavior (shifting 64-bit value by 70 = shifting by 6)
- Explicitly teach overflow risks in FHE arithmetic

**Detection:** Review each code example for: bare `if` with encrypted types, `require()` with encrypted values, encrypted-by-encrypted division, missing `FHE.allow`/`FHE.allowThis` calls after operations.

**Phase relevance:** Content creation phase. The transformation reference sheet must exist before any lesson content is written.

**Confidence:** HIGH -- Verified against official Zama operations documentation.

---

### Pitfall 4: Scope Creep Destroying the Deadline

**What goes wrong:** With 12 days and a requirement for both a polished platform AND complete 4-week curriculum, any feature that was not in the original plan is a direct threat to shipping. Adding "just one more" interactive feature, refactoring the component library, or perfecting animations burns irreplaceable hours.

**Why it happens:** The requirements list is already ambitious: 20 lessons, quizzes, homework, AI grader, progress tracking, wallet auth, Supabase backend, Hardhat monorepo, landing page, dashboard, multiple page types, sidebar navigation, progress bars, instructor notes, and a CodeDiff component. Each of these has subfeatures. The developer sees a "quick improvement" and does not account for testing/integration time.

**Consequences:** Incomplete submission. Missing lessons, broken features, untested flows. Zama explicitly states "late submissions will not be considered." An 80% complete polished submission beats a 60% complete perfect submission.

**Prevention:**
- Ruthless MoSCoW prioritization from day 1:
  - **Must have:** 20 lessons with accurate content, working navigation, CodeDiff component, basic progress tracking, Zama-branded dark theme, deployable on Vercel
  - **Should have:** Quizzes, homework assignments, landing page, wallet auth
  - **Could have:** AI Grader, Supabase cross-device sync, instructor notes, Hardhat monorepo
  - **Won't have (defer post-competition):** Anything not listed above
- Daily check: "Is this task on the Must Have list? If not, stop."
- Reserve days 11-12 exclusively for submission prep: final testing, README, demo video prep, deployment verification
- Build features in vertical slices (one complete lesson flow end-to-end) before horizontal layers (all quizzes for all lessons)

**Detection:** If by day 6 you are still working on infrastructure/design and have not written at least 10 lessons of content, you are behind. If by day 9 all 20 lessons are not at least in draft form, cut scope immediately.

**Phase relevance:** Every phase. This is a project-wide discipline issue.

**Confidence:** HIGH -- Universal hackathon/competition wisdom, reinforced by the specific project scope.

---

### Pitfall 5: Decryption Workflow Teaching Mismatch

**What goes wrong:** FHEVM v0.9 fundamentally changed how decryption works. The old Oracle-based approach (`FHE.requestDecryption`) is discontinued. The new model is "self-relaying" where the dApp client fetches the proof off-chain and submits it back on-chain via `FHE.verifySignatures()` using `@zama-fhe/relayer-sdk`. Teaching the old Oracle model means the most critical part of the curriculum -- how to actually read encrypted data -- is completely wrong.

**Why it happens:** Most existing FHEVM tutorials and examples online were written for v0.6 or v0.7 which used the Oracle model. The developer, searching for examples and tutorials to learn from, will find predominantly old content. The v0.9 self-relaying model is newer and less documented in community content.

**Consequences:** Decryption is arguably the most confusing and important topic in FHEVM development. If the bootcamp teaches the wrong decryption model, graduates cannot build working dApps. Zama judges will recognize the Oracle approach as deprecated. This undermines the entire Week 3-4 advanced content.

**Prevention:**
- Read the v0.9 migration guide FIRST: `docs.zama.org/protocol/solidity-guides/development-guide/migration`
- Verify every decryption-related lesson against v0.9 docs specifically
- Teach the self-relaying model: `FHE.makePubliclyDecryptable()` on-chain, `publicDecrypt` from `@zama-fhe/relayer-sdk` off-chain, `FHE.checkSignatures()` for verification
- Do NOT reference: `GatewayCaller`, `FHE.requestDecryption`, `FHE.loadRequestedHandles`, `FHE.requestDecryptionWithoutSavingHandles`
- Explicitly teach WHY the model changed (decentralization, removing Oracle dependency) as this is good educational content

**Detection:** Grep content for `GatewayCaller`, `requestDecryption`, `Oracle`, `loadRequestedHandles`. Any occurrence in lesson content (outside of a "historical context" note) means outdated content.

**Phase relevance:** Weeks 2-4 content creation. Must be verified before writing any decryption-related lessons.

**Confidence:** HIGH -- Verified against official v0.9 migration documentation.

---

## Moderate Pitfalls

### Pitfall 6: thirdweb Wallet Integration Becoming a Time Sink

**What goes wrong:** thirdweb's wallet SDKs have known issues with auto-connect failures, specific wallet compatibility problems (Trust Wallet, WalletConnect on mobile), and version churn. Debugging wallet connection issues on a tight deadline is a black hole.

**Prevention:**
- Wallet auth is a "Should Have," not a "Must Have" for the competition
- Build the entire platform with content publicly accessible first (as specified in PROJECT.md)
- Add wallet auth as a progressive enhancement for progress tracking only
- If wallet integration takes more than 4 hours total, use localStorage progress tracking instead and document wallet auth as a "future enhancement"
- Use thirdweb's ConnectButton component directly rather than custom hooks -- it handles edge cases better
- Test with MetaMask only; do not chase multi-wallet compatibility

**Detection:** If wallet auth is not working after day 8, abandon it and use localStorage.

**Phase relevance:** Platform integration phase (late). Should be one of the last features added.

**Confidence:** MEDIUM -- Based on reported thirdweb issues; the specific version at competition time may have fixes.

---

### Pitfall 7: Supabase RLS Misconfiguration Leaking or Blocking Data

**What goes wrong:** Supabase Row Level Security (RLS) has well-documented gotchas: enabling RLS without policies silently returns empty results (no error), testing in SQL Editor bypasses RLS (giving false confidence), and wallet-address-based auth requires custom JWT handling that Supabase does not natively support.

**Prevention:**
- RLS is needed only for progress tracking -- this is not sensitive data
- Use the simplest possible schema: `wallet_address TEXT, lesson_id TEXT, completed BOOLEAN, completed_at TIMESTAMP`
- Enable RLS with a simple policy: users can only read/write rows matching their wallet address
- Test with the Supabase client library (not SQL Editor) to verify RLS works correctly
- If Supabase setup takes more than 3 hours, fall back to localStorage with export/import JSON
- Consider: progress tracking via localStorage is sufficient for a competition demo

**Detection:** If Supabase is not returning data in the client app but works in the SQL Editor, RLS policies are misconfigured.

**Phase relevance:** Backend integration phase. Should be attempted only after core platform and content are complete.

**Confidence:** MEDIUM -- Supabase RLS pitfalls are well-documented; wallet-based auth is non-standard.

---

### Pitfall 8: CodeDiff Component Becoming Over-Engineered

**What goes wrong:** The side-by-side CodeDiff component (vanilla Solidity vs FHEVM) is central to the "Migration Mindset" teaching philosophy. The temptation is to build a full syntax-highlighted, line-linked, animated diff viewer. This takes days when a simple side-by-side pre-formatted code block takes hours.

**Prevention:**
- V1: Two `<pre>` blocks side by side with basic syntax highlighting (use a library like `prism-react-renderer` or `shiki`)
- Highlighting the changed lines (FHEVM additions) with a background color is sufficient
- Do NOT build: line linking, animated transitions, collapsible sections, or inline annotations in V1
- The content quality of the code comparison matters more than the visual polish of the component
- Allocate maximum 4 hours for the CodeDiff component

**Detection:** If you are still building/refining CodeDiff after 4 hours, ship what you have and move to content.

**Phase relevance:** Component building phase (early). Build once, use everywhere.

**Confidence:** HIGH -- Standard engineering scope management.

---

### Pitfall 9: Not Verifying Content Against Current Zama Docs

**What goes wrong:** The project plan document serves as the primary content guide, but the plan may have been written against an older FHEVM version. Content generated from the plan without verification against current docs will contain inaccuracies. Additionally, the developer is using AI to help generate content, and AI training data is stale relative to FHEVM's rapid version changes.

**Prevention:**
- Treat the project plan as a STRUCTURE guide, not a CONTENT source
- Every technical claim must be verified against `docs.zama.org/protocol/solidity-guides` (the current docs)
- For each lesson, verify: (1) correct function signatures, (2) correct type names, (3) correct import paths, (4) correct configuration names
- Keep a browser tab permanently open to the Zama docs operations page
- After writing each lesson, do a "doc check" pass: verify every `FHE.*` call exists in the current API

**Detection:** Create a checklist of FHEVM API functions used in each lesson. Cross-reference against the official operations table. Any function not in the table is suspect.

**Phase relevance:** Content creation phase -- every lesson.

**Confidence:** HIGH -- The developer explicitly stated they are learning FHEVM while building.

---

### Pitfall 10: Landing Page and First Impression Neglect

**What goes wrong:** Judges review many submissions. The landing page is the first thing they see. If it looks like a default Next.js template or lacks the Zama brand identity, judges may not engage deeply with the content. Conversely, spending too long on the landing page steals time from content.

**Prevention:**
- Allocate exactly 3-4 hours for the landing page
- Must include: Zama-inspired dark theme, gold (#F5C518) and purple (#8B5CF6) accents, clear value proposition ("4-week FHEVM bootcamp"), curriculum overview, and a prominent "Start Learning" CTA
- Use shadcn/ui components with Tailwind theme customization -- do not design from scratch
- The landing page should convey: professional quality, Zama alignment, and immediately show curriculum structure
- Include a visible "Week 1 / Week 2 / Week 3 / Week 4" overview on the landing page so judges can see curriculum scope at a glance

**Detection:** If the landing page does not clearly communicate "this is a 4-week FHEVM bootcamp with 20 lessons" within 5 seconds of viewing, it needs revision.

**Phase relevance:** Platform polish phase (day 10-11). Build it after content and core navigation work.

**Confidence:** MEDIUM -- Based on hackathon judging best practices from Devpost.

---

## Minor Pitfalls

### Pitfall 11: Hardhat Monorepo Complexity

**What goes wrong:** Setting up a Hardhat monorepo with starter code and solutions for each week adds significant complexity. Hardhat configuration with FHEVM requires specific plugins (`@fhevm/hardhat-plugin`), network configuration, and mock setup for testing. This can consume an entire day.

**Prevention:**
- Use Zama's official Hardhat template as the starting point (if available at `github.com/zama-ai`)
- Structure simply: `/contracts/week1/`, `/contracts/week2/`, etc. with a single `hardhat.config.ts`
- Starter code = contract with `// TODO` comments. Solutions = completed contracts
- Do NOT set up CI/CD, do NOT configure multiple networks, do NOT write comprehensive tests
- The monorepo is supplementary material for the curriculum, not the primary deliverable

**Detection:** If Hardhat setup takes more than 6 hours, simplify to code snippets in the lessons instead of a runnable monorepo.

**Phase relevance:** Late content phase (days 8-10). Only after all lesson content is written.

**Confidence:** MEDIUM -- Hardhat + FHEVM integration complexity is real but mitigable.

---

### Pitfall 12: Quiz Questions Testing Memorization Instead of Understanding

**What goes wrong:** Under time pressure, quiz questions become trivial ("What type is used for encrypted 8-bit integers?") instead of testing conceptual understanding ("Why can't you use `if` with an `ebool`?"). Zama judges will notice shallow assessment design.

**Prevention:**
- Each quiz should have 2-3 questions testing:
  - One conceptual understanding question (why, not what)
  - One "spot the bug" question (identify the error in FHEVM code)
  - One transformation question (given this Solidity, what is the FHEVM equivalent?)
- Write quiz questions WHILE writing the lesson, not after all lessons are complete
- Reuse the "Common Mistakes" as quiz fodder -- they make excellent "what's wrong with this code?" questions

**Detection:** If all quiz answers can be found by ctrl+F in the lesson text, the questions are too shallow.

**Phase relevance:** Content creation phase -- write quizzes alongside lessons.

**Confidence:** HIGH -- Standard educational design principle.

---

### Pitfall 13: Ignoring AI-Generated Content Detection by Judges

**What goes wrong:** Zama's December 2025 program explicitly limited eligibility for submissions that were clearly AI-generated. If the curriculum reads like ChatGPT output (generic phrasing, repetitive structure, surface-level explanations), judges will discount it regardless of technical accuracy.

**Prevention:**
- Use AI as a research and drafting tool, but rewrite explanations in a distinctive voice
- Add personal observations, specific analogies, and "gotcha" callouts that feel human-authored
- Include instructor notes with practical tips that come from actually trying the code
- Vary lesson structure -- not every lesson should follow the exact same template
- The "Migration Mindset" framing itself is distinctive and should be leaned into heavily

**Detection:** Read lessons aloud. If they sound like generic documentation, rewrite the explanations with more personality and specific examples.

**Phase relevance:** Content creation and polish phases.

**Confidence:** MEDIUM -- Based on Zama's December 2025 winner announcement noting AI-generated content concerns.

---

### Pitfall 14: Deploying Untested on Submission Day

**What goes wrong:** The Vercel deployment is attempted on day 12, environment variables are missing, build fails, images do not load, or navigation is broken in production. There is no time to debug.

**Prevention:**
- Deploy to Vercel on day 1 or 2, even with just a "Coming Soon" page
- Set up environment variables (thirdweb, Supabase) in Vercel dashboard early
- Push and verify deployment after every major feature completion
- Test the production URL on day 10, not day 12
- Have a "deployment checklist": all pages load, navigation works, progress tracking works, no console errors, responsive on desktop

**Detection:** If you have not deployed to Vercel by day 5, you are risking submission-day failures.

**Phase relevance:** Infrastructure phase (day 1-2) and final phase (day 11-12).

**Confidence:** HIGH -- Universal deployment best practice.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| FHEVM Research (Day 1-2) | Consuming outdated tutorials, learning old API | Use ONLY docs.zama.org/protocol, verify against v0.9 migration guide |
| Curriculum Outline (Day 1-2) | Underestimating content volume for 20 lessons | Write bullet-point outlines for ALL 20 lessons before coding anything |
| Platform Setup (Day 2-3) | Over-engineering the component library | Use shadcn/ui defaults, customize only colors and typography |
| CodeDiff Component (Day 3) | Feature creep on diff visualization | 4-hour timebox, two side-by-side code blocks with highlight colors |
| Lesson Content (Day 3-9) | Teaching outdated FHEVM API | Grep for TFHE., einput, SepoliaConfig after each lesson is written |
| Wallet Auth (Day 7-8) | thirdweb integration rabbit hole | 4-hour timebox, fall back to localStorage if broken |
| Supabase Backend (Day 7-8) | RLS misconfiguration, custom JWT complexity | 3-hour timebox, fall back to localStorage if broken |
| Homework Design (Day 8-9) | Homework requiring live FHEVM environment students do not have | Design homework as code review / transformation exercises, not live deployment |
| Hardhat Monorepo (Day 9-10) | Configuration complexity with FHEVM plugins | Use Zama's template, keep structure flat, defer if behind |
| Design Polish (Day 10-11) | Perfectionism on animations, micro-interactions | Focus on Zama brand colors, typography, and layout only |
| Submission Prep (Day 11-12) | Last-minute deployment failures | Deploy early and often, test production URL on day 10 |
| Demo/README (Day 12) | Insufficient documentation of what judges should look at | Write a clear README with: setup instructions, curriculum overview, architecture decisions, screenshots |

---

## Competition-Specific Risk Matrix

| Risk | Probability | Impact | Mitigation Priority |
|------|-------------|--------|-------------------|
| Outdated FHEVM API in content | HIGH | CRITICAL | Immediate -- establish version reference on day 1 |
| Incomplete curriculum (< 20 lessons) | MEDIUM | CRITICAL | Content-first development, daily lesson count check |
| Platform not deployed at deadline | LOW | CRITICAL | Deploy on day 1, continuous deployment |
| Wallet auth broken | MEDIUM | LOW | LocalStorage fallback ready |
| Supabase issues | MEDIUM | LOW | LocalStorage fallback ready |
| Shallow quiz/homework design | MEDIUM | MEDIUM | Write alongside lessons, not after |
| Landing page unimpressive | LOW | MEDIUM | 3-4 hour timebox, shadcn/ui components |
| AI-generated content flagged | MEDIUM | HIGH | Rewrite with distinctive voice, add personal observations |

---

## Sources

- [Zama FHEVM v0.9 Migration Guide](https://docs.zama.org/protocol/solidity-guides/development-guide/migration) -- HIGH confidence, official documentation
- [Zama FHEVM Operations on Encrypted Types](https://docs.zama.org/protocol/solidity-guides/smart-contract/operations) -- HIGH confidence, official documentation
- [FHEVM v0.7 Changelog](https://docs.zama.org/change-log/release/fhevm-v0.7-july-2025) -- HIGH confidence, official changelog
- [Zama Bounty Program Season 10: Tutorial Requirements](https://www.zama.org/post/zama-bounty-program-season-10-create-a-hello-fhevm-tutorial) -- HIGH confidence, official bounty spec
- [Zama Developer Program December 2025 Winners](https://community.zama.org/t/zama-developer-program-december-2025-winners/4127) -- MEDIUM confidence, community forum
- [Zama FHEVM GitHub Repository](https://github.com/zama-ai/fhevm) -- HIGH confidence, official source
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) -- HIGH confidence, official documentation
- [Devpost: Understanding Hackathon Submission and Judging Criteria](https://info.devpost.com/blog/understanding-hackathon-submission-and-judging-criteria) -- MEDIUM confidence, industry standard
- [Colosseum: Perfecting Your Hackathon Submission](https://blog.colosseum.com/perfecting-your-hackathon-submission/) -- MEDIUM confidence, hackathon best practices
- [Supabase RLS Security Analysis](https://www.precursorsecurity.com/security-blog/row-level-recklessness-testing-supabase-security) -- MEDIUM confidence, third-party security analysis
