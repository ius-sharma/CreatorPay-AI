'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate, type AuthState } from '@/app/login/actions';

function Submit({ signup }: { signup: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="ui-button w-full">{pending ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>;
}

export function LoginForm({ signup = false }: { signup?: boolean }) {
  const [state, action] = useFormState<AuthState, FormData>(authenticate, {});
  return <>
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={signup ? 'signup' : 'login'} />
      <label className="block text-sm font-medium">Email<input required type="email" name="email" autoComplete="email" maxLength={254} className="ui-field mt-2 block w-full" /></label>
      <label className="block text-sm font-medium">Password<input required type="password" name="password" minLength={signup ? 12 : undefined} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} className="ui-field mt-2 block w-full" /></label>
      {signup && <p className="text-sm text-slate-600">Use at least 12 characters. Confirm your email before logging in.</p>}
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
      <Submit signup={signup} />
    </form>
    <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-700"><Link href="/login?mode=recover">Forgot password?</Link><Link href="/login?mode=resend">Resend confirmation</Link></div>
    <Link href={signup ? '/login' : '/login?mode=signup'} className="mt-5 inline-block text-sm font-medium text-brand-700">{signup ? 'Already have an account? Log in' : 'New to CreatorPay? Create an account'}</Link>
  </>;
}
