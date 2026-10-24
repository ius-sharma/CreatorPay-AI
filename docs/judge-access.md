# Dedicated judging account

The sandbox login page can offer **Judge sign-in**, with the dedicated email prefilled. Judges still enter the password supplied in private testing instructions. A successful normal Supabase password login opens the dashboard. There is no passwordless bypass, anonymous session, embedded browser password or use of the operator's account.

## Operator setup
With the existing Supabase configuration and PayPal sandbox environment in private `.env.local`, run:

```sh
node scripts/setup-judge.cjs --create
```

This creates only `judge@creatorpay.example`, auto-confirms that test identity server-side and initializes its own empty workspace. It does not copy personal deals, send an invitation email, create payments or reset an existing account's password. The script checks password login and authenticated workspace isolation before enabling the UI shortcut. An existing unrelated identity with the same email is refused. Re-running with the same private credential file reuses the marked test identity without resetting records.

Credentials are written to ignored `.data/judge-access.json` and `.data/judge-access.md`. The password is randomly generated and is never printed or committed. Supply it through the hackathon's private testing instructions, along with the deployed `/login?mode=judge` URL. The `.example` email has no inbox; the test account is already confirmed and password recovery mail is not a setup requirement.

The script sets `CREATORPAY_JUDGE_ACCESS=true` and `CREATORPAY_JUDGE_EMAIL=judge@creatorpay.example` privately. Restart the local server. Set those same non-secret values on the eventual judging host. The shortcut is hidden unless enabled explicitly with `CREATORPAY_BACKEND=supabase` and `PAYPAL_ENVIRONMENT=sandbox`. The flag controls discoverability, not account authorization: normal authentication is always required.

## Judge experience
Use only synthetic contracts: reviewers sharing this account can see and change its records and share its AI quota. Start with **New deal**, a sample contract or text PDF, then review/confirm its terms. No records are labelled paid without actual sandbox verification. Testing checkout and payouts additionally requires separately prepared buyer/receiver sandbox access; application login does not log into PayPal.

Keep access available through judging. Afterwards disable the identity in Supabase and set `CREATORPAY_JUDGE_ACCESS=false`; hiding the shortcut alone does not revoke an existing account or session. Never reuse this account for live money or real customer documents.

Reference: [Supabase server-side user creation and email confirmation](https://supabase.com/docs/reference/javascript/auth-admin-createuser).

Validation: 58 automated tests and the production build passed. Live account provisioning is pending: the Supabase project was paused and its address did not resolve during setup. The script made no account changes before that failed preflight.
