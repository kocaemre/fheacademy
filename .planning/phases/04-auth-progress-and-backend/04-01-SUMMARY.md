---
phase: 04-auth-progress-and-backend
plan: 01
subsystem: auth
tags: [thirdweb, supabase, react-context, localStorage, wallet, progress-tracking]

# Dependency graph
requires:
  - phase: 03-full-curriculum-content
    provides: "curriculum.ts with Week/Lesson/Homework types and data (24 completable items)"
provides:
  - "ThirdwebProviderWrapper wrapping root layout for wallet state"
  - "ProgressProvider context with useProgress() hook for completion tracking"
  - "/api/progress API route for Supabase CRUD (GET/POST)"
  - "lib/progress.ts with getItemId, getWeekItems, getAllItems, TOTAL_ITEMS"
  - "lib/thirdweb-client.ts singleton client"
  - "lib/supabase-client.ts server-side client"
affects: [04-02-progress-ui, 05-dashboard]

# Tech tracking
tech-stack:
  added: [thirdweb@5.119.0, "@supabase/supabase-js@2.98.0"]
  patterns: [client-provider-wrapper, react-context-with-localStorage, union-merge-sync, api-route-upsert]

key-files:
  created:
    - lib/thirdweb-client.ts
    - lib/supabase-client.ts
    - lib/progress.ts
    - components/providers/thirdweb-provider.tsx
    - components/providers/progress-provider.tsx
    - app/api/progress/route.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - app/layout.tsx
    - app/(academy)/layout.tsx

key-decisions:
  - "Used pnpm (project package manager) instead of npm to install dependencies"
  - "ProgressProvider wraps outside SidebarProvider for correct context hierarchy"
  - "isSyncing ref prevents race conditions during wallet-connect merge"
  - "localStorage is resilient fallback — Supabase errors are logged but never block UI"

patterns-established:
  - "Provider wrapper pattern: 'use client' component imported into server layout"
  - "Progress item ID format: 'lesson-{weekId}-{slug}' and 'homework-{weekId}-{slug}'"
  - "localStorage + Supabase union merge on wallet connect"
  - "API route with service_role key bypassing RLS"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 38min
completed: 2026-03-04
---

# Phase 4 Plan 01: Auth Infrastructure Summary

**ThirdwebProvider + ProgressProvider context with localStorage persistence, Supabase sync via /api/progress, and progress utility module for 24 completable curriculum items**

## Performance

- **Duration:** 38 min
- **Started:** 2026-03-04T12:13:11Z
- **Completed:** 2026-03-04T12:51:00Z
- **Tasks:** 2/2
- **Files modified:** 10

## Accomplishments
- Installed thirdweb v5 and Supabase JS client with proper peer dependency handling
- Built ProgressProvider with full localStorage + Supabase sync lifecycle including union merge on wallet connect
- Created /api/progress API route with GET (fetch by wallet) and POST (upsert) with error handling
- Wired ThirdwebProviderWrapper into root layout and ProgressProvider into academy layout
- Created progress utility module with deterministic item IDs from curriculum data

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, create client singletons, and progress utility module** - `959a315` (feat)
2. **Task 2: Create ThirdwebProvider wrapper, ProgressProvider context, API route, and wire into layouts** - `9d42b1d` (feat)

## Files Created/Modified
- `lib/thirdweb-client.ts` - Singleton thirdweb client using NEXT_PUBLIC_THIRDWEB_CLIENT_ID
- `lib/supabase-client.ts` - Server-side Supabase client using service role key
- `lib/progress.ts` - Item ID generation (getItemId, getWeekItems, getAllItems, TOTAL_ITEMS, getWeekTotal)
- `components/providers/thirdweb-provider.tsx` - "use client" wrapper for ThirdwebProvider
- `components/providers/progress-provider.tsx` - React Context with localStorage + Supabase sync, useProgress hook
- `app/api/progress/route.ts` - GET/POST route for Supabase progress CRUD
- `app/layout.tsx` - Added ThirdwebProviderWrapper wrapping children
- `app/(academy)/layout.tsx` - Added "use client", ProgressProvider wrapping SidebarProvider
- `package.json` - Added thirdweb and @supabase/supabase-js dependencies
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- **pnpm over npm:** Project uses pnpm (`.pnpm` node_modules structure + pnpm-lock.yaml). npm 11 had arborist bugs that prevented installation. Used pnpm as the correct package manager.
- **ProgressProvider outside SidebarProvider:** ProgressProvider wraps SidebarProvider in academy layout so both sidebar components and page content have access to progress context.
- **isSyncing ref for race condition prevention:** Used a ref (not state) to track sync status, preventing Supabase writes during the wallet-connect merge operation.
- **Wallet address lowercasing:** Both API route and client normalize wallet addresses to lowercase to prevent case-sensitivity issues with Supabase lookups.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm arborist bug prevented dependency installation**
- **Found during:** Task 1 (dependency installation)
- **Issue:** npm 11.7.0 had a bug in `@npmcli/arborist` causing "Cannot read properties of null (reading 'name')" during dependency resolution. This affected all npm install operations, not just thirdweb.
- **Fix:** Updated npm to 11.11.0, then discovered project uses pnpm (pnpm-lock.yaml + .pnpm node_modules). Used `pnpm add` which resolved cleanly.
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** `pnpm add thirdweb @supabase/supabase-js` completed successfully
- **Committed in:** 959a315 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Package manager detection was necessary to complete installation. No scope creep.

## Issues Encountered
- thirdweb has optional peer dependency on react-native which pulls react@^19.2.3, conflicting with project's react@19.1.0. Since react-native is optional and irrelevant for web-only use, pnpm correctly handles this as a warning rather than an error.

## User Setup Required

**External services require manual configuration.** The following must be set up before wallet connection and Supabase sync will function:

### thirdweb
1. Create account at https://thirdweb.com/dashboard
2. Create a project and copy the Client ID
3. Add deployment domain to allowed origins
4. Set `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` in `.env.local`

### Supabase
1. Create project at https://supabase.com/dashboard
2. Run SQL to create progress table:
   ```sql
   CREATE TABLE progress (
     wallet_address TEXT PRIMARY KEY,
     completions JSONB NOT NULL DEFAULT '[]'::jsonb,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
   ```
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

**Note:** The app builds and runs without these services configured. Anonymous progress (localStorage) works immediately. Wallet connection and Supabase sync require the above setup.

## Next Phase Readiness
- All providers and context hooks ready for Plan 02 UI integration
- `useProgress()` hook available for MarkComplete button, progress bars, sidebar indicators
- `ThirdwebProvider` available for `ConnectButton` component in header and sidebar
- `getItemId`, `getWeekItems`, `getAllItems` ready for computing progress per-lesson and per-week

---
*Phase: 04-auth-progress-and-backend*
*Completed: 2026-03-04*
