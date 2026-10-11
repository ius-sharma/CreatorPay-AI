'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signOut, type AuthState } from '@/app/login/actions';

function Button() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-xl border border-slate-300 px-4 py-2 disabled:opacity-50">{pending ? 'Signing out…' : 'Sign out'}</button>;
}
export function SignOutButton() {
  const [state, action] = useFormState<AuthState>(signOut, {});
  return <form action={action}><Button />{state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}</form>;
}
