# Elite phase 4: account recovery and daily usability

## Changes
- Login offers password recovery and confirmation resend. Email requests use only the configured application origin, with generic responses that do not reveal account membership. Supabase enforces delivery limits; the 60-second UI cooldown is a convenience, not a security boundary.
- Recovery code exchange and recovery token verification lead to a password form. The server verifies the user before updating their password; mismatched or short passwords are rejected. Invalid links offer a fresh request.
- Deal search/stage and invoice search/status persist in URL parameters across workspace navigation, browser history and reload. Only four named context parameters are carried forward. Overview remains unfiltered. Search text is visible in browser history and copied URLs, so do not enter secrets into search.
- Mobile invoices use stacked cards below 768px with amount, status, milestone, due date and detail actions. Desktop retains the table.
- Empty results have Clear filters; an empty invoice hub links to Deals. Setup includes completing a deal after the first payment.

## Operator configuration and manual email check
Set `NEXT_PUBLIC_APP_URL` to the actual application origin. In Supabase Authentication / URL Configuration, allow that origin's `/auth/callback` and `/auth/callback?flow=recovery` redirect URLs. Use explicit production URLs. The default Supabase templates must honor `RedirectTo`; a custom reset template using token hashes should point to `/auth/confirm?token_hash={{ .TokenHash }}&type=recovery` on this application.

Request a reset from Login using your own account, open the newest email in the same browser, set a new password, then verify login with it. Test resend with an unconfirmed test account. Actual email delivery depends on Supabase mail/SMTP configuration and its rate limits. No real emails or password changes were performed during implementation.

References: [Supabase password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [update user](https://supabase.com/docs/reference/javascript/auth-updateuser), [rate limits](https://supabase.com/docs/guides/auth/rate-limits).

## Validation
- 52 automated tests passed, including recovery redirect handling, non-disclosing email responses, verified-user password updates, and filter context preservation; existing payment and persistence tests remain green.
- Browser visual verification was blocked by the browser tool security policy. Mobile layout and interactive Back/reload behavior require manual browser review.
- Production build passed with strict TypeScript checks; preview uses port 3053.
