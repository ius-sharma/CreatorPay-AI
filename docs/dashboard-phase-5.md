# Workspace foundations — Stage 5

Studio settings are available in Connections and Account. The authenticated settings API saves an account-owned display name and reads the account's actual daily AI usage. The sidebar displays the saved name. Display preferences do not change PayPal's invoice identity.

The overview setup checklist derives contract and payment completion from non-demo records with extracted terms and verified payments. It explicitly identifies the shared sandbox merchant. This is not individual merchant onboarding or production payment readiness.

The usage card shows reserved attempts, remaining requests, and the next UTC-day reset in the browser's local time. Contract and deliverable requests share the allowance; provider failures can consume a reserved attempt. Shared capacity and request spacing remain enforced by the existing backend.

Connections stays mounted after its first visit so sidebar navigation preserves an unfinished studio-name edit. A full-page exit warns about an unsaved name.

## Verification

- User applied `202610120002_workspace_profile.sql`; a read-only query verified the column in the configured project.
- 47 automated tests passed, including settings ownership, unauthenticated access, invalid names, cross-origin writes and exhausted usage.
- Production build passed; strict TypeScript remains enabled.
- Browser QA was attempted but the browser tool could not load its request-header policy. No visual verification is claimed for this stage.
- No real contract, AI analysis, invoice or payout was created during verification.

Manual check: Connections → edit Studio name → switch to Overview and back → verify the edit remains → Save studio name → refresh. The saved name should appear in the sidebar and Account, and the overview should mark the naming step complete. Refresh usage reads current usage without making an AI request.

Core Stage 5 changes were already committed before this resumed verification. The completion commit contains only the navigation fix, generated build-type include and this report; concurrent styling changes remain separate.
