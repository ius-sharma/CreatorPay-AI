import { AccountRecoveryForm } from '@/components/AccountRecoveryForm';
import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import '@/components/design-system.css';

export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams: { mode?: string; error?: string } }) {
  const recovery = searchParams.mode === 'recover' || searchParams.mode === 'resend' ? searchParams.mode : null;
  const signup = searchParams.mode === 'signup';
  return <main className="auth-surface min-h-screen px-5 py-16 flex items-center justify-center">
    <div className="ui-panel mx-auto w-full max-w-md p-8">
      <Link href="/" className="text-2xl font-bold">CreatorPay<span className="text-brand-600">.</span></Link>
      <h1 className="mb-2 mt-8 text-2xl font-semibold">{recovery === 'recover' ? 'Reset your password' : recovery === 'resend' ? 'Confirm your email' : 'Your CreatorPay account'}</h1>
      <p className="mb-7 text-sm text-slate-600">{recovery ? "We will email a link to help you regain access." : signup ? 'Create your account to get started.' : 'Log in to open your workspace.'}</p>
      {searchParams.error === 'confirmation' && <p role="alert" className="mb-5 text-sm text-red-700">This email link could not be verified. It may have expired or already been used. Request a fresh link, or log in if your email is already confirmed.</p>}
      {recovery ? <AccountRecoveryForm key={recovery} mode={recovery}/> : <LoginForm key={signup ? 'signup' : 'login'} signup={signup} />}
    </div>
  </main>;
}
