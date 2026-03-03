# Technology Stack

**Project:** FHE Academy
**Researched:** 2026-03-03
**Focus:** Interactive developer education platform for Zama FHEVM

## Key Decision: Next.js 15 over Next.js 14

The PROJECT.md specifies Next.js 14, but research strongly recommends **Next.js 15** instead.

**Rationale:**
- Next.js 15 has been stable for over a year (released Oct 2024, now at 15.5.12)
- `create-next-app` defaults to Next.js 15+ (you have to explicitly pin 14 to get it)
- React 19 support is required for modern shadcn/ui components (Tailwind v4 + React 19)
- Turbopack is stable in 15, giving 2-3x faster builds and 5-10x faster HMR during rapid development (critical for 12-day deadline)
- shadcn/ui has first-class support for Next.js 15 + Tailwind v4 + React 19
- No migration cost since this is a greenfield project
- Next.js 14 will stop receiving security patches sooner

**Do NOT use Next.js 16** (16.1.6 is latest). It shipped recently and introduces Cache Components and other breaking patterns. Too bleeding-edge for a deadline project. Next.js 15.5.x is the sweet spot: mature, battle-tested, well-documented.

**Confidence: HIGH** -- Verified via npm registry (15.5.12 is latest 15.x stable) and multiple official sources.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.5.12 | App framework | Stable, Turbopack default, React 19, App Router. Mature for 1+ year. | HIGH |
| React | 19.2.4 | UI library | Required by Next.js 15. Server Components for zero-JS code blocks. | HIGH |
| React DOM | 19.2.4 | DOM rendering | Paired with React 19 | HIGH |
| TypeScript | ~5.9 | Type safety | Next.js 15 ships with TS support. Use project's TS, not global. | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.2.1 | Utility-first CSS | shadcn/ui is built on it. v4 is stable, uses CSS-first config (no tailwind.config.js). Simpler dark theme setup with CSS variables. | HIGH |
| shadcn/ui | latest (CLI) | Component library | Not a package -- CLI copies components into your project. Full control over styling. Radix UI primitives underneath. Perfect for custom Zama dark theme. | HIGH |
| tw-animate-css | 1.4.0 | CSS animations | Replaces deprecated `tailwindcss-animate` for Tailwind v4. Used by shadcn/ui. | HIGH |
| class-variance-authority | 0.7.1 | Variant styling | Required by shadcn/ui for component variants (button sizes, quiz states, etc.) | HIGH |
| clsx | 2.1.1 | Class merging | Conditional class joining. Lightweight. Used everywhere in shadcn patterns. | HIGH |
| tailwind-merge | 3.5.0 | Tailwind class dedup | Prevents conflicting Tailwind classes. Required by shadcn/ui `cn()` utility. | HIGH |

### UI Components & Icons

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Radix UI | (via shadcn) | Accessible primitives | Accordion (collapsible notes), Dialog, Progress, Tabs, RadioGroup (quizzes). Installed per-component by shadcn CLI. | HIGH |
| lucide-react | 0.576.0 | Icons | 1500+ tree-shakable SVG icons. 29M weekly downloads. shadcn/ui default icon set. ESM-first, zero bundle bloat for unused icons. | HIGH |

### Code Display (Critical for this project)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| shiki | 4.0.1 | Syntax highlighting | VS Code-grade highlighting. Runs as Server Component = zero client JS. Supports Solidity language. Custom themes match Zama dark palette. | HIGH |
| @shikijs/transformers | (bundled with shiki 4.x) | Line highlights, diff notation | Built-in `transformerNotationDiff()` for `// [!code ++]` / `// [!code --]` annotations. `transformerNotationHighlight()` for key line emphasis. | HIGH |

**For the CodeDiff component (side-by-side Solidity vs FHEVM):**

Do NOT use react-diff-viewer or react-diff-viewer-continued. Here is why:
- They compute textual diffs (insert/delete/change). The project needs **conceptual** side-by-side comparison, not git-style diffs.
- They ship Emotion CSS runtime (~12KB), conflicting with Tailwind-only approach.
- The "Migration Mindset" feature shows two complete code blocks side-by-side, not a unified diff.

**Instead:** Build a custom `<CodeDiff>` component using two shiki-highlighted `<pre>` blocks in a CSS Grid. This gives full control over:
- Matching line numbers between vanilla Solidity and FHEVM versions
- Highlighting changed lines with custom colors (gold for additions, dimmed for unchanged)
- Responsive stacking on mobile
- Zero additional dependencies

**Confidence: HIGH** -- Shiki verified at 4.0.1 via npm. Solidity language support confirmed in shiki's language list. Server Component rendering confirmed in official docs.

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| thirdweb | 5.119.0 | Wallet auth | Unified SDK (v5). `ConnectButton` component handles wallet modal, multiple wallet types. Web3-native auth for Web3 developer audience. In-app wallet option for email fallback. | MEDIUM |

**Important thirdweb notes:**
- Use the unified `thirdweb` package (v5), NOT the deprecated `@thirdweb-dev/react` (v4).
- `ConnectButton` must be in a Client Component (uses browser APIs).
- Wrap app in `ThirdwebProvider` at the layout level.
- Requires a thirdweb client ID (free tier, env var: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`).

**Confidence: MEDIUM** -- thirdweb v5 API surface changes frequently (5.119.0 is very high version number indicating rapid releases). Pin the version. Check docs at integration time.

### Backend / Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @supabase/supabase-js | 2.98.0 | Supabase client | Database queries, auth integration. Mature v2 API. | HIGH |
| @supabase/ssr | 0.9.0 | SSR cookie handling | Required for Next.js App Router. Handles cookie-based session on server. Replaces deprecated auth-helpers. | HIGH |
| Supabase (hosted) | N/A | Postgres + Auth + RLS | Free tier sufficient. Row Level Security for per-wallet progress isolation. No server to manage. | HIGH |

**Supabase schema will be simple:**
- `user_progress` table: wallet_address, lesson_id, completed, completed_at
- RLS policy: users can only read/write their own rows (matched by wallet address)
- No complex queries needed -- just CRUD on progress records

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Context | (built-in) | Auth state, theme | Only 2-3 pieces of global state (wallet connection, progress cache). No re-render issues at this scale. Zero dependencies. | HIGH |

**Do NOT add Zustand, Redux, or Jotai.** This app has minimal client state:
- Wallet connection state: managed by thirdweb's provider
- Lesson progress: fetched from Supabase, cached in a simple context
- UI state (sidebar open, quiz answers): component-local useState

Adding a state management library for this is over-engineering. If progress caching becomes complex later, Zustand (5.0.11) is the escape hatch.

### Animation (Optional, Low Priority)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| motion | 12.34.5 | Page transitions, micro-interactions | Formerly Framer Motion. Only if time permits. Progress bar animations, quiz reveal, page transitions. ~32KB but tree-shakable. | MEDIUM |

**Skip animations initially.** CSS transitions via Tailwind (`transition-all`, `animate-`) handle 90% of needs (progress bars, hover states, accordion open/close). Only add `motion` if the platform feels static and there is time before deadline.

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | N/A | Hosting & deployment | Zero-config Next.js deployment. Preview URLs for each push. Free tier covers this project. Edge functions for API routes. | HIGH |
| Turbopack | (bundled with Next.js 15) | Dev bundler | 5-10x faster HMR than webpack. Default in Next.js 15. Critical for rapid iteration on 12-day deadline. | HIGH |

### Dev Dependencies

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | 9.x | Linting | Bundled with create-next-app. Flat config format in ESLint 9. | HIGH |
| @next/eslint-plugin-next | (bundled) | Next.js lint rules | Catches common Next.js mistakes (missing Image optimization, etc.) | HIGH |
| prettier | latest | Formatting | Optional but recommended for consistent TSX formatting across 20+ lesson files. | MEDIUM |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting | Auto-sorts Tailwind classes. Prevents messy class strings in lesson components. | MEDIUM |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Next.js 14 | 14 uses React 18, misses Turbopack stable, shadcn/ui moving to Tailwind v4 + React 19 |
| Framework | Next.js 15 | Next.js 16 | Too new (shipped recently), Cache Components are experimental patterns, poor documentation coverage |
| Framework | Next.js 15 | Astro | Great for content sites but lacks the React component interactivity needed for quizzes, progress tracking, wallet auth |
| Styling | Tailwind v4 + shadcn | Chakra UI | Chakra ships runtime CSS. Tailwind is zero-runtime. shadcn gives full ownership of components. |
| Styling | Tailwind v4 + shadcn | MUI | Heavy runtime, opinionated Material Design look doesn't fit Zama's brand aesthetic |
| Code Highlight | Shiki 4 | Prism.js | Prism lacks Solidity support without plugins. Shiki uses VS Code's engine -- better accuracy, more themes. |
| Code Highlight | Shiki 4 | react-syntax-highlighter | Wraps Prism/hljs, ships JS to client. Shiki in Server Components = zero client JS. |
| Code Diff | Custom (2x Shiki) | react-diff-viewer | Computes textual diffs. Project needs conceptual side-by-side, not git diffs. Also ships Emotion runtime. |
| Auth | thirdweb v5 | RainbowKit | Good but thirdweb provides more wallet options + in-app wallet fallback. PROJECT.md already chose thirdweb. |
| Auth | thirdweb v5 | ConnectKit | Simpler but fewer features. thirdweb handles auth + wallet in one SDK. |
| Database | Supabase | Firebase | Firebase Realtime DB is overkill. Supabase gives Postgres + RLS + simple REST API. Better DX for this use case. |
| Database | Supabase | PlanetScale | MySQL-based, no built-in auth helpers. Supabase has dedicated Next.js SSR support. |
| State | React Context | Zustand | App has ~3 pieces of global state. Context is sufficient. Zustand adds unnecessary dependency. |
| State | React Context | Redux Toolkit | Massive overkill for a content platform with simple progress tracking. |
| Animation | CSS/Tailwind (+ motion later) | GSAP | Heavy, license issues for SaaS, overkill for progress bars and accordion transitions. |
| Icons | lucide-react | react-icons | react-icons bundles entire icon sets. lucide-react is tree-shakable, smaller bundles. |

---

## Installation

```bash
# Create project (use Next.js 15 explicitly if create-next-app defaults to 16)
npx create-next-app@latest fheacademy --typescript --tailwind --eslint --app --turbopack

# If the above creates Next.js 16, pin to 15:
npm install next@15.5.12 react@19.2.4 react-dom@19.2.4

# Initialize shadcn/ui
npx shadcn@latest init

# Add shadcn components needed
npx shadcn@latest add button card progress accordion tabs radio-group badge separator scroll-area

# Core dependencies
npm install @supabase/supabase-js@2.98.0 @supabase/ssr@0.9.0 thirdweb@5.119.0 shiki@4.0.1 lucide-react@0.576.0

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=       # From thirdweb dashboard (free)
NEXT_PUBLIC_SUPABASE_URL=             # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # From Supabase project settings (safe for client)
```

No server-side secrets needed initially. Supabase RLS handles authorization. thirdweb client ID is public by design.

---

## Version Pinning Strategy

Given the 12-day deadline, **pin all versions exactly** (no `^` or `~` in package.json). A broken dependency update mid-sprint could cost hours.

```json
{
  "dependencies": {
    "next": "15.5.12",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@supabase/supabase-js": "2.98.0",
    "@supabase/ssr": "0.9.0",
    "thirdweb": "5.119.0",
    "shiki": "4.0.1",
    "lucide-react": "0.576.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "3.5.0",
    "tw-animate-css": "1.4.0"
  }
}
```

---

## Sources

- Next.js 15 stable release and comparison: [Next.js Blog](https://nextjs.org/blog/next-15) -- HIGH confidence
- Next.js 15.5.12 verified via `npm view next@15 version` -- HIGH confidence
- shadcn/ui Tailwind v4 support: [shadcn Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) -- HIGH confidence
- Tailwind CSS v4 stable (Feb 2025): [Tailwind v4 release](https://tailwindcss.com/blog/tailwindcss-v4) -- HIGH confidence
- Shiki Next.js Server Components: [shiki.style/packages/next](https://shiki.style/packages/next) -- HIGH confidence
- Shiki transformers (diff, highlight): [@shikijs/transformers docs](https://shiki.style/packages/transformers) -- HIGH confidence
- thirdweb v5 ConnectButton: [thirdweb React SDK docs](https://portal.thirdweb.com/react/v5/ConnectButton) -- MEDIUM confidence (API changes frequently)
- Supabase SSR for Next.js: [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs) -- HIGH confidence
- @supabase/ssr replaces auth-helpers: [Supabase migration guide](https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM) -- HIGH confidence
- react-diff-viewer-continued uses Emotion: [npm page](https://www.npmjs.com/package/react-diff-viewer-continued) -- HIGH confidence
- lucide-react tree-shaking and downloads: [lucide.dev](https://lucide.dev/guide/packages/lucide-react) -- HIGH confidence
- State management 2025 best practices: [Multiple dev.to and blog sources](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) -- MEDIUM confidence
- All npm versions verified via `npm view [package] version` on 2026-03-03 -- HIGH confidence
