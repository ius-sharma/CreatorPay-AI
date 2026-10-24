// Only the non-secret email is returned to the login page. Authentication stays normal.
export function judgeLoginEmail(): string | null {
  if (process.env.CREATORPAY_JUDGE_ACCESS !== 'true' || process.env.PAYPAL_ENVIRONMENT !== 'sandbox' || process.env.CREATORPAY_BACKEND !== 'supabase') return null;
  const email = process.env.CREATORPAY_JUDGE_EMAIL || 'judge@creatorpay.example';
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
