# Phase 3: Full Curriculum Content - Research

**Researched:** 2026-03-04
**Domain:** Content authoring for 20 FHEVM lessons, 4 homework specs, week overviews, and syllabus -- all hardcoded TSX using existing Phase 2 component library
**Confidence:** HIGH

## Summary

Phase 3 is a pure content-authoring phase. All infrastructure (Next.js 15, App Router, Tailwind v4, Shiki syntax highlighting) and all content components (CodeDiff, CodeBlock, Quiz, QuizProvider/QuizScore, CalloutBox, InstructorNotes, LessonLayout) were built in Phases 1-2 and are production-ready. The work is writing 19 new lesson TSX blocks (lesson 1.4 exists as demo), 4 homework pages, enriching 4 week overview pages, and creating a syllabus page.

The primary technical risk is NOT infrastructure -- it is FHEVM v0.9 API accuracy. Every code example must be verified against the two internal reference files (`content/fhevm-api-reference.tsx` and `content/solidity-to-fhevm-guide.tsx`), never generated from memory. The secondary risk is scope -- 20 lessons at 2-3 CodeDiffs each is ~50-60 CodeDiff components, ~50 Quiz questions, and ~20 InstructorNotes sections. Content must be deep enough to impress judges but consistent enough to ship within the deadline.

**Primary recommendation:** Organize work by week (Week 1 through Week 4), with homework and week overview enrichment as part of each week batch. The syllabus page is a standalone task. All code examples must reference the two verified source files -- never generate FHEVM code from training data.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Go bigger than the demo lesson (1.4): aim for 2-3 CodeDiff components per lesson, longer explanations, and more code examples to impress judges
- Conceptual lessons (1.1, 1.2, 2.5, 4.1, 4.2, 4.3): use a mix of at least 1 CodeDiff (where a comparison makes sense) plus standalone CodeBlocks for other examples
- Hands-on lessons: denser, with multiple CodeDiff examples showing the migration transformation
- Each lesson includes 2-3 quiz questions with a mix of conceptual understanding AND code-reading questions (at least 1 of each type)
- All code examples must be verified against FHEVM v0.9 API -- use fhevm-api-reference.tsx and solidity-to-fhevm-guide.tsx as source of truth
- Homework pages: full spec pages with inline code examples: overview, learning objectives, requirements list, starter code snippets via CodeBlock, rubric with weighted criteria, submission guidelines
- Include CodeDiff/CodeBlock showing the expected transformation pattern (direction, not solution)
- Brief "Getting Started" section with link back to Lesson 1.3 (Development Environment Setup) rather than repeating setup instructions
- Inline starter code snippets on the homework page itself (full Hardhat monorepo comes in Phase 5)
- 4 homework pages: Temperature Converter Migration (W1), Confidential ERC-20 Token (W2), Sealed-Bid Auction dApp (W3), Capstone Project (W4)
- Syllabus page: full intro section above the week cards: course description, prerequisites, what you'll build, and "How to use this course" guide
- 4 week cards, each showing: week goal, learning objectives bullets, list of 5 lessons, and homework assignment
- All items link to their respective pages (week overview, individual lessons, homework)
- Week overview enrichment: 2-3 sentence narrative intro paragraph, learning objectives section, homework mini spec card with title, description, 3-4 key deliverables, and estimated difficulty indicator

### Claude's Discretion
- Internal lesson content flow/structure (organic, not forced template)
- Rubric visual format (table vs cards vs other)
- Learning objectives presentation style on week pages
- Lesson type visual treatment on week overview pages (current text label, badge, icon, etc.)
- Syllabus page routing (inside vs outside academy layout group)
- Narrative tone and pedagogical pacing per lesson

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CURR-01 | Platform delivers 20 lessons across 4 weeks covering FHEVM from basics to production patterns | All 20 lessons defined in `lib/curriculum.ts`. Lesson page route exists with placeholder fallback. Content from project plan document provides detailed outlines for all 20 lessons. |
| CURR-02 | Every lesson follows "Migration Mindset" -- showing Solidity pattern transforming to FHEVM equivalent | CodeDiff component is the primary vehicle. Demo lesson 1.4 establishes the pattern. Conceptual lessons need at least 1 CodeDiff; hands-on lessons need 2-3. |
| CURR-03 | Each lesson includes 2-3 inline multiple-choice quiz questions with correct answers and explanations | Quiz component with single-attempt model is ready. QuizProvider/QuizScore wraps each lesson. Quiz questions outlined in project plan for all lessons. |
| CURR-04 | Each lesson includes collapsible instructor notes section with teaching guidance and common mistakes | InstructorNotes component (Accordion-based) is ready. Instructor notes content outlined in project plan. |
| CURR-06 | Week 1 covers FHE fundamentals: why privacy matters, Zama ecosystem, dev setup, first contract migration, testing | 5 lessons defined: 1.1-1.5. Detailed content outlines in project plan. API reference files cover all Week 1 code examples. |
| CURR-07 | Week 2 covers encrypted types deep dive, all FHE operations, encrypted inputs/ZKPoK, ACL system, patterns | 5 lessons defined: 2.1-2.5. API reference covers complete type catalog, all operations, ACL system. |
| CURR-08 | Week 3 covers decryption mechanism, FHE.select patterns, on-chain randomness, frontend integration, auction/voting patterns | 5 lessons defined: 3.1-3.5. API reference covers self-relaying decryption (v0.9), FHE.select, randomness. Voting contract example exists in API reference. |
| CURR-09 | Week 4 covers gas optimization, security best practices, confidential DeFi concepts, testing strategies, testnet deployment | 5 lessons defined: 4.1-4.5. Content is more conceptual. Gas cost hierarchy and security checklist in project plan. |
| CURR-10 | Syllabus page shows full 4-week curriculum overview | New route needed. All data in `lib/curriculum.ts`. May need to extend Week type with learning objectives. |
| HW-01 | 4 weekly homework assignments with detailed specs, starter code references, and grading rubrics | New route needed: `app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx`. Detailed specs and rubrics in project plan. |
| HW-02 | Week 1 homework: Temperature Converter migration to FHEVM | Starter contract and requirements in project plan. Rubric with 4 weighted criteria defined. |
| HW-03 | Week 2 homework: Confidential ERC-20 token with encrypted balances | Requirements and rubric in project plan. Builds on all Week 2 concepts. |
| HW-04 | Week 3 homework: Sealed-bid auction dApp (contract + frontend) | Full spec in project plan including contract functions and frontend requirements. |
| HW-05 | Week 4 homework: Capstone project (student-chosen confidential dApp) | Open-ended spec with category options and deliverables in project plan. |
| HW-07 | Each rubric includes weighted criteria with Exceeds/Meets/Below thresholds | All 4 rubrics fully defined in project plan with percentage weights and threshold descriptions. |
| PLAT-04 | Week overview pages with learning objectives, lesson list, homework preview, and week progress bar | Week page exists but needs enrichment: narrative intro, learning objectives, homework mini spec card. Progress bar is Phase 4 (auth-dependent). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15 | App Router, SSG, React Server Components | Already installed and configured |
| React | 19 | UI rendering | Already installed |
| Tailwind CSS | v4 | Styling via utility classes | Already configured with CSS-first `@theme` directive |
| Shiki | (installed) | Syntax highlighting for Solidity | Used by CodeDiff and CodeBlock components |
| shadcn/ui | (installed) | Accordion (InstructorNotes), Sidebar | Already integrated |
| Lucide React | (installed) | Icons | Already integrated |
| class-variance-authority | (installed) | CalloutBox variant styling | Already integrated |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| hast-util-to-jsx-runtime | (installed) | CodeDiff line highlighting | Already used by CodeDiff component |

### Alternatives Considered
None -- Phase 3 uses only existing dependencies. No new packages needed.

**Installation:**
No additional installation required. All dependencies are already in place from Phases 1-2.

## Architecture Patterns

### Existing Project Structure (relevant to Phase 3)
```
app/
├── (academy)/
│   ├── layout.tsx                    # Sidebar layout wrapper
│   ├── week/
│   │   └── [weekId]/
│   │       ├── page.tsx              # Week overview (ENRICH)
│   │       ├── lesson/
│   │       │   └── [lessonId]/
│   │       │       └── page.tsx      # All 20 lessons (ADD CONTENT)
│   │       └── homework/
│   │           └── [homeworkSlug]/
│   │               └── page.tsx      # 4 homework specs (CREATE)
│   └── syllabus/
│       └── page.tsx                  # Syllabus overview (CREATE)
├── page.tsx                          # Root page (untouched)
components/
├── content/
│   ├── code-diff.tsx                 # Server component, async (Shiki)
│   ├── code-block.tsx                # Server component, async (Shiki)
│   ├── quiz.tsx                      # Client component ("use client")
│   ├── quiz-score.tsx                # Client component (QuizProvider, QuizScore)
│   ├── callout-box.tsx               # Server component (CVA)
│   ├── instructor-notes.tsx          # Server component (Accordion)
│   └── copy-button.tsx               # Client component
├── layout/
│   ├── lesson-layout.tsx             # Lesson page wrapper
│   └── app-sidebar.tsx               # Navigation sidebar
lib/
├── curriculum.ts                     # EXTEND with learning objectives, homework descriptions
content/
├── fhevm-api-reference.tsx           # FHEVM v0.9 verified code patterns
└── solidity-to-fhevm-guide.tsx       # Migration transformation reference
```

### Pattern 1: Lesson Content in Single File (Established)
**What:** All 20 lessons are rendered from a single dynamic route file using conditional logic per lesson slug.
**When to use:** Every lesson.
**Example:**
```typescript
// app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx
// This single file handles all 20 lessons via if/else or switch on lessonId

if (weekNum === 1 && lessonId === "your-first-fhevm-contract") {
  return (
    <LessonLayout
      weekId={week.id}
      weekTitle={week.title}
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      learningObjective="..."
      prev={adjacent.prev}
      next={adjacent.next}
    >
      <QuizProvider>
        {/* Lesson content: paragraphs, CodeDiff, Quiz, CalloutBox, InstructorNotes */}
        <QuizScore />
      </QuizProvider>
    </LessonLayout>
  )
}
```
**CRITICAL NOTE:** The single-file approach will NOT scale well for 20 lessons (estimated 3000-5000 lines). This is an architectural concern the planner must address. Recommended approach: extract each lesson's content into a separate file (e.g., `content/lessons/lesson-1-1.tsx`) and import them into the route handler. This keeps the route file manageable while maintaining the TSX-based content approach. Each lesson content file exports a React component.

### Pattern 2: Lesson Content Component Pattern (Recommended Extraction)
**What:** Each lesson's JSX content is in its own file, imported by the route handler.
**When to use:** All lessons to keep files manageable.
**Example:**
```typescript
// content/lessons/lesson-1-1.tsx
import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export function Lesson1_1Content() {
  return (
    <>
      <p className="text-text-secondary leading-relaxed">...</p>
      <CodeDiff solidity={`...`} fhevm={`...`} ... />
      <Quiz question={{...}} />
      <CalloutBox type="tip" title="...">...</CalloutBox>
      <InstructorNotes>...</InstructorNotes>
    </>
  )
}
```

```typescript
// app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx (route handler)
import { Lesson1_1Content } from "@/content/lessons/lesson-1-1"
// ... import all lesson content components

// In the render function, map lessonId to content component
const lessonContent: Record<string, { component: React.ComponentType; objective: string }> = {
  "why-privacy-matters": { component: Lesson1_1Content, objective: "..." },
  // ...
}
```

### Pattern 3: Homework Page Structure
**What:** New route for homework specs with inline code, rubric, and submission guidelines.
**When to use:** All 4 homework pages.
**Example route:** `app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx`
```typescript
// Homework pages use CodeBlock/CodeDiff for starter code and transformation patterns
// No QuizProvider needed -- homework pages don't have quizzes
// Rubric rendered as styled table or card grid
// "Getting Started" section links to Lesson 1.3
```

### Pattern 4: Syllabus Page
**What:** New standalone page showing the full 4-week curriculum overview.
**When to use:** Single page.
**Routing recommendation:** Place inside academy layout group at `app/(academy)/syllabus/page.tsx` so it has the sidebar navigation. The syllabus is a curriculum reference page, so having the sidebar context is useful.

### Pattern 5: Week Overview Enrichment
**What:** Enhance existing week pages with narrative intro, learning objectives, and homework mini spec card.
**When to use:** All 4 week pages.
**Data requirement:** `lib/curriculum.ts` needs to be extended with:
- `learningObjectives: string[]` per week
- Homework description, key deliverables, and difficulty level per week

### Anti-Patterns to Avoid
- **Single massive file:** Don't put all 20 lessons' content in one page.tsx file. Extract to separate content files.
- **Generating FHEVM code from memory:** NEVER write FHEVM code examples without cross-referencing `content/fhevm-api-reference.tsx` and `content/solidity-to-fhevm-guide.tsx`. The v0.9 API has breaking changes from earlier versions.
- **Using deprecated FHEVM patterns:** Never use `TFHE.*` (old namespace), `Gateway.requestDecryption`, `GatewayCaller`, `einput`, `ebytes`, `SepoliaConfig`, or `decryptionOracle`.
- **Inconsistent component usage:** Every lesson must use QuizProvider/QuizScore wrapping, consistent Tailwind classes for body text (`text-text-secondary leading-relaxed`), and inline code styling (`rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary`).
- **Hardcoding learning objectives in JSX:** Store per-week learning objectives in `lib/curriculum.ts` so both week overview pages and the syllabus page can reference them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Side-by-side code comparison | Custom diff viewer | `CodeDiff` component | Already built with Shiki, line highlighting, responsive grid |
| Syntax highlighting | Custom highlighter | `CodeBlock` component | Shiki with vitesse-dark theme, copy button included |
| Quiz with scoring | Custom quiz logic | `Quiz` + `QuizProvider` + `QuizScore` | Single-attempt model with context-based scoring already built |
| Collapsible sections | Custom accordion | `InstructorNotes` (uses shadcn Accordion) | Already styled with BookOpen icon |
| Styled callouts | Custom alert boxes | `CalloutBox` with CVA variants | tip/warning/mistake/info variants ready |
| Lesson page structure | Custom layout | `LessonLayout` component | Breadcrumb, header, prev/next navigation included |
| Static params generation | Manual route definitions | `generateStaticParams` from `curriculum.ts` | Already wired for all lessons |

**Key insight:** Phase 3 requires ZERO new component development. Every UI element needed already exists. The entire phase is content authoring and light data model extension.

## Common Pitfalls

### Pitfall 1: FHEVM API Version Confusion
**What goes wrong:** Using deprecated `TFHE.*` namespace, `Gateway.requestDecryption`, `einput` types, or `SepoliaConfig` in code examples.
**Why it happens:** Training data and online resources often reference FHEVM v0.5/v0.6 patterns. The v0.7 rename from TFHE to FHE and v0.9 removal of Gateway are not widely documented yet.
**How to avoid:** Every code example MUST be cross-referenced with `content/fhevm-api-reference.tsx` before inclusion. Use the deprecated pattern checklist in that file's header comment.
**Warning signs:** Any occurrence of `TFHE.`, `Gateway.`, `einput`, `ebytes`, `SepoliaConfig`, or `decryptionOracle` in lesson content.

### Pitfall 2: File Size Explosion
**What goes wrong:** The lesson page.tsx file grows to 5000+ lines, making it impossible to edit, review, or debug.
**Why it happens:** 20 lessons x 150-250 lines of JSX each = 3000-5000 lines in a single file.
**How to avoid:** Extract each lesson's content into a separate file under `content/lessons/`. Import and render them from the route handler.
**Warning signs:** File exceeds 500 lines before all lessons are added.

### Pitfall 3: Inconsistent Content Depth
**What goes wrong:** Early lessons are thorough with 2-3 CodeDiffs, while later lessons are thin placeholders.
**Why it happens:** Fatigue from content volume -- 20 lessons is substantial.
**How to avoid:** Define a minimum content checklist per lesson: at least 1 CodeDiff (conceptual) or 2-3 CodeDiff (hands-on), 2-3 Quiz questions (mix of conceptual + code-reading), 1 InstructorNotes section, at least 2 explanatory paragraphs.
**Warning signs:** A lesson has fewer components than the demo lesson 1.4.

### Pitfall 4: Quiz Questions That Test Memorization
**What goes wrong:** Quiz questions ask "What function does X?" instead of testing understanding.
**Why it happens:** It is easier to write factual recall questions than conceptual ones.
**How to avoid:** Each lesson must have at least 1 code-reading question (given code, what happens?) and at least 1 conceptual question (why does X work this way?). Never ask "What is the function name for Y?" style questions.
**Warning signs:** All quiz options are one-word or single-phrase answers.

### Pitfall 5: Curriculum Data Model Gaps
**What goes wrong:** Week overview pages and syllabus page need data (learning objectives, homework descriptions) that doesn't exist in `lib/curriculum.ts`.
**Why it happens:** The curriculum data model was designed for Phase 2's navigation needs, not Phase 3's content richness.
**How to avoid:** Extend the `Week` and `Homework` interfaces in `lib/curriculum.ts` FIRST, before writing page content. Add: `learningObjectives: string[]` to Week, and `description: string`, `deliverables: string[]`, `difficulty: "beginner" | "intermediate" | "advanced"` to Homework.
**Warning signs:** Week overview or syllabus pages hardcode data that should come from curriculum.ts.

### Pitfall 6: Homework Route Missing generateStaticParams
**What goes wrong:** Homework pages 404 in production because static params aren't generated.
**Why it happens:** New route doesn't have `generateStaticParams()` exporting all homework slugs.
**How to avoid:** Add `generateStaticParams` to the homework page route that iterates `curriculum` and maps week.id + homework.slug.
**Warning signs:** Homework links in sidebar or week pages lead to 404.

### Pitfall 7: Server/Client Component Boundary
**What goes wrong:** Importing a server async component (CodeDiff, CodeBlock) inside a client component, causing build errors.
**Why it happens:** CodeDiff and CodeBlock are async server components (they call `codeToHtml`/`codeToHast`). If a parent component has "use client", these cannot be direct children.
**How to avoid:** Lesson content components should NOT have "use client" at the top. Only Quiz and QuizProvider/QuizScore are client components. The lesson content component can use server components directly because the route page is a server component. QuizProvider wraps client components inside the server tree using the children pattern.
**Warning signs:** Build errors about async components in client modules.

## Code Examples

### Example 1: Lesson Content File Structure
```typescript
// content/lessons/lesson-1-1.tsx
import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson1_1Meta = {
  learningObjective: "Understand why public blockchains have a privacy problem and how FHE solves it.",
}

export function Lesson1_1Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Every transaction, every balance, every swap amount on public blockchains is visible to anyone...
      </p>

      {/* At least 1 CodeDiff for conceptual lessons */}
      <CodeDiff
        solidity={`// Standard ERC-20 Transfer\n// Everyone can see:\n// - sender address\n// - recipient address\n// - transfer amount\nfunction transfer(address to, uint256 amount) public {\n    balances[msg.sender] -= amount;\n    balances[to] += amount;\n}`}
        fhevm={`// Confidential ERC-20 Transfer\n// Encrypted on-chain:\n// - transfer amount\n// - balances\nfunction transfer(\n    address to,\n    externalEuint64 encAmount,\n    bytes calldata inputProof\n) public {\n    euint64 amount = FHE.fromExternal(encAmount, inputProof);\n    // ... encrypted arithmetic ...\n}`}
        solidityFilename="PublicToken.sol"
        fhevmFilename="ConfidentialToken.sol"
      />

      <Quiz
        question={{
          id: "1.1-q1",
          question: "What is the main difference between ZKP and FHE?",
          options: [
            "ZKP is faster than FHE",
            "ZKP proves statements without revealing data; FHE allows computation on encrypted data",
            "FHE requires trusted hardware; ZKP does not",
            "They are the same technology with different names",
          ],
          correctIndex: 1,
          explanation: "ZKP proves that a statement is true without revealing the underlying data. FHE goes further -- it allows performing computations directly on encrypted data without ever decrypting it.",
        }}
      />

      <InstructorNotes>
        <p>Start with a live demo: show a random wallet on Etherscan...</p>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
```

### Example 2: Route Handler with Extracted Content
```typescript
// app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx
import { Lesson1_1Content, lesson1_1Meta } from "@/content/lessons/lesson-1-1"
// ... more imports

const lessons: Record<string, { Content: React.ComponentType; objective: string }> = {
  "1-why-privacy-matters": { Content: Lesson1_1Content, objective: lesson1_1Meta.learningObjective },
  // ...
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { weekId, lessonId } = await params
  // lookup and render
  const key = `${weekNum}-${lessonId}`
  const lessonData = lessons[key]
  if (!lessonData) { /* fallback placeholder */ }
  const { Content, objective } = lessonData

  return (
    <LessonLayout ... learningObjective={objective} ...>
      <Content />
    </LessonLayout>
  )
}
```

### Example 3: Extended Curriculum Data Model
```typescript
// lib/curriculum.ts additions
export interface Homework {
  slug: string
  title: string
  description: string
  deliverables: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

export interface Week {
  id: number
  title: string
  goal: string
  learningObjectives: string[]
  lessons: Lesson[]
  homework: Homework
}
```

### Example 4: Homework Page Structure
```typescript
// app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx
export default async function HomeworkPage({ params }: HomeworkPageProps) {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="max-w-3xl">
        {/* Header: title, week reference, difficulty badge */}
        {/* Overview section */}
        {/* Learning Objectives */}
        {/* Requirements list */}
        {/* Starter code via CodeBlock */}
        {/* Transformation pattern via CodeDiff (direction, not solution) */}
        {/* Getting Started (link to Lesson 1.3) */}
        {/* Rubric table/cards */}
        {/* Submission guidelines */}
      </div>
    </div>
  )
}
```

### Example 5: Inline Code Styling (Established Pattern)
```tsx
{/* Body text */}
<p className="text-text-secondary leading-relaxed">
  The <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
    FHE.allowThis()
  </code> function grants the contract access to the ciphertext.
</p>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FHEVM TFHE.* namespace | FHE.* namespace | FHEVM v0.7 | All code examples must use FHE.* |
| einput type for user inputs | externalEuintXX types | FHEVM v0.7 | Function signatures changed |
| Gateway.requestDecryption | FHE.makePubliclyDecryptable + relayer SDK | FHEVM v0.9 | Decryption model completely changed |
| GatewayCaller base contract | Removed (self-relaying model) | FHEVM v0.9 | No callback inheritance needed |
| SepoliaConfig | ZamaEthereumConfig | FHEVM v0.9 | Contract inheritance changed |
| ebytes types | Removed | FHEVM v0.7 | Cannot use ebytes in any example |

**Deprecated/outdated:**
- `TFHE.*`: Renamed to `FHE.*` in v0.7. Must never appear in lesson code.
- `Gateway.requestDecryption()`: Removed in v0.9. Replaced by user-driven self-relaying decryption.
- `GatewayCaller`: Removed in v0.9. Contracts no longer inherit from it.
- `einput`: Replaced by typed `externalEuintXX` in v0.7.
- `ebytes64/128/256`: Removed entirely in v0.7.
- `SepoliaConfig`: Replaced by `ZamaEthereumConfig` in v0.9.

## Open Questions

1. **Lesson content file organization**
   - What we know: Extracting to separate files is recommended for maintainability
   - What's unclear: Whether to use `content/lessons/` directory (parallel to existing `content/` files) or put them under `app/(academy)/` somewhere
   - Recommendation: Use `content/lessons/` since `content/` already exists with the API reference files. This keeps content separate from routing.

2. **Syllabus page routing**
   - What we know: CONTEXT.md marks this as Claude's discretion. Sidebar currently only shows weeks.
   - What's unclear: Whether syllabus should be inside `(academy)` layout (with sidebar) or standalone
   - Recommendation: Place inside `(academy)` layout at `app/(academy)/syllabus/page.tsx`. The sidebar provides useful navigation context. Add a syllabus link to the sidebar header or footer.

3. **Lesson 3.1 decryption content accuracy**
   - What we know: The project plan document references `Gateway.requestDecryption` for Lesson 3.1, which is deprecated in v0.9. STATE.md explicitly notes "Lesson 3.1 decryption corrected from Oracle/Gateway to v0.9 self-relaying model."
   - What's unclear: Nothing -- the correction is documented
   - Recommendation: Use the self-relaying model from `content/fhevm-api-reference.tsx` Section "Self-Relaying Decryption (v0.9)" as the canonical source for Lesson 3.1 content.

4. **Week overview page -- progress bar**
   - What we know: PLAT-04 mentions "week progress bar" but progress tracking is in Phase 4 (AUTH-dependent)
   - What's unclear: Should we add a placeholder progress bar or skip it entirely?
   - Recommendation: Skip the progress bar for now. Phase 4 will add it. Focus on the content enrichments: narrative intro, learning objectives, homework mini spec card.

## Sources

### Primary (HIGH confidence)
- `content/fhevm-api-reference.tsx` -- Verified FHEVM v0.9 API patterns (in-project, manually verified against Zama docs)
- `content/solidity-to-fhevm-guide.tsx` -- 6-step migration transformation reference (in-project, manually verified)
- `lib/curriculum.ts` -- Single source of truth for all curriculum structure
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx` -- Established lesson content pattern (demo 1.4)
- `/Users/0xemrek/Downloads/FHE_Academy___Complete_Project_Plan.md` -- Detailed lesson outlines, quiz questions, instructor notes, homework specs, rubrics

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` -- Project decisions including v0.9 API corrections
- `.planning/REQUIREMENTS.md` -- All phase requirement definitions

### Tertiary (LOW confidence)
- None -- all findings verified against in-project sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed and verified in Phases 1-2
- Architecture: HIGH -- patterns established by demo lesson 1.4, route structure in place, components tested
- Content accuracy: HIGH -- two verified FHEVM v0.9 reference files exist in-project as source of truth
- Pitfalls: HIGH -- informed by demo lesson experience and known v0.9 breaking changes

**Research date:** 2026-03-04
**Valid until:** 2026-03-15 (competition deadline)
