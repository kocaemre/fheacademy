# Phase 3: Full Curriculum Content - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Author all 20 lessons with Migration Mindset code comparisons, inline quizzes, instructor notes, 4 homework assignments with rubrics, week overviews with learning objectives and homework previews, and a syllabus page. All content uses the existing component library (CodeDiff, Quiz, CodeBlock, CalloutBox, InstructorNotes) built in Phase 2. No auth, no progress tracking, no landing page — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### Lesson Depth & Structure
- Go bigger than the demo lesson (1.4): aim for 2-3 CodeDiff components per lesson, longer explanations, and more code examples to impress judges
- Conceptual lessons (1.1, 1.2, 2.5, 4.1, 4.2, 4.3): use a mix of at least 1 CodeDiff (where a comparison makes sense) plus standalone CodeBlocks for other examples
- Hands-on lessons: denser, with multiple CodeDiff examples showing the migration transformation
- Each lesson includes 2-3 quiz questions with a mix of conceptual understanding AND code-reading questions (at least 1 of each type)
- All code examples must be verified against FHEVM v0.9 API — use fhevm-api-reference.tsx and solidity-to-fhevm-guide.tsx as source of truth

### Homework Page Format
- Full spec pages with inline code examples: overview, learning objectives, requirements list, starter code snippets via CodeBlock, rubric with weighted criteria, submission guidelines
- Include CodeDiff/CodeBlock showing the expected transformation pattern (direction, not solution)
- Brief "Getting Started" section with link back to Lesson 1.3 (Development Environment Setup) rather than repeating setup instructions
- Inline starter code snippets on the homework page itself (full Hardhat monorepo comes in Phase 5)
- 4 homework pages: Temperature Converter Migration (W1), Confidential ERC-20 Token (W2), Sealed-Bid Auction dApp (W3), Capstone Project (W4)

### Syllabus Page
- Full intro section above the week cards: course description, prerequisites, what you'll build, and "How to use this course" guide
- 4 week cards, each showing: week goal, learning objectives bullets, list of 5 lessons, and homework assignment
- All items link to their respective pages (week overview, individual lessons, homework)

### Week Overview Enrichment
- Add a 2-3 sentence narrative intro paragraph per week setting the stage (what this week covers, how it builds on previous, what students can do by the end)
- Add learning objectives section (format at Claude's discretion)
- Replace simple homework link with a mini spec card: homework title, brief description, 3-4 key deliverables, and estimated difficulty indicator
- Lesson type visual treatment at Claude's discretion

### Claude's Discretion
- Internal lesson content flow/structure (organic, not forced template)
- Rubric visual format (table vs cards vs other)
- Learning objectives presentation style on week pages
- Lesson type visual treatment on week overview pages (current text label, badge, icon, etc.)
- Syllabus page routing (inside vs outside academy layout group)
- Narrative tone and pedagogical pacing per lesson

</decisions>

<specifics>
## Specific Ideas

- Demo lesson 1.4 exists as the content pattern template — all lessons follow its component usage patterns but are denser (2-3 CodeDiffs vs 1)
- The project plan document at `/Users/0xemrek/Downloads/FHE_Academy___Complete_Project_Plan.md` is the primary content reference for lesson material
- FHEVM v0.9 API reference at `content/fhevm-api-reference.tsx` and transformation guide at `content/solidity-to-fhevm-guide.tsx` are the verified sources for all code examples
- "Migration Mindset" must be visible in every lesson — even conceptual ones should have at least 1 side-by-side comparison where it makes sense
- Judges evaluate curriculum quality above all else (from STATE.md decisions) — content depth and FHEVM accuracy are the primary competition differentiators

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/content/code-diff.tsx`: Side-by-side Solidity vs FHEVM with Shiki highlighting, supports `highlightLines`, `solidityFilename`, `fhevmFilename` props
- `components/content/code-block.tsx`: Single code block with Shiki highlighting, supports `lang`, `filename` props
- `components/content/quiz.tsx`: Multiple-choice quiz with single-attempt model, immediate feedback + explanation
- `components/content/quiz-score.tsx`: QuizProvider + QuizScore for lesson-scoped score tracking
- `components/content/callout-box.tsx`: CVA-styled callout with tip/warning/mistake/info variants
- `components/content/instructor-notes.tsx`: Collapsible accordion section
- `components/content/copy-button.tsx`: Copy-to-clipboard for code blocks
- `components/layout/lesson-layout.tsx`: Full lesson page wrapper with breadcrumb, learning objective, prev/next navigation
- `lib/curriculum.ts`: Single source of truth for all weeks, lessons, homework — defines types `Week`, `Lesson`, `Homework`

### Established Patterns
- Lesson content is hardcoded TSX in the lesson page route handler (see demo lesson 1.4 in `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx`)
- Each lesson wraps content in `<QuizProvider>` and ends with `<QuizScore />`
- Components imported per lesson: CodeDiff, CodeBlock, Quiz, QuizProvider, QuizScore, CalloutBox, InstructorNotes
- `generateStaticParams()` from curriculum.ts for full SSG
- Tailwind classes for text: `text-text-secondary leading-relaxed` for body, `rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary` for inline code

### Integration Points
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx` — currently has demo 1.4 + placeholders for all other lessons; will need content for all 20
- `app/(academy)/week/[weekId]/page.tsx` — week overview pages need enrichment (objectives, narrative intro, homework preview card)
- Homework pages need new route: `app/(academy)/week/[weekId]/homework/[homeworkSlug]/page.tsx` (homework links already exist in week pages but route doesn't exist)
- Syllabus page needs new route (location TBD)
- `lib/curriculum.ts` — may need additional data (learning objectives per week, homework descriptions) to support enriched pages

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-full-curriculum-content*
*Context gathered: 2026-03-04*
