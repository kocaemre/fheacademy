# Phase 2: Platform Shell and Core Components - Research

**Researched:** 2026-03-03
**Domain:** Next.js App Router layouts, shadcn/ui sidebar, Shiki syntax highlighting, React component architecture
**Confidence:** HIGH

## Summary

Phase 2 builds the navigational shell (sidebar + lesson layout) and five reusable content components (CodeDiff, CodeBlock, Quiz, CalloutBox, InstructorNotes) that Phase 3 will use to author 20 lessons. The technology choices are well-constrained: Next.js 15 App Router for routing/layouts, shadcn/ui Sidebar component for the collapsible navigation tree, Shiki for VS Code-grade syntax highlighting (with confirmed Solidity support), and shadcn/ui Accordion for InstructorNotes.

The existing project has a solid foundation from Phase 1: Tailwind v4 CSS-first configuration with Zama brand tokens already defined in `globals.css`, `shadcn/ui` configured (new-york style, RSC mode, lucide icons), and two TSX content files (`solidity-to-fhevm-guide.tsx`, `fhevm-api-reference.tsx`) that demonstrate the side-by-side code comparison pattern the components will formalize. Shiki v4.0.1 is the current release with bundled Solidity grammar (sourced from `juanfranblanco/vscode-solidity`). The shadcn/ui Sidebar component provides all needed primitives: collapsible groups, active state styling via `isActive` prop, submenu nesting, and mobile-responsive sheet behavior.

**Primary recommendation:** Use shadcn/ui Sidebar (install via CLI) for navigation with collapsible week groups, Shiki `codeToHtml` in async React Server Components for zero-JS syntax highlighting, and build all five content components as server components with clean props APIs optimized for Phase 3 content authoring.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Collapsible week headers -- only the active week auto-expands, others collapsed
- Gold (#F5C518) left border + subtle background highlight for the active lesson
- Week header text links to the week overview page; a separate chevron icon toggles expand/collapse of lessons underneath
- Sidebar shows all 4 weeks with their lessons, homework entries visible under each week
- Completion indicators are structural placeholders only (Phase 4 wires them up)
- CodeDiff: Tab-style panel headers: "Solidity" label (neutral/muted) on left, "FHEVM" label (gold accent) on right
- CodeDiff: Changed lines get a subtle background highlight (gold tint on FHEVM side) to draw attention to what changed in the migration
- CodeDiff: On narrow screens (< 768px), panels stack vertically -- Solidity on top, FHEVM below
- CodeDiff: No line numbers -- code snippets are short enough that line references aren't needed
- CodeDiff: Shiki syntax highlighting with Solidity language support, dark theme matching Zama brand
- Quiz: Questions appear inline within lesson content (not grouped at the end)
- Quiz: Immediate feedback with explanation after clicking "Check" -- green for correct, red for incorrect, explanation always visible
- Quiz: No retry -- one attempt per question, incorrect answers immediately reveal the correct answer with explanation
- Quiz: Mini score badge after all questions in a lesson are answered (e.g., "2/3 correct")
- CalloutBox: Left border + icon + brand-aligned colors per type (Tip=gold/lightbulb, Warning=orange/alert, CommonMistake=red/x-circle, Info=blue/info)
- CalloutBox: Subtle background tint matching the border color
- InstructorNotes: Collapsible accordion section within lesson pages, default collapsed, visually distinct from regular content
- Lesson layout: Breadcrumb header "Week N: [Week Title] > Lesson X" + h1 + learning objective line
- Lesson layout: Content area maxes out at ~720px; code blocks can break out wider
- Lesson layout: Prev/next lesson navigation buttons at the bottom with lesson titles
- CodeBlock: Single syntax-highlighted code block with copy button, same Shiki highlighting as CodeDiff, supports Solidity/TypeScript/shell

### Claude's Discretion
- Sidebar width and mobile behavior (slide-out drawer vs other approach)
- Exact spacing, typography scale, and component padding
- InstructorNotes accordion animation style
- Loading skeleton design for any async content
- CodeDiff scroll sync behavior (if panels have different heights)
- Exact Shiki theme selection (must be dark, must complement Zama brand)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLAT-01 | Sidebar navigation with week/lesson tree, active state highlighting, and completion indicators | shadcn/ui Sidebar component with Collapsible groups, SidebarMenuButton `isActive` prop, structural placeholder badges for completion |
| PLAT-05 | Individual lesson pages using hardcoded TSX with full component access | Next.js App Router dynamic routes `app/week/[weekId]/lesson/[lessonId]/page.tsx` with nested layout providing sidebar shell |
| COMP-01 | CodeDiff component -- side-by-side Solidity vs FHEVM with Shiki syntax highlighting | Shiki `codeToHtml` in async server component, Solidity grammar bundled, CSS grid for side-by-side layout |
| COMP-02 | CodeBlock component -- single syntax-highlighted code block with copy button | Shiki `codeToHtml` server component + client "use client" copy button island |
| COMP-03 | Quiz component -- multiple-choice questions with score tracking and feedback | Client component with React `useState` for answer state, inline rendering, lesson-scoped score tracking |
| COMP-04 | CalloutBox component -- tips, warnings, common mistakes with semantic styling | Pure server component, variant-driven styling via CVA (already installed), lucide-react icons |
| COMP-06 | InstructorNotes component -- collapsible accordion section per lesson | shadcn/ui Accordion (single, collapsible), styled with distinct background |
| DSGN-01 | Zama-inspired dark theme -- gold (#F5C518) primary, purple (#8B5CF6) secondary, dark backgrounds | Already implemented in `globals.css` with full CSS custom properties; components use these tokens |
| DSGN-02 | Shiki-powered VS Code-grade syntax highlighting with Solidity language support | Shiki v4.0.1 with bundled Solidity grammar (from vscode-solidity), vitesse-dark theme recommended |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shiki | 4.0.1 | Syntax highlighting (Solidity, TypeScript, shell) | TextMate grammar-based, same engine as VS Code, SSR-friendly async API, Solidity grammar bundled |
| hast-util-to-jsx-runtime | 2.3.x | Convert Shiki HAST output to React JSX | Enables custom rendering of code elements (e.g., line highlighting) without dangerouslySetInnerHTML |
| shadcn/ui sidebar | (CLI-installed) | Navigation sidebar with collapsible groups | Official shadcn component, built on Radix, handles mobile sheet, keyboard nav, active states |
| shadcn/ui accordion | (CLI-installed) | InstructorNotes collapsible section | Official shadcn component, built on Radix Accordion primitive, accessible |

### Already Installed (from Phase 1)
| Library | Version | Purpose |
|---------|---------|---------|
| next | 15.5.12 | App Router, layouts, dynamic routes, RSC |
| react / react-dom | 19.1.0 | UI rendering, hooks for client components |
| radix-ui | 1.4.3 | Underlying primitives for shadcn/ui |
| lucide-react | 0.576.0 | Icons (ChevronDown, Lightbulb, AlertTriangle, XCircle, Info, Copy, Check, BookOpen) |
| class-variance-authority | 0.7.1 | Component variant styling (CalloutBox types) |
| clsx + tailwind-merge | via lib/utils.ts | Conditional class composition |
| tailwindcss | 4.2.1 | CSS-first utility framework with @theme tokens |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shiki (server) | react-shiki (client) | react-shiki is client-only, adds JS bundle; Shiki server-rendered = zero client JS for highlighting |
| shiki codeToHtml | shiki codeToHast + hast-util-to-jsx-runtime | codeToHtml is simpler but uses dangerouslySetInnerHTML; codeToHast gives control for line highlighting -- **use codeToHast for CodeDiff (needs line highlights), codeToHtml for CodeBlock (simpler)** |
| Custom sidebar | shadcn/ui Sidebar | Custom gives full control but loses mobile sheet, keyboard nav, accessibility, collapsible state management |

**Installation:**
```bash
pnpm add shiki@4.0.1 hast-util-to-jsx-runtime@2.3.2
pnpm dlx shadcn@latest add sidebar accordion
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx                         # Root layout (fonts, global styles) -- EXISTS
├── page.tsx                           # Landing/redirect -- EXISTS (replace or redirect)
├── (academy)/                         # Route group for sidebar layout
│   ├── layout.tsx                     # Sidebar + main content layout (SidebarProvider)
│   ├── week/
│   │   └── [weekId]/
│   │       ├── page.tsx               # Week overview (placeholder for Phase 3)
│   │       └── lesson/
│   │           └── [lessonId]/
│   │               └── page.tsx       # Individual lesson page
│   └── ...
components/
├── ui/                                # shadcn/ui components (auto-generated)
│   ├── sidebar.tsx                    # shadcn sidebar (installed via CLI)
│   ├── accordion.tsx                  # shadcn accordion (installed via CLI)
│   └── button.tsx                     # shadcn button (if needed)
├── layout/
│   ├── app-sidebar.tsx                # Custom sidebar with curriculum tree
│   └── lesson-layout.tsx              # Breadcrumb + content area + prev/next nav
├── content/                           # Reusable content components
│   ├── code-diff.tsx                  # Side-by-side Solidity vs FHEVM (server)
│   ├── code-block.tsx                 # Single code block + copy (server + client island)
│   ├── quiz.tsx                       # Multiple-choice quiz (client)
│   ├── callout-box.tsx                # Tip/Warning/Mistake/Info (server)
│   └── instructor-notes.tsx           # Collapsible accordion (server)
lib/
├── utils.ts                           # cn() helper -- EXISTS
├── curriculum.ts                      # Curriculum data: weeks, lessons, routing metadata
└── shiki.ts                           # Shared Shiki highlighter instance (singleton)
```

### Pattern 1: Route Group for Sidebar Layout
**What:** Wrap lesson routes in a `(academy)` route group so the sidebar layout only applies to curriculum pages, not to the root landing page.
**When to use:** When different sections of the app need different layouts.
**Example:**
```typescript
// app/(academy)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <SidebarTrigger className="m-4" />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

### Pattern 2: Shiki Highlighter Singleton for Server Components
**What:** Create a shared highlighter promise that lazy-loads themes and languages once, reused across all RSC renders.
**When to use:** Any server component needing syntax highlighting.
**Example:**
```typescript
// lib/shiki.ts
// Source: Shiki official docs (packages/next.md)
import { createHighlighter } from 'shiki'

// Singleton: created once, reused across requests
const highlighter = createHighlighter({
  themes: ['vitesse-dark'],
  langs: ['solidity', 'typescript', 'shellscript'],
})

export { highlighter }
```

### Pattern 3: Async Server Component for Code Highlighting
**What:** Use `async` server components to await Shiki highlighting at render time -- zero client-side JS.
**When to use:** CodeBlock and CodeDiff components.
**Example:**
```typescript
// Source: Shiki official docs (packages/next.md)
import type { BundledLanguage } from 'shiki'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang: BundledLanguage
  filename?: string
}

async function CodeBlockServer({ code, lang, filename }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'vitesse-dark',
  })
  return (
    <div className="relative group">
      {filename && (
        <div className="px-4 py-1.5 text-xs text-text-muted border-b border-code-border bg-code-bg rounded-t-lg">
          {filename}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <CopyButton code={code} />  {/* Client component island */}
    </div>
  )
}
```

### Pattern 4: Client Component Island for Interactive Parts
**What:** Keep components as server components by default; extract only interactive parts (copy button, quiz answers) into small `"use client"` islands.
**When to use:** When a component is mostly static but has one interactive piece.
**Example:**
```typescript
// components/content/copy-button.tsx
"use client"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded bg-surface hover:bg-surface-hover text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}
```

### Pattern 5: Curriculum Data as Static TypeScript Object
**What:** Define the full curriculum structure (weeks, lessons, homework) as a typed constant in `lib/curriculum.ts`. Components and navigation read from this single source of truth.
**When to use:** Anywhere that needs lesson titles, ordering, or routing info.
**Example:**
```typescript
// lib/curriculum.ts
export interface Lesson {
  id: string           // e.g., "1.1"
  slug: string         // e.g., "why-privacy-matters"
  title: string        // e.g., "Why Privacy Matters On-Chain"
  type: "conceptual" | "hands-on"
}

export interface Week {
  id: number
  title: string
  goal: string
  lessons: Lesson[]
  homework: {
    slug: string
    title: string
  }
}

export const curriculum: Week[] = [
  {
    id: 1,
    title: "From Solidity to Confidential Solidity",
    goal: "Bridge from familiar Solidity to FHEVM",
    lessons: [
      { id: "1.1", slug: "why-privacy-matters", title: "Why Privacy Matters On-Chain", type: "conceptual" },
      { id: "1.2", slug: "zama-ecosystem", title: "Zama Ecosystem Overview", type: "conceptual" },
      // ... 5 lessons per week
    ],
    homework: { slug: "temperature-converter", title: "Temperature Converter Migration" },
  },
  // ... weeks 2-4
]

// Helper functions
export function getLesson(weekId: number, lessonSlug: string): Lesson | undefined { ... }
export function getAdjacentLessons(weekId: number, lessonSlug: string): { prev?: Lesson; next?: Lesson } { ... }
```

### Pattern 6: shadcn/ui Sidebar with Collapsible Week Groups
**What:** Use shadcn Sidebar with Collapsible wrapping SidebarGroup for each week. ChevronDown icon toggles lessons; week title text links to overview page.
**When to use:** The main navigation sidebar.
**Example:**
```typescript
// components/layout/app-sidebar.tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { curriculum } from "@/lib/curriculum"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="px-4 py-3 text-lg font-bold text-primary">
          FHE Academy
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {curriculum.map((week) => (
          <Collapsible key={week.id} className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between">
                <Link href={`/week/${week.id}`} className="hover:text-primary">
                  Week {week.id}: {week.title}
                </Link>
                <CollapsibleTrigger asChild>
                  <button className="p-1">
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </button>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  {week.lessons.map((lesson) => (
                    <SidebarMenuItem key={lesson.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/week/${week.id}/lesson/${lesson.slug}`}>
                          {lesson.id} {lesson.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
```

### Anti-Patterns to Avoid
- **Importing all Shiki languages:** Only import `solidity`, `typescript`, and `shellscript`. The full bundle is 5MB+. Use the shorthand `codeToHtml` which lazy-loads only requested languages.
- **Client-side Shiki in lesson pages:** Shiki works perfectly in RSC. Moving it client-side adds ~300KB+ to the JS bundle and introduces loading flashes.
- **Hardcoding lesson routing in individual files:** Use the `curriculum.ts` data structure as single source of truth. Dynamic routes `[weekId]`/`[lessonId]` resolve content from this structure.
- **Building custom sidebar from scratch:** shadcn/ui Sidebar handles keyboard navigation, mobile responsive sheet, collapsible state, and accessibility. Hand-rolling loses all of this.
- **Mixing client and server concerns in one component:** Keep Quiz as `"use client"` and CodeBlock/CodeDiff/CalloutBox/InstructorNotes as server components. Don't add `"use client"` to the whole lesson page -- use islands.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Syntax highlighting | Custom regex-based highlighter | Shiki v4.0.1 | TextMate grammars cover 200+ languages, edge cases in string interpolation, nested comments, etc. |
| Sidebar navigation | Custom sidebar with useState | shadcn/ui Sidebar component | Mobile sheet, keyboard nav (Arrow keys), focus management, collapsible persistence |
| Accordion/Collapsible | Custom collapsible with CSS transitions | shadcn/ui Accordion (Radix) | Accessible aria-expanded, keyboard support, animation via CSS data attributes |
| Code copy to clipboard | Custom clipboard logic | navigator.clipboard.writeText | Browser API is standard; just handle the UI state |
| Component variants | Conditional className strings | CVA (class-variance-authority) | Already installed, type-safe variants, composable |
| Route-based active state detection | Manual pathname matching | `usePathname()` from next/navigation | Standard Next.js hook, SSR-compatible |

**Key insight:** Every interactive UI primitive needed (sidebar, accordion, collapsible) exists in shadcn/ui built on Radix. Shiki handles all syntax highlighting complexity. The only custom logic is component composition and styling.

## Common Pitfalls

### Pitfall 1: Shiki in Client Components Causing Bundle Bloat
**What goes wrong:** Importing Shiki in a `"use client"` component adds ~300KB+ WASM + grammars to the client bundle, causing slow page loads and hydration.
**Why it happens:** Shiki needs the Oniguruma WASM engine and TextMate grammars. These are fine on the server but massive on the client.
**How to avoid:** Use Shiki exclusively in async server components. For any interactive parts (copy button), use the client island pattern.
**Warning signs:** Large JS bundle size in Next.js build output, slow page hydration.

### Pitfall 2: Blocking on Shiki Highlighter Creation Per Request
**What goes wrong:** Calling `createHighlighter()` on every render creates a new highlighter instance, re-loading themes and languages each time.
**Why it happens:** Shiki's `createHighlighter` is async and returns a promise. Without memoization, each component call creates a new instance.
**How to avoid:** Use the singleton pattern (module-level `const highlighter = createHighlighter(...)`) or use the shorthand `codeToHtml` which manages a shared instance internally.
**Warning signs:** Slow server-side rendering, high memory usage in production.

### Pitfall 3: SidebarProvider Must Wrap the Layout
**What goes wrong:** Sidebar components throw "useSidebar must be used within SidebarProvider" errors.
**Why it happens:** SidebarProvider creates the React context. It must wrap the entire layout that contains the Sidebar.
**How to avoid:** Place `SidebarProvider` in the route group layout (`app/(academy)/layout.tsx`), wrapping both the `<AppSidebar />` and `<main>{children}</main>`.
**Warning signs:** Runtime error about missing context.

### Pitfall 4: Active Lesson State Not Updating Without Client Component
**What goes wrong:** Sidebar always shows the same lesson as active, doesn't update on navigation.
**Why it happens:** Server components render once; they don't react to client-side navigation. The sidebar needs `usePathname()` to detect the current route.
**How to avoid:** Make the sidebar navigation items a client component (or extract the active-state logic into a client island) that uses `usePathname()` from `next/navigation` to determine which lesson is active.
**Warning signs:** Active highlight stuck on one lesson.

### Pitfall 5: Quiz State Lost on Navigation
**What goes wrong:** Student answers a quiz question, navigates away, comes back -- quiz state is reset.
**Why it happens:** Quiz is a client component with `useState`. State is lost when the component unmounts (page navigation).
**How to avoid:** For Phase 2, this is acceptable (no persistence requirement). Phase 4 adds progress tracking. If needed, use `sessionStorage` as a lightweight temporary store. Do NOT over-engineer persistence in Phase 2.
**Warning signs:** N/A -- this is expected behavior for Phase 2.

### Pitfall 6: Code Diff Line Highlighting Complexity
**What goes wrong:** Trying to highlight specific "changed" lines in CodeDiff is harder than expected with `codeToHtml`.
**Why it happens:** `codeToHtml` returns a flat HTML string. To style individual lines, you need HAST (abstract syntax tree) access.
**How to avoid:** Use `codeToHast` + `hast-util-to-jsx-runtime` for CodeDiff specifically. This gives you per-line control. You can add a custom CSS class to lines that differ between the Solidity and FHEVM panels. Alternatively, use Shiki's built-in line highlighting via the `transformers` API (`transformerNotationHighlight`).
**Warning signs:** Resorting to regex on HTML strings to inject classes.

## Code Examples

Verified patterns from official sources:

### Shiki codeToHast with Line Highlighting (for CodeDiff)
```typescript
// Source: Shiki docs (packages/next.md) + guide/transformers
import type { JSX } from 'react'
import type { BundledLanguage } from 'shiki'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { codeToHast } from 'shiki'

interface HighlightedCodeProps {
  code: string
  lang: BundledLanguage
  highlightLines?: number[]  // 1-indexed lines to highlight
}

async function HighlightedCode({ code, lang, highlightLines = [] }: HighlightedCodeProps) {
  const hast = await codeToHast(code, {
    lang,
    theme: 'vitesse-dark',
    transformers: [
      {
        line(node, line) {
          if (highlightLines.includes(line)) {
            this.addClassToHast(node, 'highlighted-line')
          }
        },
      },
    ],
  })

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
  }) as JSX.Element
}
```

### Quiz Component Structure (Client)
```typescript
// components/content/quiz.tsx
"use client"
import { useState } from "react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuizProps {
  question: QuizQuestion
}

export function Quiz({ question }: QuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleCheck = () => {
    if (selectedIndex !== null) setIsSubmitted(true)
  }

  const isCorrect = selectedIndex === question.correctIndex

  return (
    <div className="my-8 rounded-lg border border-border bg-surface p-6">
      <p className="mb-4 font-medium text-text-primary">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !isSubmitted && setSelectedIndex(i)}
            disabled={isSubmitted}
            className={cn(
              "w-full text-left px-4 py-3 rounded-md border transition-colors",
              isSubmitted && i === question.correctIndex && "border-success bg-success/10",
              isSubmitted && i === selectedIndex && i !== question.correctIndex && "border-error bg-error/10",
              !isSubmitted && i === selectedIndex && "border-primary bg-primary/10",
              !isSubmitted && i !== selectedIndex && "border-border hover:border-border-active",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {!isSubmitted && (
        <button
          onClick={handleCheck}
          disabled={selectedIndex === null}
          className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          Check
        </button>
      )}
      {isSubmitted && (
        <div className={cn("mt-4 p-3 rounded-md text-sm", isCorrect ? "bg-success/10 text-success" : "bg-error/10 text-error")}>
          <p className="font-medium">{isCorrect ? "Correct!" : "Incorrect"}</p>
          <p className="mt-1 text-text-secondary">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
```

### CalloutBox with CVA Variants (Server)
```typescript
// components/content/callout-box.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { Lightbulb, AlertTriangle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "my-6 rounded-lg border-l-4 p-4",
  {
    variants: {
      type: {
        tip: "border-l-primary bg-primary/5",
        warning: "border-l-warning bg-warning/5",
        mistake: "border-l-error bg-error/5",
        info: "border-l-info bg-info/5",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
)

const icons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  mistake: XCircle,
  info: Info,
}

const iconColors = {
  tip: "text-primary",
  warning: "text-warning",
  mistake: "text-error",
  info: "text-info",
}

interface CalloutBoxProps extends VariantProps<typeof calloutVariants> {
  title?: string
  children: React.ReactNode
}

export function CalloutBox({ type = "info", title, children }: CalloutBoxProps) {
  const Icon = icons[type!]
  return (
    <div className={cn(calloutVariants({ type }))}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColors[type!])} />
        <div>
          {title && <p className="mb-1 font-semibold text-text-primary">{title}</p>}
          <div className="text-sm text-text-secondary">{children}</div>
        </div>
      </div>
    </div>
  )
}
```

### InstructorNotes with shadcn Accordion (Server)
```typescript
// components/content/instructor-notes.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BookOpen } from "lucide-react"

interface InstructorNotesProps {
  children: React.ReactNode
}

export function InstructorNotes({ children }: InstructorNotesProps) {
  return (
    <Accordion type="single" collapsible className="my-8">
      <AccordionItem value="instructor-notes" className="rounded-lg border border-border bg-surface/50">
        <AccordionTrigger className="px-4 py-3 text-sm font-medium text-text-muted hover:text-text-secondary">
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Instructor Notes
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 text-sm text-text-secondary">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prism.js / highlight.js (runtime) | Shiki (build-time/server) | Shiki v1.0 (2024) | Zero client JS for highlighting, VS Code accuracy |
| Shiki v0.x (WASM required) | Shiki v1.0+ (JS engine option) | Shiki v1.0 (2024) | Can use JS regex engine if WASM is problematic; default WASM is fine for server |
| Custom sidebar with Headless UI | shadcn/ui Sidebar (Radix-based) | shadcn/ui 2024 | Full sidebar primitive with mobile, keyboard nav, collapsible, inset variants |
| `shiki` shorthand API | `codeToHtml` / `codeToHast` shorthands | Shiki v1.0+ | Shorthands auto-create shared highlighter, lazy-load only needed langs/themes |
| Pages Router layout pattern | App Router route groups + nested layouts | Next.js 13+ | Layouts persist across navigations (no re-render), partial rendering |

**Deprecated/outdated:**
- `shiki` v0.x API (`getHighlighter`): replaced by `createHighlighter` in v1.0+
- Prism.js for new projects: Shiki is the standard for React/Next.js SSR projects
- Manual sidebar state management: shadcn/ui Sidebar handles this internally

## Open Questions

1. **Exact Shiki theme selection**
   - What we know: Must be dark, must complement Zama brand (gold #F5C518, purple #8B5CF6, dark bg #0A0A0F). Available dark themes include `vitesse-dark`, `tokyo-night`, `one-dark-pro`, `dracula`, `github-dark`.
   - What's unclear: Which theme best complements the Zama color palette without clashing.
   - Recommendation: Use `vitesse-dark` -- it has a neutral dark background (#121212) that won't clash with the brand's #0A0A0F, and warm neutral syntax colors. It's also the smallest bundle (13KB vs 33KB for tokyo-night). Can be swapped easily since the theme is a single string parameter. Alternatively, consider customizing Shiki's theme background to `transparent` and letting the CSS `--code-bg` variable control it.

2. **Sidebar width on desktop**
   - What we know: shadcn/ui Sidebar has default widths. The sidebar must show "Week N: [title]" + 5 lesson titles + 1 homework per week.
   - What's unclear: Whether 240px or 280px is optimal for readability.
   - Recommendation: Start with shadcn default (~256px / 16rem). Adjust if lesson titles truncate too aggressively. The `--sidebar-width` CSS variable can be overridden in globals.css.

3. **Mobile sidebar behavior**
   - What we know: shadcn/ui Sidebar supports `collapsible="offcanvas"` which renders as a Sheet (slide-out drawer) on mobile.
   - What's unclear: Whether the hamburger trigger should be in the header or floating.
   - Recommendation: Use `collapsible="offcanvas"` (default behavior). Place `SidebarTrigger` in the main content header area. This is the shadcn standard pattern.

4. **CodeDiff "changed lines" detection strategy**
   - What we know: User wants "changed lines get a subtle background highlight (gold tint on FHEVM side)."
   - What's unclear: Whether to manually specify highlighted lines in props or auto-diff.
   - Recommendation: Use manual `highlightLines` prop on the FHEVM panel. Auto-diffing Solidity vs FHEVM code is unreliable (different line counts, different structure). Content authors (Phase 3) will explicitly specify which FHEVM lines to highlight. This is simpler, more accurate, and gives editorial control.

## Sources

### Primary (HIGH confidence)
- `/shikijs/shiki` (Context7) - Server component patterns, codeToHtml, codeToHast, createHighlighter singleton, custom language loading, transformers API
- `/shadcn-ui/ui` (Context7) - Sidebar component structure (SidebarProvider, Collapsible groups, SidebarMenuButton isActive), Accordion component API
- `/vercel/next.js` (Context7) - App Router layouts, dynamic route segments, route groups, nested layouts
- Shiki `tm-grammars` README (GitHub) - Confirmed Solidity grammar bundled (source: juanfranblanco/vscode-solidity, MIT license)
- Shiki `tm-themes` README (GitHub) - Confirmed `vitesse-dark` (13KB), `tokyo-night` (35KB), `one-dark-pro` (33KB) available

### Secondary (MEDIUM confidence)
- [Shiki languages page](https://shiki.style/languages) - Language registry (page uses dynamic rendering, confirmed via tm-grammars README)
- [Shiki themes page](https://shiki.style/themes) - Theme registry (page uses dynamic rendering, confirmed via tm-themes README)
- [shadcn/ui Sidebar docs](https://ui.shadcn.com/docs/components/radix/sidebar) - Installation, variants, SidebarProvider integration
- [shadcn/ui Accordion docs](https://ui.shadcn.com/docs/components/radix/accordion) - type single/multiple, collapsible prop, defaultValue

### Tertiary (LOW confidence)
- None -- all findings verified through Context7 or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7, versions confirmed via npm, Solidity grammar confirmed in Shiki bundle
- Architecture: HIGH - Patterns sourced from official Next.js, Shiki, and shadcn/ui documentation; consistent with existing Phase 1 patterns
- Pitfalls: HIGH - Common issues documented in official Shiki docs (bundle size, singleton pattern) and shadcn/ui docs (SidebarProvider context requirement)

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (30 days -- all libraries are stable releases)
