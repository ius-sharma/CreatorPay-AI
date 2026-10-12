# Dashboard design — Phase 3

Contract review and saved deals now share a document-and-terms view. Selecting a term highlights its exact supporting quote in the original agreement. Missing or mismatched quotes are explained explicitly; repeated quotes highlight their first occurrence. Only an explicit selection scrolls the document's inner pane.

The confirmation panel separates extracted terms from calculated milestones and saved team rules. Missing details remain blocking issues and require a new analysis. Deliverable review cards separate the contract requirement, submitted evidence and explanation, while retaining the human approval requirement for video checks.

## Verification

- 47 automated tests passed.
- Final production build passed with `.next-phase3-evidence`.
- Isolated browser QA verified exact highlighting and mismatched source handling.
- The `?view=new&scenario=clarification` QA fixture verified that missing billing details disable confirmation.
- The 390px mobile harness stacks the document and terms; body width and scroll width both measured 385px, with no page overflow.
- UI QA uses synthetic records and blocked external requests. No payment or payout was executed for this phase.

Server-saved drafts and remaining interaction work belong to Phase 4. This phase does not add video analysis or change payment verification.
