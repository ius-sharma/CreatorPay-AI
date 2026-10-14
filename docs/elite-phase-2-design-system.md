# Elite Phase 2 — shared product design system

Completed 2026-10-14.

## Foundation

`src/components/design-system.css` owns semantic light/dark surface, text, border, accent, success, attention and danger colours. It also defines spacing, radius, focus and control-height rules. Overview no longer owns theme tokens needed by other screens.

Reusable CSS primitives:

- `ui-panel`: flat surface and restrained border/shadow; no decorative hover elevation.
- `ui-button`: primary action; `ui-button-secondary` for navigation/review and `ui-button-success` for approval/send confirmation. Native button type, disabled and submission behavior are retained.
- `ui-field` / `ui-search`: shared field sizing, background and focus treatment.
- `ui-status` with `data-tone`: labelled neutral, success, attention or danger states. Status wording remains visible; colour is supplemental.
- `ui-empty`: consistent empty-state typography and spacing.

FinanceUI exports the panel/field class names and status/empty components. WorkspaceBadge uses the same status primitive. Primary actions and fields in deal creation, evidence review, payout preparation, team, settings and login use the shared system. Account and invoice navigation use secondary buttons. Overview, contract evidence and draft controls use the same tokens while retaining their layout. Login branding now matches CreatorPay.

Existing utility-based secondary text and legacy dark-theme selectors remain as a compatibility layer; this is not a complete rewrite of every component. The landing page retains its own editorial layout. Later phases still own navigation recovery, password recovery, invoice mobile redesign and draft protection from the Phase 1 audit.

## Verification

- Production build passed in `.next-elite-phase2`, including TypeScript validation; strict mode remains enabled. The first restricted attempt could not download the existing Google font; the network-enabled build succeeded.
- Production login screen visually inspected in light mode.
- Isolated synthetic dashboard: dark overview, light invoice view and mobile new-contract form inspected. Theme toggle and navigation to invoices/new deal worked.
- At a 390px viewport the mobile form document width and scroll width both measured 385px (excluding scrollbar). No page-level horizontal overflow there. This does not certify every screen/breakpoint.
- Selected token contrast calculations: light body 14.58:1; light muted 5.67:1; light primary button 6.38:1; dark muted 7.72:1; dark primary button 7.79:1; light/dark success 6.40:1 / 7.66:1. These are palette checks, not a full accessibility certification.
- `git diff --check` passed. No backend/API changes or financial operations. The backend test suite was not rerun for this styling-only phase.

## Manual review

Run the build with `NEXT_BUILD_DIR=.next-elite-phase2`; the current local preview uses port 3051. Check Overview → Deals → Invoices → Team → Connections in both themes. Review a deal's contract, deliverable and settlement screens without initiating a payment. Check keyboard focus and narrow layouts; report any remaining clipping or inconsistent control.
