'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate, type AuthState } from '@/app/login/actions';

function Submit({ signup }: { signup: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{pending ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>;
}

export function LoginForm() {
  const [signup, setSignup] = useState(false);
  const [state, action] = useFormState<AuthState, FormData>(authenticate, {});
  return <>
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={signup ? 'signup' : 'login'} />
      <label className="block text-sm font-medium">Email<input required type="email" name="email" autoComplete="email" maxLength={254} className="mt-2 block w-full rounded-xl border border-slate-300 px-3 py-3" /></label>
      <label className="block text-sm font-medium">Password<input required type="password" name="password" minLength={signup ? 12 : undefined} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} className="mt-2 block w-full rounded-xl border border-slate-300 px-3 py-3" /></label>
      {signup && <p className="text-sm text-slate-600">Use at least 12 characters. Confirm your email before logging in.</p>}
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
      <Submit signup={signup} />
    </form>
    <button type="button" onClick={() => setSignup(!signup)} className="mt-5 text-sm font-medium text-brand-700">{signup ? 'Already have an account? Log in' : 'New to CreatorPay? Create an account'}</button>
  </>;
}
