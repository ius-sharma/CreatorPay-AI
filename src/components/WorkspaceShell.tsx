'use client';

import Link from 'next/link';
import './workspace-theme.css';
import { LayoutDashboard, BriefcaseBusiness, ReceiptText, Users, History, Settings2, Plus, ArrowUpRight, ChevronRight, PanelLeftClose, PanelLeftOpen, UserRound, Moon, Sun } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import type { WorkspaceView } from '@/lib/workspace-navigation';
export type { WorkspaceView } from '@/lib/workspace-navigation';
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'deals', label: 'Deals', icon: BriefcaseBusiness },
  { id: 'invoicing', label: 'Invoices', icon: ReceiptText },
  { id: 'splits', label: 'Team', icon: Users },
  { id: 'audit', label: 'Payout activity', icon: History },
  { id: 'diagnostics', label: 'Connections', icon: Settings2 },
] as const;
export function WorkspaceShell({ view, onNavigate, title, description, merchant, children, busy, workspaceName = 'Creator workspace' }: { view: WorkspaceView | 'account'; onNavigate: (view: WorkspaceView) => void; title: string; description: string; merchant: string; children: ReactNode; busy: boolean; workspaceName?: string }) {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem('creatorpay.sidebar.collapsed') === 'true'); } catch { /* Storage may be unavailable. */ }
  }, []);
  useEffect(() => {
    const apply = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem('creatorpay_theme'); } catch {}
      const value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(value);
      document.documentElement.classList.toggle('dark', value);
    };
    apply();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    window.addEventListener('storage', apply);
    return () => { media.removeEventListener('change', apply); window.removeEventListener('storage', apply); };
  }, []);
  const toggleTheme = () => {
    const value = !dark;
    setDark(value);
    document.documentElement.classList.toggle('dark', value);
    try { localStorage.setItem('creatorpay_theme', value ? 'dark' : 'light'); } catch {}
  };
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('creatorpay.sidebar.collapsed', String(next)); } catch { /* Keep the toggle usable without storage. */ }
  };
  return <div data-theme={dark ? 'dark' : 'light'} data-collapsed={collapsed} className="workspace min-h-screen bg-[#F7F8FA] text-slate-900 selection:bg-orange-100">
    <aside id="workspace-sidebar" aria-label="Sidebar" className={`workspace-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white lg:flex ${collapsed ? 'w-20' : 'w-60'}`}>
      <div className="flex h-24 shrink-0 items-center overflow-hidden px-7">
        <Link href="/" aria-label="CreatorPay home" title="CreatorPay home" className="flex items-center whitespace-nowrap text-xl font-bold tracking-tight">C<span className="sidebar-label">reatorPay</span><span className="text-brand-600">.</span></Link>
      </div>
      <div className="mx-3 mb-5 flex h-16 shrink-0 items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-2">
        <button type="button" onClick={toggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="workspace-sidebar" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</button>
        <div className="sidebar-label whitespace-nowrap"><p title={workspaceName} className="max-w-[145px] truncate text-xs font-semibold">{workspaceName}</p><p className="mt-1 text-[10px] text-slate-500">Contracts & payments</p></div>
      </div>
      <p aria-hidden={collapsed} className="sidebar-caption h-7 whitespace-nowrap px-7 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Workspace</p>
      <nav aria-label="Workspace navigation" className="min-h-0 space-y-1 overflow-y-auto overflow-x-hidden px-3">{navigation.map(({id,label,icon: Icon}) => <button key={id} disabled={busy} aria-label={label} title={collapsed ? label : undefined} aria-current={(view === id || (id === 'deals' && ['new','detail'].includes(view))) ? 'page' : undefined} onClick={() => onNavigate(id)} className={`flex w-full items-center overflow-hidden rounded-lg px-[18px] py-3 text-sm disabled:opacity-50 ${view === id || (id === 'deals' && ['new','detail'].includes(view)) ? 'bg-[#FDF0E9] font-semibold text-[#B94420]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-[18px] w-[18px] shrink-0" /><span className="sidebar-label whitespace-nowrap pl-3">{label}</span></button>)}</nav>
      <div className="mt-auto shrink-0 overflow-hidden border-t border-slate-100 p-3">
        <div aria-hidden={collapsed} className="sidebar-caption h-12 px-2"><p className="mb-2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">PayPal sandbox</p><p title={merchant} className="truncate text-xs text-slate-500">{merchant || 'Merchant not available'}</p></div>
        <Link href="/account" aria-label="Account & sign out" title={collapsed ? 'Account & sign out' : undefined} className="flex items-center overflow-hidden rounded-lg px-[18px] py-3 text-sm font-medium hover:bg-slate-50"><UserRound className="h-[18px] w-[18px] shrink-0 text-slate-500" /><span className="sidebar-label whitespace-nowrap pl-3">Account & sign out</span></Link>
      </div>
    </aside>
    <div className={`workspace-body ${collapsed ? 'lg:pl-20' : 'lg:pl-60'}`}>
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-slate-400"><Link href="/" className="font-semibold text-slate-700 lg:hidden">CreatorPay</Link><span className="hidden lg:inline">Workspace</span><ChevronRight className="h-3 w-3" /><span className="text-slate-600">{view === 'account' ? 'Account settings' : view === 'new' ? 'New deal' : view === 'detail' ? 'Deal details' : navigation.find(n => n.id === view)?.label}</span></div><div className="flex items-center gap-4"><button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Switch to light mode" : "Switch to dark mode"} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800">Sandbox</span><Link href="/account" className="text-xs text-slate-600 lg:hidden">Account</Link></div></div>
        <nav aria-label="Mobile workspace navigation" className="-mb-1 mt-4 flex gap-1 overflow-x-auto pb-1 lg:hidden">{navigation.map(n => <button key={n.id} disabled={busy} aria-current={(view === n.id || (n.id === 'deals' && ['new','detail'].includes(view))) ? 'page' : undefined} onClick={() => onNavigate(n.id)} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs ${(view === n.id || (n.id === 'deals' && ['new','detail'].includes(view))) ? 'bg-orange-50 font-semibold text-brand-700' : 'text-slate-500'}`}>{n.label}</button>)}</nav>
      </header>
      <main id="workspace-content" className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5"><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>{view !== 'new' && <button disabled={busy} onClick={() => onNavigate('new')} className="flex items-center gap-2 rounded-lg bg-[#D94B27] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#BF3F20] disabled:opacity-50"><Plus className="h-4 w-4" />New deal</button>}</div>
        {children}
      </main>
    </div>
  </div>;
}
