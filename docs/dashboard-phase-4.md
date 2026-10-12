# Dashboard interactions — Phase 4

New deal has an explicit Save draft action and save status. One contract draft per signed-in account stores the original text and saved-team-rule preference in Supabase. Refresh restores the last saved draft; unsaved changes trigger the browser's leave warning. Drafts do not retain AI review signatures: restored text must be analyzed again.

Loading a saved draft over unsaved text requires an inline confirmation. A failed request preserves current text. Revision checks reject stale saves across tabs, including draft cleanup after deal creation. The user is told if the deal was created but its saved draft could not be cleared. Requests use verified account ownership and same-origin checks; the draft function is executable only by the service role.

Team editor fields and search now survive sidebar navigation. An open team editor warns before a full-page unload; its unsubmitted fields are not saved to the server. Failed team saves remain visible instead of being cleared by portfolio polling.

## Setup and verification

- User applied `202610120001_contract_drafts.sql`; a read-only check confirmed the columns in the configured Supabase project.
- 47 tests passed. Cloud handler tests now cover draft save/load, stale revisions, account isolation, unauthenticated requests, cross-origin writes, oversized input and clearing. Schema tests verify client roles cannot execute the draft write function.
- Final production build passed using `.next-phase4-interactions`.
- Isolated browser QA verified save/reload recovery, replacement confirmation, preserved input on analysis failure, and team form persistence through sidebar navigation.
- The QA preview stores synthetic drafts in its own localStorage key to exercise reload recovery. Real drafts use Supabase; no production contract text is stored in localStorage.
- No external AI request, invoice or payout was triggered by UI QA.

Manual check: New deal → enter text → Save draft → refresh. Confirm the text and saved timestamp return. Edit without saving → Load saved draft → Keep editing to retain edits, or explicitly replace with the saved version.
