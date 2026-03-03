# Feature Landscape

**Domain:** Developer education platform / FHEVM bootcamp (Zama competition submission)
**Researched:** 2026-03-03
**Confidence:** MEDIUM-HIGH (cross-referenced multiple education platforms, Zama bounty criteria, and competition judging patterns)

## Context: What Judges Care About

This is not a generic education platform -- it is a **competition submission**. The judging lens is:

1. **Curriculum quality** -- Is the content technically accurate and well-structured?
2. **FHEVM coverage completeness** -- Does it cover the full encryption lifecycle?
3. **Practicality** -- Can developers actually use this to build real dApps?
4. **Homework design** -- Are assignments meaningful, well-rubric'd, and graded?
5. **Clarity and engagement** -- Is it beginner-friendly, visual, and polished?
6. **Production-readiness** -- Does the platform look and feel like a real product?

The key tension: **breadth of platform features vs. depth of curriculum content**. Judges will reward a polished, content-rich platform over a feature-bloated one with shallow content. Prioritize content completeness and polish over feature count.

---

## Table Stakes

Features users (and judges) expect. Missing = platform feels incomplete or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Structured weekly curriculum (4 weeks, ~20 lessons)** | This IS the product. Judges evaluate curriculum first. Without it, there is nothing to judge. | High (content creation) | Most time-consuming feature. Content must be technically accurate against Zama docs. |
| **Lesson pages with clear prose + code examples** | Every education platform has this. Bare minimum for a bootcamp. | Med | TSX hardcoded pages give full component control. Each lesson needs explanatory text, code blocks, and key takeaways. |
| **Side-by-side CodeDiff (Solidity vs FHEVM)** | Core to the "Migration Mindset" teaching philosophy. This is the visual hook that makes the curriculum click. | Med | Use a diff-style component with syntax highlighting. Left = vanilla Solidity, right = FHEVM equivalent. Annotate changes. |
| **Navigation sidebar with week/lesson structure** | Users need to know where they are and what comes next. Every bootcamp platform has this (Cyfrin Updraft, Codecademy, Boot.dev). | Low-Med | Collapsible week sections, lesson list, active state indicator. |
| **Progress tracking (mark complete per lesson)** | Judges expect this. Cyfrin Updraft, Codecademy, and every modern learning platform has progress tracking. Without it, platform feels like a static website. | Med | "Mark as Complete" button per lesson. Progress bar per week and overall. Requires state persistence. |
| **Inline quizzes per lesson (2-3 questions)** | Reinforces learning, demonstrates pedagogical rigor. Judges specifically evaluate "clarity/engagement." | Low-Med | Multiple choice or true/false. Show correct answer with explanation on submit. No backend grading needed -- client-side. |
| **Weekly homework assignments with rubrics** | Judges specifically evaluate "homework design." 4 assignments (one per week) with clear deliverables, acceptance criteria, and grading rubrics. | Med (content design) | Rubrics should follow best practices: completeness (50-70%), correctness (10-30%), design (0-20%), style (10-20%). |
| **Landing page** | First thing judges see. Sets the tone. Must communicate what this is, who it's for, and why it matters. | Low-Med | Hero section, curriculum overview, week structure preview, tech stack badges, CTA to start learning. |
| **Dashboard / home view** | After landing, users need a home base showing their progress and next lesson. | Low-Med | Overall progress, current week, next uncompleted lesson, quick links to each week. |
| **Syllabus / curriculum overview page** | Judges need to quickly scan the full curriculum scope. Competitors (Cyfrin Updraft) all have this. | Low | Full week-by-week breakdown, lesson titles, estimated time per lesson. |
| **Responsive design** | Judges may review on various devices. Broken layout = instant negative impression. | Low | Tailwind handles this. Test at desktop, tablet, mobile breakpoints. |
| **Dark theme with Zama branding** | Explicitly required. Zama's brand is dark-mode, gold/purple. This signals "we built this FOR Zama." | Low-Med | Gold (#F5C518) and purple (#8B5CF6) accents on dark background. Premium feel, not generic. |
| **Syntax-highlighted code blocks** | Code is the content. Unformatted code is unreadable. Every code education platform has this. | Low | Use Prism.js or Shiki. Support Solidity syntax highlighting specifically. |
| **Capstone project specification** | Final week should culminate in a substantial project. Judges look for this as proof of curriculum completeness. | Med (content) | Detailed spec, starter code, expected deliverables, evaluation criteria. |

---

## Differentiators

Features that set this platform apart from existing FHEVM education (ZamaSchool, Zama docs, hello-fhevm tutorials). Not expected, but will impress judges.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI Grader prompt generator** | Novel approach: generates a copy-paste prompt for any AI model to grade homework. Model-agnostic, no API keys, always works. No other FHEVM education platform has this. Judges will notice the practical homework feedback loop. | Low-Med | Template-based prompt that includes rubric, assignment spec, student code, and grading instructions. Output is a formatted prompt the student pastes into ChatGPT/Claude. |
| **Hardhat monorepo with starter code + solutions** | Goes beyond "read about it" to "build it." Complete, runnable code for every week. ZamaSchool is frontend-only demos. This gives real development scaffolding. | Med-High | Separate packages per week. Starter templates with TODOs. Solution branches or folders. README per package with setup instructions. |
| **Instructor notes (collapsible per lesson)** | Unique for competition: jury sees teaching methodology and pedagogical reasoning inline. Shows thought went into WHY topics are ordered this way. No other platform does this. | Low | Collapsible "Instructor Notes" section at bottom of each lesson. Explains teaching rationale, common student mistakes, suggested emphasis points. |
| **Migration Mindset framing throughout** | Not just code diffs -- every lesson is explicitly framed as "here is what you know (Solidity) -> here is the FHEVM equivalent." This pedagogical approach is unique and directly addresses the biggest developer pain point: FHE feels alien. | Low (design choice) | Consistent lesson structure: Solidity Recap -> What Changes -> FHEVM Code -> Key Differences -> Practice. |
| **Comprehensive FHEVM coverage (full encryption lifecycle)** | Existing resources (ZamaSchool, hello-fhevm tutorials) cover basics. A 4-week bootcamp covering encrypted types, operations, ACL, encrypted inputs, async decryption, KMS, gas optimization, and production patterns would be the most comprehensive FHEVM education resource that exists. | High (content) | This is THE differentiator. Depth of content is what wins the competition, not feature count. |
| **Week overview pages with learning objectives** | Professional course design includes clear learning objectives per module. Shows pedagogical intentionality. Cyfrin Updraft does this well. | Low | Each week gets an overview page: learning objectives, prerequisites, lesson list, homework preview. |
| **Production-ready code patterns** | Move beyond toy examples to patterns you would actually use in production: gas optimization, ACL best practices, upgrade patterns, testing strategies. Judges evaluate "practicality for real-world use." | Med-High (content) | Week 3-4 content. Requires deep Zama doc research to ensure accuracy. |
| **Visual diagrams for FHE concepts** | FHE is abstract. Encryption/decryption lifecycle, ACL flow, KMS architecture -- these need visual explanations. Most FHEVM content is text-only. | Med | Custom SVG or diagram components. Encryption flow, ACL permission model, async decryption sequence. |
| **Wallet-based auth with cross-device sync** | Web3-native authentication. Learners connect wallet once, progress syncs everywhere. Demonstrates the platform works with real Web3 infrastructure. | Med | thirdweb Connect + Supabase. Content stays publicly accessible; wallet just enables progress tracking. |

---

## Anti-Features

Features to explicitly NOT build. These would waste limited time or hurt the submission.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **In-browser code editor / sandbox** | Massive complexity (need Solidity compiler, FHEVM mock, execution environment). Would take days to build and would be buggy. ZamaSchool already does interactive demos -- competing on their turf is a losing game. | Provide Hardhat monorepo with clear setup instructions. Students code in their own IDE (which is closer to real development anyway). |
| **Live FHE computation on platform** | Explicitly out of scope in PROJECT.md. FHEVM needs actual blockchain infrastructure. Platform is educational, not a live FHE environment. | Provide clear instructions for connecting to Zama testnet. Link to deployed example contracts. |
| **Video content / recorded lectures** | Recording, editing, and hosting video takes days. The demo video is a separate deliverable. Text + code is faster to produce and easier for judges to skim. | Written lessons with code examples, diagrams, and quizzes. Demo video recorded AFTER platform is complete. |
| **Light mode** | Halves design work. Zama branding is dark-mode. Dark-only is a deliberate design choice, not a shortcut. | Dark-only with Zama-branded color palette. |
| **Email/password auth** | Web3 audience expects wallet auth. Email adds complexity (password reset, verification, etc.) for no benefit. | thirdweb Connect (wallet-based). Content publicly accessible without auth. |
| **CMS or MDX** | MDX adds build complexity (loader config, serialization, component passing). Hardcoded TSX gives full component access and zero build surprises. With 20 lessons, the overhead of a CMS is not justified. | Hardcoded TSX pages. Each lesson is a React component with full access to custom components (CodeDiff, Quiz, InstructorNotes, etc.). |
| **Discussion forums / comments** | Community features take significant effort and need moderation. A 4-week bootcamp for a competition does not need social features. | Link to Zama Discord for questions. |
| **Leaderboards / gamification** | Points, badges, streaks, XP -- these are effective for engagement on platforms like Codecademy that need retention over months. A 4-week competition bootcamp does not need retention mechanics. Over-engineering. | Simple progress tracking (checkmarks, progress bars) is sufficient and feels professional rather than gimmicky. |
| **Certificate of completion / NFT badge** | Cool idea, wrong timing. NFT minting requires smart contract deployment, metadata, and design work. Does not demonstrate FHEVM knowledge. | Mention it as a "future enhancement" in documentation if desired. |
| **Automated test runner / grading** | Would require running student code on a server, managing containers, handling timeouts. Massive infrastructure. The AI Grader prompt approach is more novel and zero-infrastructure. | AI Grader prompt generator + human-readable rubrics. |
| **Mobile app** | Web-first is sufficient. Responsive web design covers mobile use cases. | Responsive Tailwind CSS design tested at mobile breakpoints. |
| **Multi-language / i18n** | English only. Competition judges are English-speaking. Translation doubles content work. | English only. |

---

## Feature Dependencies

```
Landing Page (standalone)
  |
  v
Navigation Sidebar -> Lesson Pages -> CodeDiff Component
                                    -> Quiz Component
                                    -> InstructorNotes Component
                                    -> Syntax Highlighting
  |
  v
Dashboard -> Progress Tracking -> Wallet Auth (thirdweb)
                               -> State Persistence (Supabase)
  |
  v
Syllabus Page (standalone, reads curriculum structure)
  |
  v
Week Overview Pages -> Homework Assignment Pages -> AI Grader Prompt Generator
  |
  v
Hardhat Monorepo (standalone, linked from homework pages)
  |
  v
Capstone Project Spec (depends on Week 1-3 curriculum being defined)
```

**Critical path:** Lesson page components (CodeDiff, Quiz, InstructorNotes) must be built BEFORE content can be authored. Navigation and progress tracking can be added after initial lesson pages exist.

**Parallel workstreams:**
- Hardhat monorepo can be built independently of the web platform
- Content writing can proceed once lesson page template is defined
- Landing page and dashboard are independent of lesson content

---

## MVP Recommendation

Given the 12-day deadline, prioritize ruthlessly:

### Must Ship (Days 1-8)
1. **Lesson page template with CodeDiff, Quiz, InstructorNotes, syntax highlighting** -- The reusable shell that all content lives in
2. **Navigation sidebar with week/lesson structure** -- Users must be able to navigate
3. **20 lessons of FHEVM content across 4 weeks** -- This IS the product. Content quality wins the competition
4. **4 homework assignments with rubrics** -- Judges evaluate homework design
5. **Landing page** -- First impression for judges
6. **Dark theme with Zama branding** -- Visual polish signals production-readiness

### Should Ship (Days 8-10)
7. **Progress tracking with mark-complete** -- Elevates from static site to interactive platform
8. **Dashboard** -- Home base for learners
9. **Week overview pages** -- Professional course structure
10. **AI Grader prompt generator** -- Novel differentiator, low complexity
11. **Syllabus page** -- Quick scan for judges

### Nice to Have (Days 10-12)
12. **Wallet auth + Supabase cross-device sync** -- Polish feature, not critical for judging
13. **Hardhat monorepo with starter code** -- Demonstrates practicality, but can be minimal
14. **Visual diagrams for FHE concepts** -- Impressive but time-intensive
15. **Capstone project spec** -- Can be a detailed document even without platform integration

### Defer Entirely
- In-browser editors, video, gamification, certificates, forums, automated grading

---

## Competitive Analysis

| Platform/Resource | What It Does | Gap Our Platform Fills |
|-------------------|-------------|----------------------|
| **Zama Official Docs** | Reference documentation, API specs | Not structured as a learning path. No progression, quizzes, or homework. |
| **ZamaSchool** | Interactive demos of FHE operations (encrypt, compute, decrypt) | Frontend-only demos. No curriculum structure, no homework, no progression from basics to production patterns. |
| **Hello FHEVM tutorials** | Single-page tutorials for first dApp | One-off tutorials. No multi-week progression. No migration mindset framing. |
| **Cyfrin Updraft** | Comprehensive blockchain education (Solidity, security) | No FHEVM content. Our platform fills the FHEVM-specific gap using a proven course structure. |

**Our unique position:** The only structured, multi-week FHEVM bootcamp that takes developers from Solidity knowledge to production-ready confidential dApps, with homework, grading, and a migration-based teaching methodology.

---

## Sources

- Zama Bounty Program Season 10: "Hello FHEVM" Tutorial criteria (https://www.zama.org/post/zama-bounty-program-season-10-create-a-hello-fhevm-tutorial) -- MEDIUM confidence
- Zama fhEVM documentation (https://docs.zama.org/fhevm) -- HIGH confidence
- Zama bounty program judging criteria (https://github.com/zama-ai/bounty-program) -- MEDIUM confidence
- ZamaSchool competitor analysis (https://github.com/MadeleineAguil/ZamaSchool) -- HIGH confidence (direct source)
- Cyfrin Updraft platform features (https://updraft.cyfrin.io/courses) -- HIGH confidence (direct source)
- CodeGrade rubric design best practices (https://www.codegrade.com/blog/best-practices-for-rubric-design-in-coding-assignments) -- MEDIUM confidence
- Hackathon judging criteria patterns (https://praveenax.medium.com/what-are-the-criteria-to-judge-as-a-hackathon-jury-32e08046dd4b) -- MEDIUM confidence
- Codecademy gamification case study (https://www.trophy.so/blog/codecademy-gamification-case-study) -- LOW confidence (used only for anti-feature rationale)
