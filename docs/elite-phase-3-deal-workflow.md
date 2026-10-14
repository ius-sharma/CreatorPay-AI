# Elite Phase 3 — deal workflow

## Changes

- Deliverable transcript, description and video reference are held per deal in the dashboard session. Switching workspace views or deals preserves unfinished text. They are not stored in browser storage or automatically sent to a provider. The form explicitly explains that refresh/exit discards unsubmitted text; beforeunload and outbound-link confirmation protect that boundary. Submitting a successful review saves evidence through the existing authenticated API. Approval confirmation is not persisted.
- Validated `section` URLs make contract, invoices, deliverable, settlement and activity directly addressable. Refresh and browser history restore the section. Background payment updates do not switch the currently open section; the recommended next-action button remains available.
- Opening an already-loaded deal is immediate local navigation. It no longer waits for or writes a server-side active-deal selection. Invoice, review and payout requests continue to carry the explicit deal ID; the existing account-owned portfolio remains the source of available records.
- Invoice selection focuses and reveals its details heading. Closing details returns keyboard focus to the initiating button. The effect depends on selection, not polling, so repeated portfolio updates do not repeatedly scroll the page.

## Verification

- 49 automated tests passed, including new section URL validation/round-trip and unreviewed-evidence comparisons.
- Synthetic browser checks: entered transcript survived Deals → reopen same deal; Activity URL survived reload; browser Back restored the earlier section; invoice details focused their heading and close returned focus to the original invoice button.
- Synthetic preview uses blocked external requests and test records. No real AI request, invoice or payout was executed.
- Production build and TypeScript validation checked; build directory `.next-elite-phase3`.

## Scope and limits

Unsubmitted evidence is intentionally session-only, not a durable cloud draft. Browser exit warnings are subject to normal browser behavior; users should submit a review or copy their text before leaving. No schema migration is needed. Password recovery, filter restoration and the mobile invoice redesign remain in Phase 4. Production account/payment end-to-end flows were not repeated for this UI update.
