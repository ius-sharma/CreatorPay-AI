'use client';

import Link from 'next/link';
import { LayoutDashboard, BriefcaseBusiness, ReceiptText, Users, History, Settings2, Plus, ArrowUpRight, ChevronRight, PanelLeftClose, PanelLeftOpen, UserRound } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

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
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem('creatorpay.sidebar.collapsed') === 'true'); } catch { /* Storage may be unavailable. */ }
  }, []);
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('creatorpay.sidebar.collapsed', String(next)); } catch { /* Keep the toggle usable without storage. */ }
  };
  return <div className="min-h-screen bg-[#F7F8FA] text-slate-900 selection:bg-orange-100">
    <aside id="workspace-sidebar" aria-label="Sidebar" className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 motion-reduce:transition-none lg:flex ${collapsed ? 'w-20' : 'w-60'}`}>
      <div className={`flex h-24 shrink-0 items-center ${collapsed ? 'justify-center' : 'justify-between px-6'}`}>
        <Link href="/" aria-label="CreatorPay home" title={collapsed ? 'CreatorPay home' : undefined} className="text-xl font-bold tracking-tight">{collapsed ? 'C' : 'CreatorPay'}<span className="text-brand-600">.</span></Link>
        {!collapsed && <button type="button" onClick={toggleSidebar} aria-label="Collapse sidebar" aria-expanded={true} aria-controls="workspace-sidebar" title="Collapse sidebar" className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><PanelLeftClose className="h-4 w-4" /></button>}
      </div>
      {collapsed ? <button type="button" onClick={toggleSidebar} aria-label="Expand sidebar" aria-expanded={false} aria-controls="workspace-sidebar" title="Expand sidebar" className="mx-auto mb-7 rounded-lg p-3 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><PanelLeftOpen className="h-5 w-5" /></button> : <div className="mx-4 mb-7 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"><p className="text-sm font-semibold">Creator workspace</p><p className="mt-1 text-xs text-slate-500">Contracts & payments</p></div>}
      {!collapsed && <p className="px-7 pb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Workspace</p>}
      <nav aria-label="Workspace navigation" className="min-h-0 space-y-1 overflow-y-auto px-3">{navigation.map(({id,label,icon: Icon}) => <button key={id} disabled={busy} aria-label={label} title={collapsed ? label : undefined} aria-current={(view === id || (id === 'deals' && ['new','detail'].includes(view))) ? 'page' : undefined} onClick={() => onNavigate(id)} className={`flex w-full items-center rounded-lg py-3 text-sm disabled:opacity-50 ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} ${view === id || (id === 'deals' && ['new','detail'].includes(view)) ? 'bg-[#FDF0E9] font-semibold text-[#B94420]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[18px] w-[18px] shrink-0" />{!collapsed && label}</button>)}</nav>
      <div className={`mt-auto shrink-0 border-t border-slate-100 ${collapsed ? 'p-3' : 'p-5'}`}>
        {!collapsed && <><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">PayPal sandbox</p><p title={merchant} className="truncate text-xs text-slate-500">{merchant || 'Merchant not available'}</p></>}
        <Link href="/account" aria-label="Account & sign out" title={collapsed ? 'Account & sign out' : undefined} className={`flex items-center rounded-lg text-sm font-medium ${collapsed ? 'justify-center py-3 hover:bg-slate-50' : 'mt-5 justify-between'}`}>{collapsed ? <UserRound className="h-5 w-5 text-slate-500" /> : <>Account & sign out<ArrowUpRight className="h-4 w-4 text-slate-400" /></>}</Link>
      </div>
    </aside>
    <div className={`transition-[padding] duration-200 motion-reduce:transition-none ${collapsed ? 'lg:pl-20' : 'lg:pl-60'}`}>
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
