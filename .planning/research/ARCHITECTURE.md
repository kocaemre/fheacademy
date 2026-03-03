# Architecture Patterns

**Domain:** Developer education platform (interactive bootcamp)
**Researched:** 2026-03-03
**Confidence:** HIGH (Next.js App Router patterns well-documented; Supabase + thirdweb integration patterns verified)

## Recommended Architecture

### High-Level Overview

```
+-------------------------------------------------------+
|                    Vercel Edge                         |
|  +--------------------------------------------------+ |
|  |              Next.js 14 App Router               | |
|  |                                                  | |
|  |  +-------------+  +---------------------------+  | |
|  |  | Root Layout  |  |    /api/auth Routes       |  | |
|  |  | (ThirdwebP.) |  |  (JWT sign + verify)      |  | |
|  |  +------+------+  +------------+--------------+  | |
|  |         |                       |                 | |
|  |  +------v---------+    +-------v-----------+     | |
|  |  | Academy Layout |    | Supabase Admin    |     | |
|  |  | (Sidebar+Nav)  |    | (service_role)    |     | |
|  |  +------+---------+    +-------+-----------+     | |
|  |         |                       |                 | |
|  |  +------v---------+            |                 | |
|  |  | Lesson Pages   |            |                 | |
|  |  | (Static TSX)   |            |                 | |
|  |  +----------------+            |                 | |
|  +--------------------------------------------------+ |
+-------------------------------------------------------+
         |                          |
         | Client-side              | Server-side
         v                          v
+----------------+          +----------------+
| thirdweb SDK   |          | Supabase       |
| (wallet conn.) |          | (Postgres DB)  |
+----------------+          +----------------+
```

The platform is a **static-content-heavy education site** with a thin data layer. Content (lessons, quizzes, homework specs) is hardcoded TSX -- no CMS, no MDX, no dynamic content fetching. The only dynamic data is user progress (which lessons are complete, quiz scores). This means the architecture is fundamentally a **static site with authenticated state persistence**.

### Architecture Decision: Simplified Auth Flow

Given that content is publicly accessible and wallet auth only gates progress tracking, use a **simplified approach** rather than full JWT-based RLS:

1. **Content layer** -- entirely public, server-rendered TSX pages. No auth required to read lessons.
2. **Auth layer** -- thirdweb ConnectButton for wallet connection. The wallet address serves as the user identifier.
3. **Data layer** -- Next.js API Route Handlers (server-side) use Supabase service_role client to read/write progress, keyed by wallet address. The API routes verify the wallet address from thirdweb's auth payload before writing.

This avoids the complexity of custom JWT signing for Supabase RLS while still providing secure, per-user progress tracking. The service_role client is only used server-side in API routes, never exposed to the client.

## Component Boundaries

| Component | Responsibility | Communicates With | Rendering |
|-----------|---------------|-------------------|-----------|
| **Root Layout** (`app/layout.tsx`) | HTML shell, ThirdwebProvider, global fonts/styles | All child layouts | Server |
| **Landing Page** (`app/page.tsx`) | Marketing/hero, course overview, CTA | None (static) | Server |
| **Academy Layout** (`app/(academy)/layout.tsx`) | Persistent sidebar, top nav, progress context | Sidebar, ProgressProvider, all lesson pages | Server + Client |
| **Sidebar** (`components/Sidebar.tsx`) | Week/lesson navigation tree, active state, completion indicators | ProgressProvider (reads), Next.js Link | Client |
| **Dashboard** (`app/(academy)/dashboard/page.tsx`) | Overall progress overview, week cards, continue button | ProgressProvider (reads) | Client |
| **Syllabus** (`app/(academy)/syllabus/page.tsx`) | Full curriculum overview | None (static) | Server |
| **Week Overview** (`app/(academy)/week/[weekId]/page.tsx`) | Week intro, lesson list, homework link, week progress | ProgressProvider (reads) | Client |
| **Lesson Page** (`app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx`) | Lesson content, embedded quizzes, mark-as-complete | CodeDiff, Quiz, InstructorNotes, ProgressProvider | Client (interactive parts) |
| **CodeDiff** (`components/CodeDiff.tsx`) | Side-by-side Solidity vs FHEVM code comparison | Shiki (syntax highlighting) | Server (pre-highlighted) |
| **Quiz** (`components/Quiz.tsx`) | Interactive multiple-choice questions, score tracking | ProgressProvider (writes quiz results) | Client |
| **InstructorNotes** (`components/InstructorNotes.tsx`) | Collapsible notes panel | None (self-contained) | Client |
| **MarkAsComplete** (`components/MarkAsComplete.tsx`) | Button + state for lesson completion | ProgressProvider (writes) | Client |
| **ProgressProvider** (`providers/ProgressProvider.tsx`) | React Context holding user progress, sync to Supabase | API Routes, localStorage (fallback) | Client |
| **ConnectWallet** (`components/ConnectWallet.tsx`) | Wrapper around thirdweb ConnectButton | thirdweb SDK, ProgressProvider (triggers sync) | Client |
| **ProgressBar** (`components/ProgressBar.tsx`) | Visual progress indicator (lesson/week/overall) | ProgressProvider (reads) | Client |
| **API Route: Progress** (`app/api/progress/route.ts`) | GET/PUT progress data for a wallet address | Supabase service_role client | Server |
| **Homework Page** (`app/(academy)/week/[weekId]/homework/page.tsx`) | Homework spec, rubric, AI Grader prompt generator | None (mostly static) | Server |
| **AI Grader** (`components/AIGrader.tsx`) | Generates copy-paste prompt for homework feedback | None (client-side text generation) | Client |

## Data Flow

### 1. Content Flow (Static -- No Data Fetching)

```
TSX Lesson Files (hardcoded)
    |
    v
Next.js Server Render
    |
    v
HTML + CSS to Browser
    |
    v
Hydrate interactive islands (Quiz, MarkAsComplete, etc.)
```

Lesson content is pure TSX. No database queries. No API calls. Pages are effectively static and can be ISR/SSG optimized by Vercel. This is the correct architecture for a 20-lesson bootcamp with fixed content.

### 2. Authentication Flow

```
User clicks "Connect Wallet"
    |
    v
thirdweb ConnectButton opens wallet modal
    |
    v
User selects wallet (MetaMask, WalletConnect, etc.)
    |
    v
Wallet connected -- address available via useActiveAccount()
    |
    v
ProgressProvider detects wallet connection
    |
    v
ProgressProvider calls GET /api/progress?address=0x...
    |
    v
API route fetches progress from Supabase (service_role)
    |
    v
Progress loaded into React Context
    |
    v
Sidebar, ProgressBars, MarkAsComplete all update from context
```

### 3. Progress Write Flow

```
User clicks "Mark as Complete" or completes Quiz
    |
    v
ProgressProvider.markLessonComplete(weekId, lessonId) called
    |
    v
Optimistic update in React Context (immediate UI feedback)
    |
    v
POST /api/progress with { address, weekId, lessonId, quizScore? }
    |
    v
API Route validates request, upserts to Supabase
    |
    v
Supabase stores: { wallet_address, lesson_id, completed_at, quiz_score }
    |
    v
On failure: retry queue or revert optimistic update
```

### 4. Progress Sync Flow (Cross-Device)

```
User connects wallet on new device
    |
    v
ProgressProvider fetches all progress for wallet address
    |
    v
Merges with any localStorage data (localStorage = offline fallback)
    |
    v
Full progress state hydrated from Supabase
```

### 5. Unauthenticated Flow (No Wallet)

```
User browses lessons without wallet
    |
    v
All content visible (public)
    |
    v
ProgressProvider uses localStorage-only mode
    |
    v
"Connect wallet to save progress across devices" prompt shown
    |
    v
Quiz scores and completion tracked in localStorage only
```

## File System Structure

```
app/
  layout.tsx                          # Root: <html>, ThirdwebProvider, fonts
  page.tsx                            # Landing page (public marketing)
  globals.css                         # Tailwind + custom theme variables

  (academy)/                          # Route group (no URL segment)
    layout.tsx                        # Academy: Sidebar + ProgressProvider
    dashboard/
      page.tsx                        # User dashboard with progress overview
    syllabus/
      page.tsx                        # Full curriculum overview
    week/
      [weekId]/
        page.tsx                      # Week overview (intro + lesson list)
        lesson/
          [lessonId]/
            page.tsx                  # Individual lesson content
        homework/
          page.tsx                    # Weekly homework spec + AI Grader

  api/
    progress/
      route.ts                        # GET/POST progress data

components/
  ui/                                 # shadcn/ui components (Button, Card, etc.)
  Sidebar.tsx                         # Navigation tree
  CodeDiff.tsx                        # Side-by-side code comparison
  CodeBlock.tsx                       # Single highlighted code block
  Quiz.tsx                            # Interactive quiz component
  InstructorNotes.tsx                 # Collapsible notes
  MarkAsComplete.tsx                  # Lesson completion button
  ProgressBar.tsx                     # Visual progress indicator
  ConnectWallet.tsx                   # thirdweb ConnectButton wrapper
  AIGrader.tsx                        # Homework prompt generator
  WeekCard.tsx                        # Dashboard week summary card
  LessonCard.tsx                      # Lesson list item with status

providers/
  ThirdwebClientProvider.tsx          # thirdweb client + provider setup
  ProgressProvider.tsx                # Progress context + Supabase sync

lib/
  supabase.ts                        # Supabase client (server-side, service_role)
  curriculum.ts                       # Curriculum metadata (week/lesson IDs, titles, order)
  progress.ts                         # Progress utility functions
  constants.ts                        # Theme colors, config values

content/
  week1/
    lesson1.tsx                       # Exported lesson content component
    lesson2.tsx
    ...
  week2/
    ...
```

### Key Structural Decisions

**Route Group `(academy)/`**: Wraps all bootcamp pages in the academy layout (sidebar + progress) without adding `/academy/` to the URL. Landing page stays outside this group.

**Content in `content/` not `app/`**: Lesson TSX files live in a `content/` directory and are imported by the dynamic `[lessonId]/page.tsx`. This separates content authoring from routing logic while keeping full TSX component access. The page.tsx acts as a thin wrapper that imports the correct content component based on the route param.

**Curriculum metadata in `lib/curriculum.ts`**: A single source of truth for week/lesson ordering, titles, and IDs. The Sidebar, Dashboard, and navigation all read from this. Avoids hardcoding navigation structure in multiple places.

## Patterns to Follow

### Pattern 1: Server Components with Client Islands

**What:** Default to Server Components for all layout and content. Wrap only interactive parts in `"use client"` components.
**When:** Every component unless it needs useState, useEffect, event handlers, or browser APIs.
**Why:** Smaller bundles, faster initial load, better SEO for lesson content.
**Example:**

```typescript
// app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx
// This is a SERVER component -- no "use client" directive

import { getLessonContent } from '@/content';
import { getLessonMeta } from '@/lib/curriculum';
import { Quiz } from '@/components/Quiz';          // Client component
import { MarkAsComplete } from '@/components/MarkAsComplete'; // Client component
import { CodeDiff } from '@/components/CodeDiff';  // Server component (Shiki)
import { InstructorNotes } from '@/components/InstructorNotes'; // Client component

export default function LessonPage({ params }: { params: { weekId: string; lessonId: string } }) {
  const meta = getLessonMeta(params.weekId, params.lessonId);
  const LessonContent = getLessonContent(params.weekId, params.lessonId);

  return (
    <article className="max-w-4xl mx-auto">
      <h1>{meta.title}</h1>
      <LessonContent />
      <MarkAsComplete weekId={params.weekId} lessonId={params.lessonId} />
    </article>
  );
}
```

### Pattern 2: Shiki for Server-Side Syntax Highlighting

**What:** Use Shiki to highlight code at build/render time in Server Components. Zero client-side JS for syntax highlighting.
**When:** All code blocks, including both sides of CodeDiff.
**Why:** Shiki uses VS Code's TextMate grammars for accurate Solidity highlighting. Renders to HTML on the server -- no JS payload to the client.
**Example:**

```typescript
// components/CodeDiff.tsx (Server Component)
import { codeToHtml } from 'shiki';

interface CodeDiffProps {
  before: string;
  after: string;
  language: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export async function CodeDiff({ before, after, language, beforeLabel = "Solidity", afterLabel = "FHEVM" }: CodeDiffProps) {
  const [beforeHtml, afterHtml] = await Promise.all([
    codeToHtml(before, { lang: language, theme: 'one-dark-pro' }),
    codeToHtml(after, { lang: language, theme: 'one-dark-pro' }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-4 my-8">
      <div>
        <div className="text-sm font-mono text-gray-400 mb-2">{beforeLabel}</div>
        <div dangerouslySetInnerHTML={{ __html: beforeHtml }} />
      </div>
      <div>
        <div className="text-sm font-mono text-gold-400 mb-2">{afterLabel}</div>
        <div dangerouslySetInnerHTML={{ __html: afterHtml }} />
      </div>
    </div>
  );
}
```

### Pattern 3: Optimistic Updates with Server Sync

**What:** Update UI immediately on user action, sync to Supabase in background.
**When:** Mark-as-complete, quiz submission -- any progress write.
**Why:** Instant feedback. Users should not wait for a network round-trip to see their checkbox fill.
**Example:**

```typescript
// providers/ProgressProvider.tsx (simplified)
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface Progress {
  completedLessons: Set<string>;  // "week1-lesson1" format
  quizScores: Record<string, number>;
}

const ProgressContext = createContext<{
  progress: Progress;
  markComplete: (weekId: string, lessonId: string) => void;
  isComplete: (weekId: string, lessonId: string) => boolean;
} | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const [progress, setProgress] = useState<Progress>({
    completedLessons: new Set(),
    quizScores: {},
  });

  // Fetch from Supabase when wallet connects
  useEffect(() => {
    if (account?.address) {
      fetch(`/api/progress?address=${account.address}`)
        .then(res => res.json())
        .then(data => {
          setProgress({
            completedLessons: new Set(data.completedLessons),
            quizScores: data.quizScores,
          });
        });
    }
  }, [account?.address]);

  const markComplete = useCallback((weekId: string, lessonId: string) => {
    const key = `${weekId}-${lessonId}`;
    // Optimistic update
    setProgress(prev => ({
      ...prev,
      completedLessons: new Set([...prev.completedLessons, key]),
    }));
    // Persist to server
    if (account?.address) {
      fetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({ address: account.address, weekId, lessonId }),
      });
    }
    // Always persist to localStorage as fallback
    // ...localStorage logic...
  }, [account?.address]);

  return (
    <ProgressContext.Provider value={{ progress, markComplete, isComplete: (w, l) => progress.completedLessons.has(`${w}-${l}`) }}>
      {children}
    </ProgressContext.Provider>
  );
}
```

### Pattern 4: Curriculum Metadata as Single Source of Truth

**What:** A typed data structure defining all weeks, lessons, their order, and relationships.
**When:** Sidebar navigation, progress calculation, breadcrumbs, next/prev lesson links.
**Why:** Prevents navigation and content getting out of sync. One place to add a new lesson.
**Example:**

```typescript
// lib/curriculum.ts
export interface LessonMeta {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  hasQuiz: boolean;
  quizQuestionCount?: number;
}

export interface WeekMeta {
  id: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
  hasHomework: boolean;
}

export const curriculum: WeekMeta[] = [
  {
    id: 'week1',
    title: 'Week 1: FHE Foundations',
    description: 'From Solidity basics to encrypted types',
    hasHomework: true,
    lessons: [
      { id: 'lesson1', title: 'Why Confidentiality Matters', description: '...', estimatedMinutes: 15, hasQuiz: true, quizQuestionCount: 3 },
      { id: 'lesson2', title: 'Encrypted Types Deep Dive', description: '...', estimatedMinutes: 20, hasQuiz: true, quizQuestionCount: 3 },
      // ...
    ],
  },
  // weeks 2-4...
];

// Helper functions
export function getLessonMeta(weekId: string, lessonId: string): LessonMeta { ... }
export function getNextLesson(weekId: string, lessonId: string): { weekId: string; lessonId: string } | null { ... }
export function getPrevLesson(weekId: string, lessonId: string): { weekId: string; lessonId: string } | null { ... }
export function getTotalLessons(): number { ... }
export function getWeekLessonCount(weekId: string): number { ... }
```

### Pattern 5: Route Group for Layout Isolation

**What:** Use `(academy)` route group to apply the sidebar layout only to bootcamp pages, not the landing page.
**When:** Any time different sections of the site need different layouts.
**Why:** The landing page needs a full-width marketing layout. Bootcamp pages need a sidebar. Route groups solve this without URL path changes.

```
app/
  layout.tsx          # Root layout (ThirdwebProvider, base styles)
  page.tsx            # Landing page -- NO sidebar
  (academy)/
    layout.tsx        # Academy layout -- HAS sidebar + progress provider
    dashboard/
      page.tsx        # /dashboard -- has sidebar
    week/
      [weekId]/
        lesson/
          [lessonId]/
            page.tsx  # /week/1/lesson/1 -- has sidebar
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching Lesson Content from a Database

**What:** Storing lesson content in Supabase or a CMS and fetching at render time.
**Why bad:** Adds latency, complexity, and a point of failure for static content. The curriculum is fixed -- 20 lessons are not going to change at runtime. Database reads for every page view are wasteful and slow.
**Instead:** Hardcoded TSX files. Import the right content component based on route params. Content changes require a deploy, which is fine for a bootcamp with fixed curriculum.

### Anti-Pattern 2: Using `"use client"` on Layout Components

**What:** Marking the academy layout as a client component because it contains the sidebar.
**Why bad:** Forces all child components to also be client-rendered, losing Server Component benefits for lesson content. Increases bundle size dramatically.
**Instead:** Keep the layout as a Server Component. The Sidebar itself is a client component (it needs usePathname for active state), but it is composed within a server layout. The ProgressProvider wraps children as a client boundary, but lesson content inside it can still be server-rendered via the children prop pattern.

### Anti-Pattern 3: Complex State Management for Simple Progress

**What:** Using Redux, Zustand, or similar for tracking which lessons are complete.
**Why bad:** Overkill. The progress state is a set of completed lesson IDs and a few quiz scores. React Context + useReducer handles this trivially. External state management adds bundle size and complexity for no benefit.
**Instead:** Single ProgressProvider with React Context. localStorage for offline persistence. Supabase sync via API routes.

### Anti-Pattern 4: Full thirdweb Auth (SIWE) for Progress Tracking

**What:** Implementing the full Sign-In-With-Ethereum flow with server-side JWT verification and Supabase RLS.
**Why bad:** Massive overengineering for this use case. Content is public. Progress data is low-sensitivity (lesson completion status). The SIWE flow requires server-side auth endpoints, JWT signing, token refresh logic, and Supabase RLS configuration -- adding days of work.
**Instead:** Use thirdweb ConnectButton for wallet connection only. The connected wallet address is the user identifier. API routes that write progress verify the address comes from the request (basic validation). For a competition submission with a 12-day deadline, this is the right tradeoff.

### Anti-Pattern 5: Dynamic Imports for Every Lesson Component

**What:** Using `next/dynamic` to lazy-load each lesson's content component.
**Why bad:** Lesson pages are the primary content. They should render immediately, not wait for a dynamic import. Since content is TSX (not MDX), the tree-shaking handles unused lessons well already.
**Instead:** Use a static import map or switch statement in the lesson page.tsx. Each lesson file is only imported when its route is accessed.

## Supabase Database Schema

```sql
-- Minimal schema for progress tracking
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  lesson_key TEXT NOT NULL,          -- "week1-lesson3" format
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  quiz_score INTEGER,                -- null if lesson has no quiz
  UNIQUE(wallet_address, lesson_key) -- one entry per user per lesson
);

-- Index for fast lookups by wallet
CREATE INDEX idx_user_progress_wallet ON user_progress(wallet_address);

-- Optional: aggregate stats
CREATE VIEW progress_stats AS
SELECT
  wallet_address,
  COUNT(*) as completed_count,
  AVG(quiz_score) as avg_quiz_score
FROM user_progress
GROUP BY wallet_address;
```

No RLS needed because the API routes use the service_role client server-side. The anon key is never exposed for write operations.

## Scalability Considerations

| Concern | At 100 users (Competition Demo) | At 10K users | At 1M users |
|---------|--------------------------------|--------------|-------------|
| **Content delivery** | Vercel edge, effectively static | Same -- content is SSG/ISR | Same -- no change needed |
| **Progress storage** | Supabase free tier, ~2K rows | Supabase Pro, ~200K rows, still trivial | Add RLS + proper auth, shard by address |
| **Auth** | thirdweb free tier | thirdweb growth tier | Consider dedicated auth service |
| **API routes** | Vercel serverless, cold starts fine | Vercel Edge Functions for lower latency | Dedicated API with connection pooling |
| **Code highlighting** | Shiki server-side, cached per deploy | Same -- build-time rendering | Same -- no scaling concern |

For the competition (100 users max), the architecture is dramatically overprovisioned. The focus should be on build speed, not scale.

## Suggested Build Order (Dependencies)

The build order is driven by component dependencies. Each phase below unlocks the next:

### Phase 1: Shell and Navigation (No Auth, No Data)
**Build:** Root layout, academy layout, sidebar, curriculum metadata, routing structure
**Why first:** Everything else plugs into this shell. The sidebar and navigation structure define the information architecture. Getting this right first means all subsequent content work has a home.
**Unlocks:** Content authoring, dashboard

### Phase 2: Core Content Components
**Build:** CodeDiff, CodeBlock (Shiki), InstructorNotes, Quiz (UI only, no persistence)
**Why second:** These are the building blocks that lesson content uses. Building them before writing lessons means you can author content with the real components.
**Unlocks:** Lesson authoring

### Phase 3: Content Authoring (Parallelizable)
**Build:** All 20 lesson pages, 4 week overviews, 4 homework pages, syllabus
**Why third:** Now that the shell and components exist, content can be authored. This is the longest phase and the most parallelizable.
**Unlocks:** Progress tracking (needs content to mark complete)

### Phase 4: Auth and Progress
**Build:** thirdweb ConnectButton, ProgressProvider, API routes, Supabase schema, MarkAsComplete integration
**Why fourth:** Auth and progress are layered on top of working content. Building them last means the platform works without auth (content is public) and auth adds the progress-saving capability as a progressive enhancement.
**Unlocks:** Dashboard (needs progress data), AI Grader

### Phase 5: Dashboard and Polish
**Build:** Dashboard page, progress bars, landing page, AI Grader, visual polish
**Why last:** Dashboard needs progress data to be meaningful. Landing page is marketing -- build it when you know what to market. Polish is last because it touches everything.

## Sources

- [Next.js Layouts and Pages (Official Docs)](https://nextjs.org/docs/app/getting-started/layouts-and-pages) -- HIGH confidence, verified 2026-02-27
- [Next.js Project Structure (Official Docs)](https://nextjs.org/docs/app/getting-started/project-structure) -- HIGH confidence
- [thirdweb Auth + Next.js (Official Docs)](https://portal.thirdweb.com/connect/auth/frameworks/next) -- HIGH confidence, verified via WebFetch
- [thirdweb + Supabase Integration (Official)](https://portal.thirdweb.com/connect/auth/integrations/supabase) -- MEDIUM confidence
- [thirdweb Auth + Supabase Example (GitHub)](https://github.com/thirdweb-example/thirdweb-auth-supabase) -- MEDIUM confidence
- [Supabase RLS with Custom Auth (Discussion)](https://github.com/orgs/supabase/discussions/20311) -- MEDIUM confidence
- [Supabase Custom JWT + RLS (Discussion)](https://github.com/orgs/supabase/discussions/37716) -- MEDIUM confidence
- [Shiki + Next.js Server Components](https://www.nikolailehbr.ink/blog/syntax-highlighting-shiki-next-js/) -- HIGH confidence, verified with Shiki official docs
- [Shiki Official Next.js Package](https://shiki.style/packages/next) -- HIGH confidence
- [Creating a Learning Platform with Next.js 13 App Router (Hygraph)](https://hygraph.com/blog/creating-learning-platform-nextjs-13-app-router) -- MEDIUM confidence
- [Next.js Architecture Patterns 2026](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router) -- LOW confidence (blog post)
- [react-diff-viewer (npm)](https://www.npmjs.com/package/react-diff-view) -- MEDIUM confidence (considered but not recommended; custom Shiki-based approach preferred)
