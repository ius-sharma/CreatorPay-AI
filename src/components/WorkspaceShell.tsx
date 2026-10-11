'use client';

import Link from 'next/link';
import { LayoutDashboard, BriefcaseBusiness, ReceiptText, Users, History, Settings2, Plus, ArrowUpRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export type WorkspaceView = 'overview' | 'deals' | 'detail' | 'new' | 'invoicing' | 'splits' | 'audit' | 'diagnostics';
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'deals', label: 'Deals', icon: BriefcaseBusiness },
  { id: 'invoicing', label: 'Invoices', icon: ReceiptText },
  { id: 'splits', label: 'Team', icon: Users },
  { id: 'audit', label: 'Payout activity', icon: History },
  { id: 'diagnostics', label: 'Connections', icon: Settings2 },
] as const;
export function WorkspaceShell({ view, onNavigate, title, description, merchant, children, busy }: { view: WorkspaceView; onNavigate: (view: WorkspaceView) => void; title: string; description: string; merchant: string; children: ReactNode; busy: boolean }) {
  return <div className="min-h-screen bg-[#F7F8FA] text-slate-900 selection:bg-orange-100">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
      <Link href="/" className="px-7 py-8 text-xl font-bold tracking-tight">CreatorPay<span className="text-brand-600">.</span></Link>
      <div className="mx-4 mb-7 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"><p className="text-sm font-semibold">Creator workspace</p><p className="mt-1 text-xs text-slate-500">Contracts & payments</p></div>
      <p className="px-7 pb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Workspace</p>
      <nav aria-label="Workspace navigation" className="space-y-1 px-3">{navigation.map(({id,label,icon: Icon}) => <button key={id} disabled={busy} aria-current={(view === id || (id === 'deals' && ['new','detail'].includes(view))) ? 'page' : undefined} onClick={() => onNavigate(id)} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm disabled:opacity-50 ${view === id || (id === 'deals' && ['new','detail'].includes(view)) ? 'bg-[#FDF0E9] font-semibold text-[#B94420]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[18px] w-[18px]" />{label}</button>)}</nav>
      <div className="mt-auto border-t border-slate-100 p-5"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">PayPal sandbox</p><p title={merchant} className="truncate text-xs text-slate-500">{merchant || 'Merchant not available'}</p><Link href="/account" className="mt-5 flex items-center justify-between text-sm font-medium">Account & sign out<ArrowUpRight className="h-4 w-4 text-slate-400" /></Link></div>
    </aside>
    <div className="lg:pl-60">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-slate-400"><Link href="/" className="font-semibold text-slate-700 lg:hidden">CreatorPay</Link><span className="hidden lg:inline">Workspace</span><ChevronRight className="h-3 w-3" /><span className="text-slate-600">{view === 'new' ? 'New deal' : view === 'detail' ? 'Deal details' : navigation.find(n => n.id === view)?.label}</span></div><div className="flex items-center gap-4"><span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800">Sandbox</span><Link href="/account" className="text-xs text-slate-600 lg:hidden">Account</Link></div></div>
        <nav aria-label="Mobile workspace navigation" className="-mb-1 mt-4 flex gap-1 overflow-x-auto pb-1 lg:hidden">{navigation.map(n => <button key={n.id} disabled={busy} aria-current={view === n.id ? 'page' : undefined} onClick={() => onNavigate(n.id)} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs ${view === n.id ? 'bg-orange-50 font-semibold text-brand-700' : 'text-slate-500'}`}>{n.label}</button>)}</nav>
      </header>
      <main id="workspace-content" className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>{view !== 'new' && <button disabled={busy} onClick={() => onNavigate('new')} className="flex items-center gap-2 rounded-lg bg-[#D94B27] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#BF3F20] disabled:opacity-50"><Plus className="h-4 w-4" />New deal</button>}</div>
        {children}
      </main>
    </div>
  </div>;
}
