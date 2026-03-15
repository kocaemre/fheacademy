# Phase 4: Auth, Progress, and Backend - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can connect their wallet via thirdweb ConnectButton and their lesson completion progress persists across devices via Supabase, with visual progress indicators throughout the platform. All content remains publicly accessible — wallet is optional. 24 completable items (20 lessons + 4 homeworks).

</domain>

<decisions>
## Implementation Decisions

### Wallet Connect Placement & UX
- ConnectButton in BOTH top header bar AND sidebar footer
- Header: primary connect action (Zama-branded styling, gold/purple accents — not thirdweb default)
- Sidebar footer: wallet status showing truncated address + overall progress (e.g., "12/24 lessons") when connected
- After connecting: subtle confirmation (toast/animation), user stays on current page, progress syncs silently in background
- When disconnected: sidebar footer shows ConnectButton instead of wallet status

### Mark as Complete Interaction
- "Mark as Complete" button at the bottom of lesson content, near prev/next navigation
- Both lessons (20) and homeworks (4) are completable — 24 total items
- Completion is reversible — clicking completed button toggles back to incomplete
- Visual feedback: button transforms to green checkmark with brief animation, sidebar lesson icon updates from empty Circle to green CheckCircle

### Progress Display Locations
- Sidebar week headers: thin progress bar + fraction text (e.g., "3/6") next to each "Week N"
- Week overview pages: larger progress section showing per-week completion
- Syllabus page: per-week progress bars on each week section
- Sidebar lesson icons: green CheckCircle replaces empty Circle for completed lessons
- Sidebar footer (when connected): overall progress count

### localStorage vs Supabase Sync
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

</decisions>

<specifics>
## Specific Ideas

- ConnectButton must be custom-styled to match Zama brand (dark theme, gold/purple) — not thirdweb default
- Progress should feel lightweight — thin bars and small fractions, not heavy dashboard widgets
- Sidebar is the primary progress surface since users spend most time in lesson views
- "Powered by Zama" text in sidebar footer gets replaced/repositioned when wallet is connected

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/skeleton.tsx`: Can be used for loading states when fetching progress from Supabase
- `components/ui/button.tsx`: Base for "Mark as Complete" button (shadcn/ui)
- `components/ui/sidebar.tsx`: Full shadcn sidebar system — SidebarFooter available for wallet status
- `lib/curriculum.ts`: Exports `curriculum`, `getAllLessons()`, `getAllHomeworks()` — 24 items to track
- `lib/utils.ts`: Has `cn()` utility for conditional classNames

### Established Patterns
- Tailwind v4 with CSS custom properties for theming (globals.css)
- shadcn/ui component library (radix primitives)
- Content registry pattern in lesson page — maps week-lesson to components
- Server components by default, "use client" only where needed (sidebar)
- Lucide icons (Circle, CheckCircle available)

### Integration Points
- `app/layout.tsx`: Needs thirdweb ThirdwebProvider wrapper — currently bare
- `components/layout/app-sidebar.tsx`: Needs progress indicators per week + completion icons per lesson + wallet status in footer
- `components/layout/lesson-layout.tsx`: Needs "Mark as Complete" button at bottom
- `app/(academy)/week/[weekId]/lesson/[lessonId]/page.tsx`: May need to pass completion state to LessonLayout
- `app/(academy)/syllabus/page.tsx`: Needs per-week progress bars
- `package.json`: Needs thirdweb and @supabase/supabase-js dependencies

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-auth-progress-and-backend*
*Context gathered: 2026-03-04*
