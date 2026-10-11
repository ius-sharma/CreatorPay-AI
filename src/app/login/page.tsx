import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams: { mode?: string; error?: string } }) {
  const signup = searchParams.mode === 'signup';
  return <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link href="/" className="text-2xl font-bold">CreatorPay<span className="text-brand-600">.AI</span></Link>
      <h1 className="mb-2 mt-8 text-2xl font-semibold">Your CreatorPay account</h1>
      <p className="mb-7 text-sm text-slate-600">{signup ? 'Create your account to get started.' : 'Log in to open your workspace.'}</p>
      {searchParams.error === 'confirmation' && <p role="alert" className="mb-5 text-sm text-red-700">This confirmation link could not be verified. It may have expired or already been used. If you already confirmed your email, log in below.</p>}
      <LoginForm key={signup ? 'signup' : 'login'} signup={signup} />
    </div>
  </main>;
}
