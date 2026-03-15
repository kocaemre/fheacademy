# Phase 5: Dashboard, Landing Page, and Polish - Research

**Researched:** 2026-03-14
**Domain:** Landing page design, dashboard UI, AI Grader UX, Hardhat monorepo, responsive design
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Landing Page Design:** Goal is both jury impression AND student onboarding. Sections: Hero + 4-week curriculum overview + features section (code comparisons, quizzes, AI Grader, progress tracking) + CTA. Hero has bold headline with subtle animation (animated gradient or particle effect in background), Zama dark theme with gold/purple accents. Single "Start Learning" button linking to first lesson -- no wallet connect on landing page. Landing page is root (/) with no sidebar -- full-width marketing layout.
- **Dashboard Layout:** Dedicated /dashboard route inside (academy) layout with sidebar. "Continue Learning" button navigates to next uncompleted lesson in curriculum order; if all complete, show congratulations state. Per-week progress: 4 cards in grid, each with week title, progress bar, fraction (e.g., "4/6"), and week goal -- uses existing ProgressBar component. Accessible without wallet -- shows localStorage progress for anonymous users, Supabase progress for connected users.
- **AI Grader UX:** Lives on each homework page, below the rubric -- no separate tool page. Flow: paste code textarea -> "Generate Grading Prompt" button -> readonly output area with "Copy to Clipboard" button. Generated prompt includes: homework rubric criteria + student's pasted code + grading instructions. Collapsed by default (collapsible section like instructor notes) -- students expand when needed.
- **Hardhat Monorepo Structure:** Subdirectory in same repo (e.g., /hardhat or /contracts folder). Per-week organization: hardhat/week-N/starter/ and hardhat/week-N/solution/. Starter code compiles with TODO placeholders (stub functions that compile but don't pass tests); solution code is completed version. Uses fhevm-hardhat-plugin with mock mode for local testing -- no real FHE network dependency.
- **Responsive Design:** Full responsive: desktop (1280px+), tablet (768px-1279px), phone (375px+). Mobile sidebar: sheet overlay (hamburger menu opens slide-over sheet) -- leverages existing shadcn sidebar Sheet component. CodeDiff: two-pane layout stacks vertically on mobile. Landing page: all sections stack vertically on mobile.
- **Navigation & Routing:** Landing page at / (no sidebar, full-width) -> "Start Learning" enters (academy) layout with sidebar. Sidebar header: "FHE Academy" title links back to landing page (/); "Dashboard" link also in sidebar header. Homework pages accessible from both sidebar and week overview pages.

### Claude's Discretion
- Landing page animation implementation (gradient, particles, etc.)
- Dashboard card styling details
- AI Grader prompt engineering (exact wording of grading instructions)
- Hardhat project configuration details (package.json, tsconfig, etc.)
- Responsive breakpoint fine-tuning
- Loading states and transitions

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HW-06 | AI Grader -- copy-paste prompt generator for homework feedback (model-agnostic) | AI Grader component pattern using Accordion for collapsible section, textarea for code input, template-string prompt builder combining rubric + student code, Clipboard API for copy |
| PLAT-02 | Landing page with hero section and Zama-branded CTA | Full-width landing page at / outside (academy) layout, CSS gradient animation for hero background, curriculum data from lib/curriculum.ts for overview section |
| PLAT-03 | Dashboard showing overall progress and "Continue Learning" button | /dashboard route inside (academy) layout, useProgress() hook for all progress data, curriculum traversal for finding next uncompleted lesson |
| DSGN-03 | Responsive layout -- desktop-first with tablet/mobile support | Tailwind responsive utilities (sm/md/lg breakpoints), shadcn Sheet for mobile sidebar, CSS grid for dashboard cards with responsive columns |
| DSGN-04 | Visual FHE concept diagrams | Out of scope per CONTEXT.md decisions (not mentioned); landing page features section may serve this purpose |
| REPO-01 | Hardhat monorepo with starter code per week | /hardhat directory at project root, per-week folders with Hardhat + fhevm plugin configuration, TODO-based starter contracts |
| REPO-02 | Hardhat monorepo with solution code per week | Matching /hardhat/week-N/solution/ folders with completed implementations |
| REPO-03 | Both starter and solution projects compile | Each week's hardhat project must have valid hardhat.config.ts with fhevm plugin, compilable contracts |
</phase_requirements>

## Summary

Phase 5 is the final phase before the Zama Bounty Track submission (March 15, 2026). It covers five distinct deliverables: a polished landing page, a progress dashboard, an AI Grader component for homework pages, a Hardhat monorepo with starter/solution code, and responsive design across all viewports.

The project is a Next.js 15 App Router application with Tailwind v4, shadcn/ui, and a well-established component library. The existing codebase provides strong foundations: `useProgress()` hook with `weekProgress()` and `overallProgress()` methods, `ProgressBar` component, `curriculum` data with all weeks/lessons/homeworks, `Accordion` component for collapsible sections, and `Sheet` component for mobile overlays. The current `app/page.tsx` is a minimal placeholder ready for full landing page replacement.

**Primary recommendation:** Split into 3 plans: (1) Landing Page + Responsive foundation, (2) Dashboard + AI Grader, (3) Hardhat monorepo. The landing page and dashboard are the highest-jury-impact items and should come first.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.12 | App Router, SSR, routing | Already the project framework |
| Tailwind CSS | 4.2.1 | Utility-first styling, responsive | Already installed, v4 with CSS custom properties |
| shadcn/ui (radix-ui) | 1.4.3 | Accordion, Sheet, Skeleton, Button | Already installed, project UI system |
| lucide-react | 0.576.0 | Icons | Already installed |
| wagmi + RainbowKit | 2.19.5 / 2.2.10 | Wallet connection (used in sidebar/header) | Already installed |

### For Hardhat Monorepo (New Dependencies in /hardhat subdirectories)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| hardhat | latest | Smart contract development | Industry standard for Ethereum development |
| fhevm | latest | FHEVM Solidity library + Hardhat plugin | Zama's official package, matches curriculum content |
| @nomicfoundation/hardhat-toolbox | latest | Testing, compilation toolchain | Standard Hardhat companion |

### No New Dependencies for Next.js App
The landing page animation, dashboard, AI Grader, and responsive design all use existing libraries. No new npm packages needed for the web application.

## Architecture Patterns

### Recommended Project Structure

```
app/
  page.tsx                           # Landing page (full-width, no sidebar)
  (academy)/
    layout.tsx                       # Existing academy layout with sidebar
    dashboard/
      page.tsx                       # NEW: Dashboard page
    week/[weekId]/homework/[homeworkSlug]/
      page.tsx                       # MODIFIED: Add AI Grader section
components/
  content/
    ai-grader.tsx                    # NEW: AI Grader client component
  landing/
    hero-section.tsx                 # NEW: Hero with animated gradient
    curriculum-overview.tsx          # NEW: 4-week overview grid
    features-section.tsx             # NEW: Features showcase
    cta-section.tsx                  # NEW: Call to action
hardhat/
  week-1/
    starter/                         # Hardhat project with TODO stubs
      contracts/
      test/
      hardhat.config.ts
      package.json
    solution/                        # Complete implementation
      contracts/
      test/
      hardhat.config.ts
      package.json
  week-2/ ...
  week-3/ ...
  week-4/ ...
```

### Pattern 1: Landing Page as Separate Layout

**What:** The landing page at `/` renders outside the `(academy)` route group, getting its own full-width layout without sidebar.
**When to use:** When a page needs fundamentally different chrome (no sidebar, different header).
**How it works:** `app/page.tsx` is already outside `app/(academy)/`, so it renders with only the root layout (`app/layout.tsx`) which has ThirdwebProviderWrapper but no sidebar. This is the existing architecture -- the landing page just needs its content replaced.

### Pattern 2: Dashboard with useProgress Hook

**What:** Dashboard is a client component (or has client islands) that reads progress via `useProgress()` hook.
**When to use:** Any page that needs to display progress data.
**Key implementation detail:** The `useProgress()` hook provides:
- `overallProgress()` -> `{ completed: number, total: number }`
- `weekProgress(weekId)` -> `{ completed: number, total: number }`
- `isComplete(itemId)` -> `boolean`
- `isLoading` -> `boolean`

The "Continue Learning" button needs to find the first uncompleted item. Use `getAllItems()` from `lib/progress.ts` combined with `isComplete()` to find the first `false` entry, then map the item ID back to a URL using the `"lesson-{weekId}-{slug}"` or `"homework-{weekId}-{slug}"` format.

```typescript
// Find next uncompleted item for "Continue Learning"
function getNextLesson(isComplete: (id: string) => boolean): string {
  const allItems = getAllItems() // from lib/progress.ts
  const nextItem = allItems.find(id => !isComplete(id))
  if (!nextItem) return "/dashboard" // all complete

  // Parse item ID: "lesson-1-why-privacy-matters" or "homework-1-temperature-converter-migration"
  const parts = nextItem.split("-")
  const type = parts[0] // "lesson" or "homework"
  const weekId = parts[1]
  const slug = parts.slice(2).join("-")

  if (type === "lesson") return `/week/${weekId}/lesson/${slug}`
  return `/week/${weekId}/homework/${slug}`
}
```

### Pattern 3: AI Grader as Collapsible Client Component

**What:** A client component using Accordion (same pattern as instructor notes) that generates a grading prompt from rubric + student code.
**When to use:** On each homework page, below the rubric section.
**Key implementation detail:**

The AI Grader needs:
1. A textarea for students to paste their Solidity code
2. A "Generate Grading Prompt" button that concatenates rubric criteria + student code + grading instructions
3. A readonly textarea showing the generated prompt
4. A "Copy to Clipboard" button using `navigator.clipboard.writeText()`

The rubric data is currently rendered as HTML tables in homework content files. The AI Grader component should accept rubric criteria as a prop (structured data), not try to scrape the HTML.

```typescript
interface AIGraderProps {
  homeworkTitle: string
  rubricCriteria: Array<{
    criterion: string
    weight: string
    exceeds: string
    meets: string
    below: string
  }>
}
```

### Pattern 4: CSS Animated Gradient for Hero Background

**What:** A subtle animated gradient background using CSS keyframes -- no JS animation library needed.
**When to use:** Landing page hero section.
**Implementation:**

```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-gradient {
  background: linear-gradient(135deg, #0A0A0F 0%, #1A1035 25%, #0A0A0F 50%, #1A1A24 75%, #0A0A0F 100%);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
```

This uses the existing Zama brand colors (#0A0A0F background, purple #8B5CF6, gold #F5C518) and avoids heavy JS animation libraries. The gradient is subtle -- dark purple hints shifting in the background.

### Pattern 5: Hardhat Monorepo as Independent Subdirectories

**What:** Each week has its own independent Hardhat project (own package.json, hardhat.config.ts).
**When to use:** When you need isolated compilable projects that students can clone individually.
**Key implementation detail:**

Per Context7 FHEVM docs, the hardhat.config.ts needs:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "fhevm/hardhat"; // FHEVM plugin -- enables mock mode

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat", // mock mode by default
};

export default config;
```

This matches what Lesson 1.3 teaches students. Each `starter/` project has contracts with TODO comments and stub implementations. Each `solution/` project has the completed code.

### Anti-Patterns to Avoid
- **Landing page inside (academy) layout:** The landing page MUST be at `app/page.tsx` outside the route group -- it has no sidebar.
- **Dashboard as server component:** Progress data comes from client-side context (useProgress) -- the dashboard must be a client component or use client islands.
- **AI Grader making API calls:** The grader generates a copy-paste prompt only -- it never calls an AI API.
- **Shared node_modules for Hardhat weeks:** Each week is an independent project with its own dependencies -- students download one week at a time.
- **Heavy animation libraries for landing page:** Do not install framer-motion, GSAP, Three.js, or similar. CSS animations and transitions are sufficient for the subtle gradient effect described in the decisions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sections | Custom show/hide logic | shadcn Accordion component (already installed) | Handles animation, accessibility, keyboard nav |
| Mobile sidebar overlay | Custom drawer component | shadcn Sheet + existing Sidebar (already installed) | Already imported by sidebar, handles focus trap, backdrop |
| Progress calculation | Custom counting logic | useProgress() hook (already built) | Handles localStorage, Supabase sync, provides weekProgress/overallProgress |
| Clipboard copy | Manual textarea + execCommand | navigator.clipboard.writeText() | Modern API, handles permissions, fallback not needed for modern browsers |
| Responsive grid | Custom media queries | Tailwind responsive prefixes (sm:, md:, lg:) | Project already uses Tailwind v4 extensively |
| Loading skeletons | Custom pulse animations | shadcn Skeleton component (already installed) | Consistent with existing UI system |

**Key insight:** The existing codebase has nearly every UI primitive needed. Phase 5 is assembly, not construction -- combining existing components into new page layouts.

## Common Pitfalls

### Pitfall 1: Landing Page Not Accessible Without Auth
**What goes wrong:** Landing page accidentally imports ProgressProvider or requires wallet connection.
**Why it happens:** Copy-pasting patterns from (academy) pages that assume ProgressProvider context.
**How to avoid:** Landing page is at `app/page.tsx`, outside (academy) layout. It should be a pure server component with no client hooks. It imports data from `lib/curriculum.ts` (static data, no context needed).
**Warning signs:** "useProgress must be used within a ProgressProvider" error on landing page.

### Pitfall 2: "Continue Learning" URL Parsing Error
**What goes wrong:** Item IDs like `"lesson-1-why-privacy-matters"` get split incorrectly -- the slug contains hyphens.
**Why it happens:** Naive `split("-")` assumes only 3 parts.
**How to avoid:** Split with limit or regex: `const [type, weekId, ...slugParts] = id.split("-"); const slug = slugParts.join("-");`
**Warning signs:** 404 errors when clicking "Continue Learning".

### Pitfall 3: AI Grader Rubric Data Duplication
**What goes wrong:** Rubric criteria hardcoded in both the homework content TSX and the AI Grader component.
**Why it happens:** Rubric is currently rendered as HTML table in homework content -- no structured data source.
**How to avoid:** Extract rubric data as a structured object that both the rubric table and AI Grader consume. Or accept rubric as props to AIGrader component, passed from the homework page.
**Warning signs:** Rubric in grading prompt doesn't match rubric displayed on page.

### Pitfall 4: Hardhat Projects Not Compiling
**What goes wrong:** Starter or solution contracts fail to compile because of missing imports, wrong Solidity version, or fhevm package not installed.
**Why it happens:** Hardhat projects are disconnected from the Next.js app -- easy to forget to test them.
**How to avoid:** Each week's starter and solution must be independently testable: `cd hardhat/week-1/starter && npm install && npx hardhat compile`. Verify all 8 projects compile (4 weeks x 2 variants).
**Warning signs:** CI/build failures, students reporting compilation errors.

### Pitfall 5: Mobile Sidebar Already Implemented by shadcn
**What goes wrong:** Building a custom mobile sheet overlay when the shadcn Sidebar component already handles this.
**Why it happens:** Not reading the shadcn sidebar documentation -- it uses Sheet internally for mobile.
**How to avoid:** The shadcn `<SidebarProvider>` + `<Sidebar>` already renders as a Sheet on mobile viewports. The `<SidebarTrigger>` (hamburger) is already in the header. Just verify it works at mobile breakpoints.
**Warning signs:** Duplicate sidebar appearing, conflicting open/close states.

### Pitfall 6: Responsive CodeDiff Breaking on Mobile
**What goes wrong:** Side-by-side code comparison becomes unreadable on narrow viewports.
**Why it happens:** CodeDiff uses a 2-column grid that doesn't stack.
**How to avoid:** Add responsive classes: `grid-cols-1 md:grid-cols-2` to CodeDiff wrapper. Verify code blocks have `overflow-x-auto` for horizontal scrolling.
**Warning signs:** Horizontal scrollbar on entire page, text overflow.

## Code Examples

### Landing Page Hero Section (Server Component)

```typescript
// components/landing/hero-section.tsx
// No client hooks needed -- pure presentational

import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-sm text-primary uppercase tracking-widest mb-6 font-medium">
          4-Week FHEVM Developer Bootcamp
        </p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary mb-6">
          Learn to Build{" "}
          <span className="text-primary">Confidential</span>{" "}
          Smart Contracts
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Master FHEVM development with hands-on lessons, side-by-side code
          comparisons, and graded homework. Go from Solidity to fully
          encrypted dApps.
        </p>
        <Link
          href="/week/1/lesson/why-privacy-matters"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          Start Learning
        </Link>
      </div>
    </section>
  )
}
```

### Dashboard Page (Client Component)

```typescript
// app/(academy)/dashboard/page.tsx
"use client"

import { useProgress } from "@/components/providers/progress-provider"
import { curriculum } from "@/lib/curriculum"
import { getAllItems } from "@/lib/progress"
import { ProgressBar } from "@/components/ui/progress-bar"
import Link from "next/link"

function getNextLessonUrl(isComplete: (id: string) => boolean): string | null {
  const allItems = getAllItems()
  const nextItem = allItems.find(id => !isComplete(id))
  if (!nextItem) return null

  const [type, weekId, ...slugParts] = nextItem.split("-")
  const slug = slugParts.join("-")

  if (type === "lesson") return `/week/${weekId}/lesson/${slug}`
  return `/week/${weekId}/homework/${slug}`
}

export default function DashboardPage() {
  const { weekProgress, overallProgress, isComplete, isLoading } = useProgress()
  const overall = overallProgress()
  const nextUrl = getNextLessonUrl(isComplete)

  // ... render dashboard
}
```

### AI Grader Component (Client Component)

```typescript
// components/content/ai-grader.tsx
"use client"

import { useState, useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Copy, Check, Bot } from "lucide-react"

interface RubricCriterion {
  criterion: string
  weight: string
  exceeds: string
  meets: string
  below: string
}

interface AIGraderProps {
  homeworkTitle: string
  rubricCriteria: RubricCriterion[]
}

function buildPrompt(title: string, criteria: RubricCriterion[], code: string): string {
  const rubricText = criteria
    .map(c => `- ${c.criterion} (${c.weight}): Exceeds=${c.exceeds}; Meets=${c.meets}; Below=${c.below}`)
    .join("\n")

  return `You are grading a student's FHEVM homework submission.

## Assignment: ${title}

## Grading Rubric
${rubricText}

## Student's Code
\`\`\`solidity
${code}
\`\`\`

## Instructions
Grade the student's code against each rubric criterion. For each criterion:
1. State PASS or FAIL
2. Provide a brief explanation of what the student did well or what's missing
3. Assign a score within the criterion's weight range

End with an overall score and summary of strengths and areas for improvement.`
}
```

### Hardhat Week Config

```typescript
// hardhat/week-1/starter/hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "fhevm/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
};

export default config;
```

### Responsive CodeDiff Fix

```typescript
// Existing CodeDiff component likely has a grid container
// Add responsive stacking:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Solidity pane */}
  <div className="overflow-x-auto">...</div>
  {/* FHEVM pane */}
  <div className="overflow-x-auto">...</div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| fhevm-hardhat-plugin separate package | `import "fhevm/hardhat"` (bundled with fhevm) | FHEVM v0.9 | Import path changed -- matches what Lesson 1.3 teaches |
| navigator.clipboard requires HTTPS only | navigator.clipboard works in all modern browsers, localhost included | 2024 | Clipboard API reliable for AI Grader copy button |
| Tailwind v3 config in tailwind.config.js | Tailwind v4 uses CSS @theme directive | 2025 | Responsive utilities same syntax, config approach different |

**Deprecated/outdated:**
- `fhevm-hardhat-plugin` as separate package: Now bundled as `fhevm/hardhat`
- `document.execCommand("copy")`: Deprecated in favor of `navigator.clipboard.writeText()`

## Open Questions

1. **Hardhat contract content for each week**
   - What we know: Curriculum defines 4 weeks with specific homework topics (Temperature Converter, Confidential ERC-20, Sealed-Bid Auction, Capstone). Lesson 1.3 teaches the dev environment setup.
   - What's unclear: Exact starter code content for weeks 2-4 must be authored based on homework specifications. The solution code similarly needs to be authored.
   - Recommendation: Use homework deliverables from `lib/curriculum.ts` as the specification for what each contract should contain. Starter code has the structure with TODO comments; solution code implements all deliverables.

2. **DSGN-04 (Visual FHE concept diagrams)**
   - What we know: Listed as a phase requirement but not discussed in CONTEXT.md decisions.
   - What's unclear: Whether this is addressed by the landing page features section or requires separate diagram components.
   - Recommendation: Consider the landing page features section (which showcases code comparisons, quizzes, etc.) as fulfilling this requirement. The curriculum already has visual code comparisons via CodeDiff.

3. **Landing page animation performance**
   - What we know: CSS gradient animation is lightweight. User wants "subtle, not distracting."
   - What's unclear: Whether a particle effect or just gradient is better for jury impression vs. performance.
   - Recommendation: Start with CSS animated gradient (zero JS, zero dependencies). If it looks insufficient, add a simple canvas particle overlay as enhancement. Gradient is the safe minimum viable animation.

## Sources

### Primary (HIGH confidence)
- Context7 `/zama-ai/fhevm` - Hardhat plugin setup, mock mode configuration, test patterns
- Existing codebase analysis - All component APIs, routing structure, progress hooks verified by reading source files

### Secondary (MEDIUM confidence)
- Tailwind v4 responsive utilities - Same sm/md/lg breakpoint syntax as v3, verified in existing globals.css usage
- navigator.clipboard API - Standard Web API, no external verification needed

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or Context7

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, versions confirmed from package.json
- Architecture: HIGH - Routing structure, component APIs, and hooks verified from source code
- Pitfalls: HIGH - Based on actual codebase patterns (item ID format, layout boundaries, component APIs)
- Hardhat monorepo: MEDIUM - fhevm plugin config verified via Context7, but actual contract content needs authoring

**Research date:** 2026-03-14
**Valid until:** 2026-03-28 (stable -- existing codebase, no fast-moving dependencies)
