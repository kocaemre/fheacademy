---
status: complete
phase: 04-auth-progress-and-backend
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-03-14T12:00:00Z
updated: 2026-03-14T14:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. ConnectButton in Header
expected: Header bar contains a wallet ConnectButton with Zama dark theme (gold/purple accents on dark background). Clicking it opens a wallet connection modal.
result: pass

### 2. MarkComplete on Lesson Page
expected: Navigating to any lesson page (e.g., Week 1, Lesson 1) shows a "Mark Complete" toggle button. Clicking it changes the button to a completed state (green check icon, text change). Clicking again toggles it back to incomplete.
result: pass

### 3. MarkComplete on Homework Page
expected: Navigating to any homework page shows the same MarkComplete toggle button that works identically to lesson pages.
result: pass

### 4. Progress Persists After Refresh
expected: After marking a lesson complete, refreshing the page (F5) preserves the completion state — the button still shows as completed.
result: pass

### 5. Sidebar Per-Week Progress
expected: Sidebar shows each week with a progress bar and fraction text (e.g., "2/6"). Completed items show green CheckCircle icons, incomplete items show gray Circle icons.
result: pass

### 6. Sidebar Footer Wallet Status
expected: When wallet is NOT connected, sidebar footer shows a ConnectButton and "Powered by Zama" text. When wallet IS connected, footer shows truncated wallet address and overall progress count.
result: pass

### 7. Week Overview Progress Section
expected: Navigating to a week overview page (e.g., /week/1) shows a progress section with completion count for that week's lessons and homework.
result: pass

### 8. Syllabus Page Progress Bars
expected: Syllabus page shows each week card with a per-week progress bar indicating how many items are completed in that week.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
