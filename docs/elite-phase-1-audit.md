# Elite upgrade — Phase 1 product audit

Date: 2026-10-13. Baseline: `cd00ba5`.

## Decision

Keep the existing contract-to-payment workflow. The next investment should be consistent components, protection of unfinished work, and clearer navigation/recovery. A second decorative dashboard rebuild would leave the most consequential gaps unresolved.

This is a source-backed product audit, not a security certification or production-readiness assessment. Current source for landing, authentication, workspace navigation, overview, deal detail, invoices, team, setup, drafts and payout controls was inspected. No user records, credentials or payments were changed. The isolated synthetic preview started, but browser navigation failed with connection errors; fresh visual, keyboard and mobile verification remains pending. Earlier Phase 6 landing checks are historical evidence only. No build or test suite was rerun for this documentation-only change.

## Preserve

- Deal details already have a five-stage timeline and a recommended next action (`DealWorkspace.tsx`). Phase 3 should refine these, not introduce them again.
- Contract source evidence and human deliverable approval are already explicit.
- Overview excludes sample deals from financial totals and separates currencies (`workspace-summary.ts`).
- Draft saving has revisions, conflict handling and protection against overwriting edits made during a request (`useContractDraft.ts`).
- Workspace routes support deal IDs and browser history (`workspace-navigation.ts`).
- Team and Connections forms stay mounted across workspace navigation.
- Payout controls distinguish pending/failed items from verified successful transfers. Preserve this distinction throughout redesign.
- Landing copy clearly identifies sandbox operation and the limits of text-based AI review.

## Prioritized findings

P1 = resolve before inviting wider user trials. P2 = product polish/usability or scaling work. Effort is relative, not a time estimate.

| ID | Priority / effort | Evidence and user impact | Proposed change and acceptance condition |
| --- | --- | --- | --- |
| E01 | P1 / M | `DeliverableReviewPanel.tsx:6-8` stores transcript, description and URL only in component state. `dashboard/page.tsx:247` unmounts deal detail when leaving it. In-progress submission text can disappear when visiting another workspace view. Contract drafts already have stronger protection. | Preserve a draft per deal or explicitly guard navigation. Type evidence, leave the deal and return: text remains. Refresh behavior is clearly communicated. Do not persist the human approval checkbox as an approval decision. |
| E02 | P1 / M | `LoginForm.tsx` exposes login/signup only. The expired-confirmation message in `login/page.tsx` offers no resend action. A forgotten password or expired link leaves users without in-product recovery. | Add password recovery and confirmation resend with safe responses, rate limits, and return states. Test valid, expired and already-used links without exposing account existence. |
| E03 | P2 / M | Overview uses CSS variables in `workspace-overview.css`; finance and deal panels duplicate gradients and utility colours (`FinanceUI.tsx:2`, `DealWorkspace.tsx:12`). Theme CSS also overrides utility selectors. Landing and login use different branding treatments. | Shared semantic surface, text, border, state and focus tokens plus Button, Field, Status, Panel and Empty primitives. Validate all active screens in both themes; retain financial state semantics. |
| E04 | P2 / S–M | `DealWorkspace.tsx:21` keeps the chosen section in local state; the URL records only view/deal. Refresh or reopening the deal returns to its recommended section, not the section the user was reading. | Encode the section in the URL and restore it through refresh/Back/Forward. Link directly to an invoice or settlement without losing the current deal. |
| E05 | P2 / M | `dashboard/page.tsx:109-131` waits for a switch-deal POST before navigation and disables workspace actions through a shared busy flag. This adds a network dependency to reading an already-loaded deal. | Open cached deal content promptly with scoped loading and independent mutation state. With a deliberately delayed response, navigation remains responsive; failed synchronization is visible and never changes the wrong deal. |
| E06 | P2 / M | `dashboard/page.tsx:87` fetches the portfolio every five seconds without visibility/offline backoff. `supabase/workspace.ts` reads the owner's full collections in database pages. This is a scaling risk, not a measured performance failure. | Pause background polling when hidden, back off on failure, expose last refreshed/stale status, and measure payload/latency as record counts grow before choosing pagination or subscriptions. Never label stale data as newly verified. |
| E07 | P2 / S–M | Invoice selection appends details below the table (`InvoicingHubView.tsx:17-18`) without moving focus or announcing the new detail. A long list makes the action's result hard to discover. | Use a clearly located detail view/panel with an accessible heading, predictable focus and return to the invoking row. Keyboard and screen-reader checks must confirm the result is discoverable. |
| E08 | P2 / M | Invoice table has a 720px minimum width and horizontal scrolling; overview already has separate mobile deal cards. Mobile treatment is inconsistent by implementation, although overflow/clipping was not visually reproduced in this audit. | Mobile invoice summary rows that keep amount, status and primary action visible; retain full details on demand. Verify 360/390/768px and 200% zoom without page-level horizontal overflow. |
| E09 | P2 / S–M | Deal query/filter and invoice query/status/selection are local component state (`WorkspaceHome.tsx`, `InvoicingHubView.tsx`). Leaving and returning to these unmounted views resets the user's working context. | Restore filters/search via URL or session state. Open a result, go Back, and see the same query, filter and list position. |
| E10 | P2 / S | Invoice empty state instructs users to open a deal but has no action (`InvoicingHubView.tsx:17`). Workspace setup covers naming, contract and first payment but stops before deliverable approval and settlement (`WorkspaceSetup.tsx`). | Contextual empty-state actions and a second, deal-level completion guide. A first-time tester should reach the correct next screen without verbal directions. |

## Updated implementation sequence

1. **Phase 1 (this document):** evidence-backed priorities and acceptance checks. Pending browser checks below remain explicit.
2. **Phase 2 — design system:** E03. Start with existing Overview as the reference; unify active screens and controls. Do not change payment logic during styling.
3. **Phase 3 — deal experience:** E01 first, then E04/E05/E07. Protect entered work and make every next action discoverable.
4. **Phase 4 — onboarding and usability:** E02/E08/E09/E10. Account recovery is a prerequisite for wider user trials even if those trials start before this phase.
5. **Phase 5 — reliability:** E06 plus fault-injection checks for duplicate clicks, delayed responses, stale sessions, failed saves, ownership and payment reconciliation. Existing controls must be tested, not presumed absent or certified by appearance.
6. **Phase 6 — real-user finishing:** moderated trials, accessible/mobile verification, measured performance, focused fixes and demo preparation.

## Manual verification matrix still required

| Journey | Required states | Pass condition |
| --- | --- | --- |
| Authentication | signup, login, invalid credentials, expired confirmation, expired session | Clear next action; input and error association; no unintended dashboard bypass |
| New contract | empty, typing, save, failed save, cross-tab conflict, analysis clarification | No silent lost edits; source evidence readable; one intentional confirmation |
| Deal review | unpaid, missing evidence, uncertain evidence, approved | Blocked stages explain why; user can recover and return without losing text |
| Invoices/payouts | pending, verified, failed, unknown response, successful transfer | Accurate states and evidence; duplicate attempts do not create duplicate payments |
| Navigation | sidebar, mobile nav, Back/Forward, deep links, refresh | Current context and focus are predictable; no automatic scroll jumps |
| Presentation | light/dark, 360/390/768/1440px, keyboard, 200% zoom, reduced motion | Readable and operable without clipped essential controls |

Use synthetic fixtures for UI checks; real financial actions are outside this audit. The preview fixtures intentionally differ from production and cannot establish backend correctness.

## User-trial gate

Recruit 3 creators/editors for an initial directional study. Give tasks rather than instructions: create a deal, find the source for an amount, explain a blocked approval, locate a verified receipt. Record completion, errors, requests for help and time actually spent. Aim for all 3 to complete the core path without coaching; this is an acceptance target, not a measured result or statistical claim.

Do not spend this cycle on more gradients, decorative 3D, fake activity, a new AI chat panel, invented usage metrics or live-payment claims. The differentiator is evidence and control across the complete deal.
