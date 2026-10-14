'use client';
import { useState } from 'react';
import { WorkspaceSettings } from './WorkspaceSettings';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from './WorkspaceShell';
import { SignOutButton } from './SignOutButton';
import { card } from './FinanceUI';
export function AccountSettings({email,confirmed,createdAt,workspaceReady}:{email:string;confirmed:boolean;createdAt:string;workspaceReady:boolean}) {
 const router=useRouter();
 const [name,setName]=useState('Creator workspace');
 return <WorkspaceShell view="account" workspaceName={name} onNavigate={view=>router.push(`/dashboard?view=${view}`)} title="Account settings" description="Your identity, workspace access and current session." merchant="See Connections for configuration" busy={false}>
 <div className="max-w-3xl space-y-5">{workspaceReady&&<WorkspaceSettings onName={setName}/>}<section className={`${card} p-6`}><h2 className="text-sm font-semibold">Your account</h2><dl className="mt-6 space-y-5"><div><dt className="text-xs text-slate-500">Email address</dt><dd className="mt-2 break-all text-sm font-medium">{email}</dd></div><div><dt className="text-xs text-slate-500">Email confirmation</dt><dd className="mt-2 text-sm">{confirmed?'Confirmed':'Not confirmed'}</dd></div><div><dt className="text-xs text-slate-500">Account created</dt><dd className="mt-2 text-sm">{createdAt.slice(0,10)}</dd></div></dl></section>
 <section className={`${card} p-6`}><h2 className="text-sm font-semibold">Workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">{workspaceReady?'Your contracts, invoices and payout records are linked to this account.':'Database setup must be completed before your workspace is available.'}</p>{workspaceReady&&<div className="mt-5 flex flex-wrap gap-3"><Link href="/dashboard" className="ui-button">Open your workspace</Link><Link href="/dashboard?view=diagnostics" className="ui-button ui-button-secondary">View connections</Link></div>}</section>
 <section className={`${card} p-6`}><h2 className="text-sm font-semibold">Current session</h2><p className="mb-5 mt-2 text-sm leading-6 text-slate-500">Sign out on this browser. Your saved workspace records remain available when you log in again.</p><SignOutButton/></section></div></WorkspaceShell>;
}
