import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { data: { user }, error } = await createClient().auth.getUser();
  if (error || !user) redirect('/login');
  return <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">CreatorPay account</h1>
      <p>Signed in as <strong className="break-all">{user.email}</strong></p>
      <p className="text-sm text-slate-600">Your account is ready. Your workspace will be available after database setup is complete.</p>
      <SignOutButton />
    </div>
  </main>;
}
