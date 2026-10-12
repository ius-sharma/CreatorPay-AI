# Dashboard design — Phase 2

The overview uses a warm neutral palette, a three-column verified payment summary, an attention queue, recent deals, and a deadline/activity rail. Reusable brand marks, badges, section headings and empty states live in `WorkspaceUI.tsx`.

Summary figures retain the existing verification and currency rules. Attention and deadline lists cover all currencies and say so explicitly. Contract deadlines are not treated as invoice due dates. Mobile deals use stacked rows instead of a horizontally scrolling table. The shell retains its sidebar and theme preferences.

## Verification

- 47 automated tests passed, including authentication, ownership, verified money totals, invoice and payout protections.
- Production build passed with `.next-auth-check`.
- Browser checks with synthetic data: overview layout, light/dark modes, View all, deal search and opening the selected deal.
- 390px mobile iframe: body width and scroll width both 385px; stacked deal rows exposed correctly.
- No live payment or payout was executed for these UI checks.

## Reusable preview

Run `npm run qa:ui`, then open `http://127.0.0.1:3060/dashboard`. `/mobile` embeds the same dashboard at 390px. This preview loads no environment files and blocks external fetches. It includes a settled deal, a pending deal, a delayed deal selection, and a team save that fails once before succeeding. Account and landing routes are intentionally absent. Refresh resets fixtures; it does not affect real records.

The preview and the delayed-navigation/font fallback fixes were carried forward from the preceding QA work into this combined commit.

## Later phases

Contract source highlighting, server-saved drafts, merchant onboarding, notifications and global search remain separate work. Existing dependency advisories from the prior audit still require remediation before public release; this UI change does not resolve them.
