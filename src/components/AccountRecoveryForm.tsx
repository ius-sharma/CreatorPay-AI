'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { requestAccountEmail, updatePassword, type AuthState } from '@/app/login/actions';

function Submit({ label, cooldown = 0 }: { label: string; cooldown?: number }) {
  const { pending } = useFormStatus();
  return <button className="ui-button w-full" disabled={pending || cooldown > 0}>{pending ? 'Please wait…' : cooldown ? `Try again in ${cooldown}s` : label}</button>;
}
export function AccountRecoveryForm({ mode }: { mode: 'recover' | 'resend' }) {
  const [state, action] = useFormState<AuthState, FormData>(requestAccountEmail, {});
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => { if (state.message) setCooldown(60); }, [state]);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(c => Math.max(0, c - 1)), 1000); return () => clearTimeout(timer); }, [cooldown]);
  return <form action={action} className="space-y-5">
    <input type="hidden" name="mode" value={mode}/>
    <label className="block text-sm font-medium">Email<input type="email" name="email" autoComplete="email" required maxLength={254} className="ui-field mt-2 block w-full"/></label>
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    {state.message && <p role="status" className="text-sm">{state.message}</p>}
    <Submit cooldown={cooldown} label={mode === 'recover' ? 'Send reset link' : 'Resend confirmation'}/>
    <Link className="block text-sm text-brand-700" href="/login">Back to log in</Link>
  </form>;
}
export function NewPasswordForm() {
  const [state, action] = useFormState<AuthState, FormData>(updatePassword, {});
  if (state.message) return <div className="space-y-5"><p role="status">{state.message}</p><Link className="ui-button" href="/account">Open account</Link></div>;
  return <form action={action} className="space-y-5">
    <label className="block text-sm">New password<input className="ui-field mt-2 block w-full" type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password"/></label>
    <label className="block text-sm">Confirm new password<input className="ui-field mt-2 block w-full" type="password" name="confirmation" required minLength={12} maxLength={128} autoComplete="new-password"/></label>
    <p className="text-xs text-slate-500">Use 12–128 characters. This updates the account verified by your recovery session.</p>
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    <Submit label="Update password"/>
    <Link className="block text-sm text-brand-700" href="/login?mode=recover">Request another reset link</Link>
  </form>;
}
