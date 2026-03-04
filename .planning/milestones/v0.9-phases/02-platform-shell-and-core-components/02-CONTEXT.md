# Phase 2: Platform Shell and Core Components - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Developers can navigate the full week/lesson structure and all reusable content components (CodeDiff, Quiz, CodeBlock, CalloutBox, InstructorNotes) are built and ready for content authoring. This phase delivers the platform shell (layouts, sidebar navigation) and the component library that Phase 3 will use to author 20 lessons. No actual lesson content, no auth, no progress tracking.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Navigation
- Collapsible week headers — only the active week auto-expands, others collapsed
- Gold (#F5C518) left border + subtle background highlight for the active lesson
- Week header text links to the week overview page; a separate chevron icon toggles expand/collapse of lessons underneath
- Sidebar shows all 4 weeks with their lessons, homework entries visible under each week
- Completion indicators are structural placeholders only (Phase 4 wires them up)

### CodeDiff Component
- Tab-style panel headers: "Solidity" label (neutral/muted) on left, "FHEVM" label (gold accent) on right
- Changed lines get a subtle background highlight (gold tint on FHEVM side) to draw attention to what changed in the migration
- On narrow screens (< 768px), panels stack vertically — Solidity on top, FHEVM below
- No line numbers — code snippets are short enough that line references aren't needed
- Shiki syntax highlighting with Solidity language support, dark theme matching Zama brand

### Quiz Component
- Quiz questions appear inline within lesson content (not grouped at the end) — students encounter them as they read
- Immediate feedback with explanation after clicking "Check" — green for correct, red for incorrect, explanation always visible
- No retry — one attempt per question, incorrect answers immediately reveal the correct answer with explanation
- Mini score badge after all questions in a lesson are answered (e.g., "2/3 correct")

### CalloutBox Component
- Left border + icon + brand-aligned colors per type:
  - Tip: gold border, lightbulb icon
  - Warning: orange border, alert icon
  - Common Mistake: red border, x-circle icon
  - Info: blue border, info icon
- Subtle background tint matching the border color

### InstructorNotes Component
- Collapsible accordion section within lesson pages
- Default state: collapsed (judges can expand to see teaching guidance)
- Visually distinct from regular content (different background, "Instructor Notes" label)

### Lesson Page Layout
- Breadcrumb header: "Week N: [Week Title] > Lesson X" followed by h1 lesson title and brief learning objective line
- Content area maxes out at ~720px for comfortable reading; code blocks (CodeDiff, CodeBlock) can break out wider
- Prev/next lesson navigation buttons at the bottom with lesson titles
- Components flow naturally within hardcoded TSX: text, CodeDiff, text, Quiz, text, CalloutBox, etc.

### CodeBlock Component
- Single syntax-highlighted code block with copy button
- Same Shiki highlighting as CodeDiff panels
- Supports Solidity, TypeScript, and shell languages at minimum

### Claude's Discretion
- Sidebar width and mobile behavior (slide-out drawer vs other approach)
- Exact spacing, typography scale, and component padding
- InstructorNotes accordion animation style
- Loading skeleton design for any async content
- CodeDiff scroll sync behavior (if panels have different heights)
- Exact Shiki theme selection (must be dark, must complement Zama brand)

</decisions>

<specifics>
## Specific Ideas

- CodeDiff should feel like a VS Code split-pane — familiar to developers
- The platform should feel premium and polished for competition judges — Zama brand colors (gold/purple on dark) should be prominent
- Lesson content is hardcoded TSX — components must have clean, intuitive props APIs since content authors (Claude) will use them extensively in Phase 3
- Curriculum structure: 4 weeks, 5 lessons per week, homework per week — sidebar must accommodate ~24 items (20 lessons + 4 homeworks)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- globals.css: Full Zama dark theme with CSS custom properties — gold (#F5C518), purple (#8B5CF6), dark backgrounds (#0A0A0F, #13131A), surface colors, text hierarchy, sidebar variables all defined
- layout.tsx: Root layout with Inter (sans) and JetBrains Mono (mono) fonts configured, dark class on html element
- shadcn/ui: Configured and available (tw-animate-css, shadcn/tailwind.css imported) — can use Accordion, Button, etc.

### Established Patterns
- Tailwind v4 CSS-first config with @theme directive — all design tokens in globals.css
- No src/ directory — app/ is at project root
- Dark-only mode (no theme toggle needed)

### Integration Points
- app/layout.tsx: Root layout where sidebar + main content layout will be added
- app/page.tsx: Current placeholder — will be replaced by lesson routing
- Route structure needed: /week/[weekId]/lesson/[lessonId] (or similar)
- Phase 3 will add 20 lesson TSX files using these components
- Phase 4 will wire completion indicators and progress tracking into the shell

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-platform-shell-and-core-components*
*Context gathered: 2026-03-03*
