import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NewPasswordForm } from '@/components/AccountRecoveryForm';
import '@/components/design-system.css';
export const dynamic = 'force-dynamic';
export default async function ResetPasswordPage() {
  let verified = false;
  try { const { data: { user }, error } = await createClient().auth.getUser(); verified = Boolean(user && !error); } catch { /* Recoverable service failure. */ }
  return <main className="auth-surface min-h-screen px-5 py-16 flex items-center justify-center"><section className="ui-panel w-full max-w-md p-8"><Link href="/" className="text-2xl font-bold">CreatorPay.</Link><h1 className="mt-8 mb-6 text-2xl font-semibold">Set a new password</h1>{verified ? <NewPasswordForm/> : <div className="space-y-5"><p>Your recovery session is missing or expired. Open the newest email link in the browser where you requested it.</p><Link className="ui-button" href="/login?mode=recover">Request a new link</Link></div>}</section></main>;
}
