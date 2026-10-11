import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AccountSettings } from '@/components/AccountSettings';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { data: { user }, error } = await createClient().auth.getUser();
  if (error || !user) redirect('/login');
  return <AccountSettings email={user.email || 'Email unavailable'} confirmed={Boolean(user.email_confirmed_at)} createdAt={user.created_at} workspaceReady={process.env.CREATORPAY_BACKEND === 'supabase'} />;
}
