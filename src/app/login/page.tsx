import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link href="/" className="text-2xl font-bold">CreatorPay<span className="text-brand-600">.AI</span></Link>
      <h1 className="mb-2 mt-8 text-2xl font-semibold">Your CreatorPay account</h1>
      <p className="mb-7 text-sm text-slate-600">Log in or create your account.</p>
      <LoginForm />
    </div>
  </main>;
}
