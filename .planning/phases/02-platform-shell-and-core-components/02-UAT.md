---
status: complete
phase: 02-platform-shell-and-core-components
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-03-03T16:00:00Z
updated: 2026-03-04T00:00:00Z
---

## Current Test
<!-- All tests complete -->

number: done
name: All tests passed
awaiting: none

## Tests

### 1. Sidebar Navigation with Curriculum Tree
expected: Visit /week/1/lesson/your-first-fhevm-contract. A sidebar appears on the left with 4 collapsible week groups. Each week expands to show its lessons. The current lesson is highlighted with a gold left border. A "Powered by Zama" footer appears at the bottom of the sidebar.
result: pass
notes: Sidebar visible with "FHE Academy" header, 4 weeks listed, Week 1 expanded showing 5 lessons + homework entry. Lesson 1.4 highlighted with gold left border. "Powered by Zama" footer with N logo at bottom.

### 2. Week Collapsible Groups
expected: In the sidebar, click a week header to collapse/expand its lesson list. Only the active week should be auto-expanded on page load. Other weeks should be collapsed by default.
result: pass
notes: Week 1 auto-expanded (contains active lesson). Weeks 2, 3, 4 collapsed with right-pointing chevrons. Clicking Week 2 header navigates to week overview.

### 3. Lesson Breadcrumb and Title
expected: On a lesson page, a breadcrumb trail appears at the top showing the navigation path (e.g., "Week 1 > Your First fhEVM Contract"). The lesson title and learning objective are displayed below the breadcrumb.
result: pass
notes: Breadcrumb shows "Week 1: From Solidity to Confidential Solidity > Lesson 1.4". Title "Your First FHEVM Contract: Counter Migration" rendered as h1. Learning objective paragraph below title.

### 4. Prev/Next Lesson Navigation
expected: At the bottom of a lesson page, prev/next buttons appear. Clicking "Next" navigates to the next lesson. On the first lesson, no "Previous" button shows. On the last lesson, no "Next" button shows. Navigation works across week boundaries.
result: pass
notes: Lesson 1.1 shows only "Next: Zama Ecosystem Overview" — no Previous button. Lesson 1.4 shows both "Previous: Development Environment Setup" and "Next: Testing Encrypted Contracts".

### 5. Week Overview Page
expected: Visit /week/1. A page displays with the week title and a list of all lessons in that week as clickable links, plus a homework entry.
result: pass
notes: Tested /week/2. Shows "Week 2 of 4" gold label, title "Mastering Encrypted Types and Access Control", description, lesson list (2.1-2.5) with numbered gold badges, types (Hands-On/Conceptual), and arrow navigation links.

### 6. CodeDiff Side-by-Side Comparison
expected: On the demo lesson (/week/1/lesson/your-first-fhevm-contract), a CodeDiff component shows Solidity code on the left and FHEVM code on the right side-by-side. The FHEVM side has gold-tinted highlighted lines showing the differences. On mobile-width, it stacks vertically.
result: pass
notes: Counter.sol on left panel, FHECounter.sol on right panel. FHEVM side has gold-tinted highlighted lines on changed/new lines (euint32, FHE.fromExternal, FHE.add, FHE.allowThis, FHE.allow). Desktop side-by-side layout confirmed.

### 7. CodeBlock with Copy Button
expected: On the demo lesson, a syntax-highlighted code block appears with an optional filename header. A copy button in the corner copies the code to clipboard and shows a checkmark briefly.
result: pass
notes: "imports.sol" filename header displayed. Solidity import statements syntax-highlighted with color tokens. Copy button (clipboard icon) visible in top-right corner, accessible and clickable.

### 8. Quiz with Single-Attempt Feedback
expected: On the demo lesson, a multiple-choice quiz appears. Select an answer and submit. Correct answers show green feedback, incorrect show red with the correct answer revealed. You cannot re-attempt after submitting. An explanation appears after answering.
result: pass
notes: Quiz question rendered with 4 options. Selected option highlighted with gold border. After clicking "Check", green "Correct!" label appeared with explanation text. Other options greyed out/disabled — no retry possible.

### 9. CalloutBox Variants
expected: On the demo lesson, callout boxes appear with different colored left borders and icons for different types (tip, warning, info, or mistake). Each has appropriate background tinting.
result: pass
notes: Two variants confirmed: Tip ("Migration Pattern") with lightbulb icon and gold/amber left border + background tint. Warning ("ACL Required") with triangle alert icon and orange left border + background tint.

### 10. InstructorNotes Collapsible Section
expected: On the demo lesson, an "Instructor Notes" section appears collapsed by default with a BookOpen icon. Clicking it expands to reveal the notes content.
result: pass
notes: Collapsed by default with BookOpen icon, "Instructor Notes" label, and down chevron. Clicked to expand — revealed bullet points with teaching tips about ACL, externalEuint32 vs euint32, and allowThis. Chevron rotated to up arrow when expanded.

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
