# Phase 6: landing page

Replaced the old animated marketing page with an editorial landing page that explains the implemented contract-to-collaborator workflow.

- Responsive hero and clearly labelled sample workspace.
- Interactive contract, evidence review and settlement examples; these make no API requests or payments.
- Explicit sandbox and human-review boundaries, FAQ, and login/signup links.
- Shared light/dark preference, keyboard focus styles, skip link and reduced-motion support.
- Updated page metadata and isolated landing styles.

## Validation

- Next production build passed using `.next-phase6-landing`.
- Browser checked desktop dark appearance and mobile light appearance at a 390px viewport. Document width matched scroll width (385px excluding scrollbar).
- Evidence and settlement preview switches, FAQ expansion, and theme toggle worked.
- Login and signup link destinations inspected in the rendered accessibility tree.
- No financial operations executed during this phase.

The landing page describes a sandbox prototype; it does not establish production payment readiness.
