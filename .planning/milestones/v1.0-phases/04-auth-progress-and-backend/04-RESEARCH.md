# Phase 4: Auth, Progress, and Backend - Research

**Researched:** 2026-03-04
**Domain:** Wallet authentication (thirdweb), progress persistence (Supabase + localStorage), progress UI
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- ConnectButton in BOTH top header bar AND sidebar footer
- Header: primary connect action (Zama-branded styling, gold/purple accents — not thirdweb default)
- Sidebar footer: wallet status showing truncated address + overall progress (e.g., "12/24 lessons") when connected
- After connecting: subtle confirmation (toast/animation), user stays on current page, progress syncs silently in background
- When disconnected: sidebar footer shows ConnectButton instead of wallet status
- "Mark as Complete" button at the bottom of lesson content, near prev/next navigation
- Both lessons (20) and homeworks (4) are completable — 24 total items
- Completion is reversible — clicking completed button toggles back to incomplete
- Visual feedback: button transforms to green checkmark with brief animation, sidebar lesson icon updates from empty Circle to green CheckCircle
- Sidebar week headers: thin progress bar + fraction text (e.g., "3/6") next to each "Week N"
- Week overview pages: larger progress section showing per-week completion
- Syllabus page: per-week progress bars on each week section
- Sidebar lesson icons: green CheckCircle replaces empty Circle for completed lessons
- Sidebar footer (when connected): overall progress count
- Anonymous users (no wallet): progress saved to localStorage immediately
- Connected users: immediate write to Supabase on each completion (no batching)
- On wallet connect: union merge — if a lesson is complete in either localStorage OR Supabase, mark it complete (never lose progress)
- localStorage always kept in sync as local cache regardless of connection state

### Claude's Discretion
- Supabase table schema design (single JSON row vs normalized rows)
- Header bar layout and styling details
- Loading states for progress data
- Error handling for Supabase write failures
- thirdweb provider configuration and chain selection
- Toast/animation implementation for completion feedback

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-05 | LessonComplete (Mark as Complete) button wired to progress tracking | ProgressProvider context + button component at bottom of LessonLayout, near prev/next nav |
| AUTH-01 | thirdweb ConnectButton for wallet-based identity (all content publicly accessible without wallet) | thirdweb v5 `ConnectButton` + `ThirdwebProvider` — no content gating, just optional identity |
| AUTH-02 | Supabase backend storing progress keyed by wallet address | Supabase table with wallet_address PK, JSONB completions column, RLS policies |
| AUTH-03 | API route (GET/POST /api/progress) for reading and upserting lesson completion | Next.js App Router `app/api/progress/route.ts` using `@supabase/supabase-js` server-side client |
| AUTH-04 | ProgressProvider with React Context — optimistic updates, localStorage fallback | Client-side React Context wrapping academy layout, localStorage as default, Supabase sync on connect |
| AUTH-05 | Progress bars showing per-lesson, per-week, and overall completion | Computed from ProgressProvider context — sidebar bars, week overview bars, syllabus bars |

</phase_requirements>

## Summary

Phase 4 adds wallet-based identity via thirdweb ConnectButton and lesson progress persistence via Supabase, with localStorage fallback for anonymous users. The architecture centers on a **ProgressProvider** (React Context) that manages a `Set<string>` of completed item IDs, persists to localStorage always, and syncs to Supabase when a wallet is connected.

The thirdweb v5 SDK (`thirdweb` npm package) provides `ThirdwebProvider`, `ConnectButton`, and hooks like `useActiveAccount` that integrate cleanly with Next.js App Router. The ConnectButton supports deep theme customization via `darkTheme()` overrides to match Zama branding (gold #F5C518, purple #8B5CF6, dark backgrounds). No chain-specific features are needed -- wallet connection is purely for identity (getting an address).

Supabase is used as a simple key-value store: one row per wallet address with a JSONB column holding the set of completed item IDs. The API route pattern uses `@supabase/supabase-js` (not `@supabase/ssr`) since we are NOT using Supabase Auth -- we use wallet address as the user identifier, passed from the client. Row Level Security with `anon` key access is sufficient given the data is non-sensitive (lesson completion flags).

**Primary recommendation:** Build a ProgressProvider context that owns localStorage reads/writes, a thirdweb wrapper for wallet state, and a single `/api/progress` route for Supabase CRUD. Wire progress into existing sidebar, lesson layout, week overview, and syllabus components.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `thirdweb` | 5.119.0 | Wallet connection UI + hooks | Official thirdweb v5 SDK; `ConnectButton` + `useActiveAccount` from `thirdweb/react`; deep theme customization |
| `@supabase/supabase-js` | 2.98.0 | Database client for progress storage | Official Supabase JS client; simple `createClient` + `.from().upsert()/.select()`; no SSR auth helpers needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 0.576.0 (installed) | Icons — Circle, CheckCircle, Check | Already in project; used for completion indicators |
| `sonner` or inline toast | latest | Toast notifications for completion feedback | Optional — could use a simple CSS animation instead of adding a dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@supabase/supabase-js` | `@supabase/ssr` | SSR package adds cookie-based auth complexity; unnecessary since we use wallet address as key, not Supabase Auth |
| Single JSONB row | Normalized `completions` table (one row per wallet+item) | Normalized is more flexible but overkill for 24 boolean flags; JSONB is simpler, fewer queries, atomic upserts |
| React Context | Zustand or Jotai | External state library is unnecessary for a single progress context; React Context is sufficient and zero-dependency |
| `sonner` toast | Inline animation | Sonner adds ~4KB but gives polished toast UX; inline animation avoids dependency but needs more manual work |

**Installation:**
```bash
npm install thirdweb @supabase/supabase-js
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── thirdweb-client.ts         # createThirdwebClient({ clientId })
├── supabase-client.ts         # createClient(url, anonKey) — server-side only
├── progress.ts                # Types: CompletionSet, item ID format
└── curriculum.ts              # (existing) getAllLessons, getAllHomeworks

components/
├── providers/
│   ├── thirdweb-provider.tsx  # "use client" — wraps ThirdwebProvider
│   └── progress-provider.tsx  # "use client" — React Context for progress state
├── layout/
│   ├── app-sidebar.tsx        # (modify) Add progress indicators, wallet status
│   ├── lesson-layout.tsx      # (modify) Add MarkComplete button
│   └── header-wallet.tsx      # ConnectButton in header bar
└── ui/
    ├── mark-complete.tsx      # "Mark as Complete" / completed toggle button
    └── progress-bar.tsx       # Thin reusable progress bar component

app/
├── (academy)/
│   └── layout.tsx             # (modify) Wrap with ThirdwebProvider + ProgressProvider
├── api/
│   └── progress/
│       └── route.ts           # GET/POST handler for Supabase CRUD
└── layout.tsx                 # (modify) Add ThirdwebProvider at root level
```

### Pattern 1: ThirdwebProvider at Root, ProgressProvider at Academy Layout
**What:** ThirdwebProvider wraps the entire app (in root layout) so wallet state is available everywhere. ProgressProvider wraps only the `(academy)` layout since progress is only relevant to course pages.
**When to use:** When wallet connection needs to be accessible app-wide but progress logic is scoped.
**Example:**
```typescript
// app/layout.tsx — root layout
import { ThirdwebProvider } from "thirdweb/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
```

```typescript
// app/(academy)/layout.tsx — academy layout
"use client"
import { ProgressProvider } from "@/components/providers/progress-provider";

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <header>...</header>
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProgressProvider>
  );
}
```

**Important:** ThirdwebProvider is a client component. Since root `layout.tsx` is currently a server component, the provider must be extracted into a separate `"use client"` wrapper component and imported into the root layout.

### Pattern 2: ProgressProvider with localStorage + Supabase Sync
**What:** The ProgressProvider manages a `Set<string>` of completed item IDs. On mount, it reads from localStorage. When wallet connects, it fetches from Supabase, union-merges, and writes back both.
**When to use:** Core pattern for this phase — all progress reads go through context.
**Example:**
```typescript
// components/providers/progress-provider.tsx
"use client"

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

interface ProgressContextValue {
  completedItems: Set<string>;
  isComplete: (itemId: string) => boolean;
  toggleComplete: (itemId: string) => void;
  weekProgress: (weekId: number) => { completed: number; total: number };
  overallProgress: () => { completed: number; total: number };
  isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const STORAGE_KEY = "fhe-academy-progress";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const account = useActiveAccount();
  const walletAddress = account?.address;

  // On mount: load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompletedItems(new Set(JSON.parse(stored)));
    }
    setIsLoading(false);
  }, []);

  // On wallet connect: fetch from Supabase, union merge
  useEffect(() => {
    if (!walletAddress) return;
    syncWithSupabase(walletAddress, completedItems).then((merged) => {
      setCompletedItems(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
    });
  }, [walletAddress]);

  const toggleComplete = useCallback((itemId: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      // Persist to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      // If wallet connected, persist to Supabase
      if (walletAddress) {
        persistToSupabase(walletAddress, next);
      }
      return next;
    });
  }, [walletAddress]);

  // ... context value with isComplete, weekProgress, overallProgress
  return (
    <ProgressContext.Provider value={/* ... */}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
```

### Pattern 3: Item ID Format
**What:** Each completable item has a unique string ID used as a key in the Set.
**Format:** `"lesson-{weekId}-{lessonSlug}"` for lessons, `"homework-{weekId}-{homeworkSlug}"` for homeworks.
**Examples:** `"lesson-1-why-privacy-matters"`, `"homework-2-confidential-erc20-token"`
**Why:** Matches existing `curriculum.ts` structure, human-readable, collision-free.

### Pattern 4: API Route for Supabase CRUD
**What:** Single Next.js App Router API route at `/api/progress` handles GET (fetch by wallet) and POST (upsert completions).
**Example:**
```typescript
// app/api/progress/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for API route — not anon key
);

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

  const { data, error } = await supabase
    .from("progress")
    .select("completions")
    .eq("wallet_address", wallet.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ completions: data?.completions || [] });
}

export async function POST(req: NextRequest) {
  const { wallet, completions } = await req.json();
  if (!wallet || !completions) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const { error } = await supabase
    .from("progress")
    .upsert(
      { wallet_address: wallet.toLowerCase(), completions, updated_at: new Date().toISOString() },
      { onConflict: "wallet_address" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

### Pattern 5: ConnectButton with Zama Dark Theme
**What:** Use `darkTheme()` from `thirdweb/react` to override ConnectButton colors to match Zama branding.
**Example:**
```typescript
// Source: Context7 /websites/portal_thirdweb — darkTheme API
import { ConnectButton, darkTheme } from "thirdweb/react";
import { client } from "@/lib/thirdweb-client";

const zamaTheme = darkTheme({
  colors: {
    modalBg: "#13131A",
    primaryButtonBg: "#F5C518",
    primaryButtonText: "#0A0A0F",
    accentButtonBg: "#8B5CF6",
    accentButtonText: "#F1F1F3",
    accentText: "#F5C518",
    borderColor: "#1E1E2E",
    separatorLine: "#1E1E2E",
    primaryText: "#F1F1F3",
    secondaryText: "#9191A4",
    connectedButtonBg: "#1A1A24",
    connectedButtonBgHover: "#252540",
  },
});

export function WalletConnect() {
  return <ConnectButton client={client} theme={zamaTheme} />;
}
```

### Anti-Patterns to Avoid
- **Gating content behind wallet:** All lessons MUST remain publicly accessible. Wallet is optional for progress tracking only.
- **Batching Supabase writes:** User decided immediate writes on each completion — do not debounce or batch.
- **Using Supabase Auth:** We are NOT using Supabase Auth. Wallet address is the user identifier. Use anon key or service role key, not `@supabase/ssr` auth helpers.
- **Server-side progress fetching:** Progress is client-side state. Do not fetch progress in server components or make pages dynamic. Keep SSG/static rendering intact.
- **Storing progress in cookies:** Use localStorage for client-side persistence, Supabase for cross-device. Cookies add complexity with no benefit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wallet connection UI | Custom modal with wallet adapters | `ConnectButton` from `thirdweb/react` | Handles 300+ wallets, mobile deep linking, WalletConnect v2, chain switching, error states |
| Wallet state management | Custom hooks for connection/disconnection | `useActiveAccount`, `useActiveWallet`, `useDisconnect` from `thirdweb/react` | Reactive state, auto-reconnect, session persistence |
| Theme for ConnectButton | CSS overrides on `.tw-*` classes | `darkTheme({ colors: {...} })` API | Type-safe, covers modal + button + all sub-elements |
| Supabase client | Raw fetch calls to PostgREST | `@supabase/supabase-js` `createClient` | Handles auth headers, retries, typed responses, error codes |
| Progress bar component | Complex SVG/canvas bars | Simple div with percentage width + Tailwind | 24 items max; a styled div with `width: ${pct}%` is sufficient |

**Key insight:** thirdweb handles the entire wallet connection lifecycle (UI, state, reconnection, mobile). Supabase handles the entire persistence lifecycle (upsert, conflict resolution, RLS). The custom code we write is the thin layer connecting these: ProgressProvider context, one API route, and UI integration.

## Common Pitfalls

### Pitfall 1: ThirdwebProvider Must Be Client Component
**What goes wrong:** Wrapping `<ThirdwebProvider>` directly in a server component `layout.tsx` causes "use client" boundary errors.
**Why it happens:** ThirdwebProvider uses React context, hooks, and browser APIs internally.
**How to avoid:** Create a separate `"use client"` wrapper component (e.g., `components/providers/thirdweb-provider.tsx`) that re-exports `ThirdwebProvider`, then import it into the server component layout.
**Warning signs:** Build error mentioning "createContext" or "useState" in a server component.

### Pitfall 2: thirdweb Client ID Exposed to Client
**What goes wrong:** Using `THIRDWEB_SECRET_KEY` on client side, or forgetting `NEXT_PUBLIC_` prefix for client ID.
**Why it happens:** Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` to the browser.
**How to avoid:** Use `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` for the client-side `createThirdwebClient`. The thirdweb clientId is designed to be public (scoped by domain allowlist in thirdweb dashboard).
**Warning signs:** `createThirdwebClient` returns undefined or connection modal shows errors.

### Pitfall 3: Race Condition on Wallet Connect Merge
**What goes wrong:** User has localStorage progress, connects wallet, Supabase fetch hasn't returned yet, user marks another lesson — overwrites Supabase with partial data.
**Why it happens:** The merge is async but the UI allows mutations immediately.
**How to avoid:** During Supabase sync (after wallet connect), set a brief `isSyncing` state that still allows UI interaction but queues the Supabase write until the merge is complete. Alternatively, use the `useEffect` dependency on `walletAddress` to trigger a one-time merge and only enable Supabase writes after merge completes.
**Warning signs:** Progress data "jumps" after connecting wallet, or previously completed items disappear.

### Pitfall 4: Supabase Row-Level Security Blocking Requests
**What goes wrong:** API route returns 403 or empty results even though data exists.
**Why it happens:** RLS is enabled but no policy allows the operation for the `anon` role, or using wrong key.
**How to avoid:** For the API route (server-side), use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. Alternatively, use `anon` key with explicit RLS policies for SELECT and INSERT/UPDATE on the progress table. Service role key is simpler for a single API route.
**Warning signs:** 403 errors, empty `data` with no `error` object.

### Pitfall 5: Hydration Mismatch from localStorage
**What goes wrong:** Server renders with no progress (empty set), client hydrates with localStorage progress — React throws hydration mismatch warning.
**Why it happens:** Server has no access to localStorage; initial render must match server.
**How to avoid:** Initialize `completedItems` as empty set on both server and client. Load localStorage in a `useEffect` (after mount). Use `isLoading` state to show skeleton/placeholder until localStorage is read.
**Warning signs:** Console warning about text content mismatch, progress icons "flash" between states.

### Pitfall 6: Wallet Address Case Sensitivity
**What goes wrong:** Same wallet stores progress under two different keys (e.g., `0xAbC...` and `0xabc...`).
**Why it happens:** Ethereum addresses are case-insensitive but string comparison is case-sensitive.
**How to avoid:** Always `.toLowerCase()` wallet addresses before using as keys (both in API route and client-side).
**Warning signs:** Progress doesn't persist across sessions, or user has "lost" progress.

## Code Examples

Verified patterns from official sources:

### thirdweb Client Setup
```typescript
// lib/thirdweb-client.ts
// Source: Context7 /websites/portal_thirdweb — Next.js integration
import { createThirdwebClient } from "thirdweb";

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});
```

### ThirdwebProvider Wrapper (Client Component)
```typescript
// components/providers/thirdweb-provider.tsx
"use client"

import { ThirdwebProvider } from "thirdweb/react";

export function ThirdwebProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
```

### ConnectButton with Zama Theme
```typescript
// components/layout/header-wallet.tsx
"use client"

import { ConnectButton, darkTheme } from "thirdweb/react";
import { thirdwebClient } from "@/lib/thirdweb-client";

const zamaTheme = darkTheme({
  colors: {
    modalBg: "#13131A",         // --card
    primaryButtonBg: "#F5C518", // --primary (gold)
    primaryButtonText: "#0A0A0F", // --primary-foreground
    accentText: "#F5C518",      // --primary (gold)
    accentButtonBg: "#8B5CF6",  // --secondary (purple)
    accentButtonText: "#F1F1F3", // --foreground
    borderColor: "#1E1E2E",     // --border
    separatorLine: "#1E1E2E",   // --border
    primaryText: "#F1F1F3",     // --foreground
    secondaryText: "#9191A4",   // --muted-foreground
    connectedButtonBg: "#1A1A24", // --muted
    connectedButtonBgHover: "#252540",
    tertiaryBg: "#0A0A0F",     // --background
  },
});

export function HeaderWallet() {
  return (
    <ConnectButton
      client={thirdwebClient}
      theme={zamaTheme}
    />
  );
}
```

### Getting Active Wallet Address
```typescript
// Source: Context7 /websites/portal_thirdweb — useActiveAccount hook
import { useActiveAccount } from "thirdweb/react";

function MyComponent() {
  const account = useActiveAccount();
  const walletAddress = account?.address; // string | undefined
  const isConnected = !!account;
  // ...
}
```

### Supabase Client for API Route
```typescript
// lib/supabase-client.ts
import { createClient } from "@supabase/supabase-js";

// Server-side only — used in API routes
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Supabase Table Schema (SQL)
```sql
-- Run in Supabase SQL editor
CREATE TABLE progress (
  wallet_address TEXT PRIMARY KEY,
  completions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (even though API route uses service role key, good practice)
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypasses RLS by default)
-- For anon key fallback, add explicit policies:
CREATE POLICY "Allow read own progress"
  ON progress FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow upsert own progress"
  ON progress FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update own progress"
  ON progress FOR UPDATE
  TO anon
  USING (true);
```

### Mark as Complete Button Component
```typescript
// components/ui/mark-complete.tsx
"use client"

import { Check, Circle } from "lucide-react";
import { useProgress } from "@/components/providers/progress-provider";
import { cn } from "@/lib/utils";

interface MarkCompleteProps {
  itemId: string; // e.g., "lesson-1-why-privacy-matters"
}

export function MarkComplete({ itemId }: MarkCompleteProps) {
  const { isComplete, toggleComplete } = useProgress();
  const completed = isComplete(itemId);

  return (
    <button
      onClick={() => toggleComplete(itemId)}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
        completed
          ? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
          : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
      )}
    >
      {completed ? (
        <>
          <Check className="size-4" />
          Completed
        </>
      ) : (
        <>
          <Circle className="size-4" />
          Mark as Complete
        </>
      )}
    </button>
  );
}
```

### Progress Bar Component
```typescript
// components/ui/progress-bar.tsx
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
  showText?: boolean;
}

export function ProgressBar({ completed, total, className, showText = true }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {completed}/{total}
        </span>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@thirdweb-dev/react` (v4) | `thirdweb` package (v5) — imports from `thirdweb/react` | thirdweb v5 (2024) | Single `thirdweb` package; `createThirdwebClient` replaces old SDK init; `useActiveAccount` replaces `useAddress` |
| Supabase auth helpers for Next.js | `@supabase/ssr` for auth, `@supabase/supabase-js` for data-only | 2024 | We only need `supabase-js` since we don't use Supabase Auth |
| `ThirdwebSDKProvider` (v4) | `ThirdwebProvider` (v5) — no props needed | thirdweb v5 | Provider is simpler; no chain/signer config required at provider level |

**Deprecated/outdated:**
- `@thirdweb-dev/react` — old v4 package. Use `thirdweb` (single package) with imports from `thirdweb/react`
- `useAddress()` — replaced by `useActiveAccount()?.address` in v5
- `useConnect()` — replaced by `ConnectButton` component in v5
- `ThirdwebSDKProvider` — replaced by `ThirdwebProvider` in v5

## Discretion Recommendations

### Supabase Schema: Single JSONB Row (Recommended)
**Recommendation:** Use a single row per wallet with a `completions` JSONB column storing an array of item ID strings.
**Rationale:** With only 24 completable items, a normalized table (one row per completion) adds complexity without benefit. A single JSONB array is atomic to read/write, trivial to merge, and requires only one upsert per mutation. The `completions` column stores `["lesson-1-why-privacy-matters", "homework-1-temperature-converter-migration", ...]`.

### Loading States
**Recommendation:** Use the existing `skeleton.tsx` component (already in project) during initial localStorage load. Show a brief loading state (50-100ms typical for localStorage) before revealing progress indicators. During Supabase sync after wallet connect, show current localStorage state immediately and update silently when Supabase data arrives.

### Error Handling for Supabase Failures
**Recommendation:** Optimistic updates with silent retry. When Supabase write fails, keep the localStorage state (user's action is preserved), log the error, and retry on next mutation. Do NOT block the UI or show error toasts for write failures — progress is safely in localStorage. Only show an error if the initial wallet-connect sync fails (a non-blocking warning toast).

### thirdweb Chain Selection
**Recommendation:** Do not specify a chain. We are not doing on-chain transactions — wallet connection is purely for identity (getting an address). Let thirdweb handle chain defaults. No `chain` prop needed on `ConnectButton` or provider.

### Toast/Animation for Completion Feedback
**Recommendation:** Skip adding `sonner` or a toast library. Use CSS transitions on the button state change (green checkmark + scale animation) and the sidebar icon update. This keeps dependencies minimal. The button itself transforming from "Mark as Complete" to a green "Completed" with a brief `scale(1.05)` animation is sufficient visual feedback per the user's spec.

## Environment Variables

The following env vars are needed (add to `.env.local` and Vercel):

```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=<from thirdweb dashboard>
NEXT_PUBLIC_SUPABASE_URL=<from Supabase project settings>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase project settings — NEVER expose to client>
```

Note: `NEXT_PUBLIC_` prefix makes vars available in client-side code. `SUPABASE_SERVICE_ROLE_KEY` has no prefix — only available server-side (API routes).

## Open Questions

1. **thirdweb Client ID availability**
   - What we know: A thirdweb account needs to be created and a client ID generated
   - What's unclear: Whether the project owner has already created a thirdweb account
   - Recommendation: Code with `process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID` — works with any value once configured. Build and test the UI flow without a real client ID (ConnectButton renders but connection will fail).

2. **Supabase project availability**
   - What we know: A Supabase project needs to be created with the progress table
   - What's unclear: Whether the project owner has already created a Supabase project
   - Recommendation: Code with env vars. The API route will gracefully error (caught by error handling) if Supabase is not configured. localStorage fallback works independently.

3. **Homework completion tracking in sidebar**
   - What we know: Homeworks are completable (4 items), but the sidebar shows homework as a sub-item under each week
   - What's unclear: Should homework items show a CheckCircle icon like lessons, or use a different indicator?
   - Recommendation: Use the same CheckCircle pattern for consistency. The homework entry in the sidebar already has a distinct style (`text-sidebar-foreground/60`, `FileCode` icon) — adding a green CheckCircle when complete follows the same pattern as lessons.

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/portal_thirdweb` — ThirdwebProvider, ConnectButton, useActiveAccount, darkTheme API, Next.js integration
- Context7 `/supabase/supabase-js` — createClient, upsert, select, client initialization
- Context7 `/supabase/supabase` — RLS policies, table creation, Next.js patterns

### Secondary (MEDIUM confidence)
- npm registry — `thirdweb@5.119.0`, `@supabase/supabase-js@2.98.0` (verified via `npm view`)
- Existing codebase analysis — `app/layout.tsx`, `app/(academy)/layout.tsx`, `components/layout/app-sidebar.tsx`, `components/layout/lesson-layout.tsx`, `lib/curriculum.ts`, `app/globals.css`

### Tertiary (LOW confidence)
- None — all findings verified through Context7 or direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via Context7 + npm registry; thirdweb v5 and supabase-js APIs confirmed
- Architecture: HIGH — patterns derived from official docs + analysis of existing codebase structure
- Pitfalls: HIGH — derived from known Next.js server/client boundary issues, wallet address handling, and hydration patterns

**Research date:** 2026-03-04
**Valid until:** 2026-03-18 (14 days — thirdweb v5 API is stable but evolving; check import paths at implementation time)
