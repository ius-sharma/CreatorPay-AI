'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, FileText } from 'lucide-react';
import type { Deal } from '@/lib/types';
import { money, summarize } from '@/lib/workspace-summary';
import { DeliverableReviewPanel } from './DeliverableReviewPanel';
import { PayoutControl } from './PayoutControl';
import { ContractEvidence } from './ContractEvidence';

type Section = 'contract' | 'invoices' | 'deliverable' | 'settlement' | 'activity';
const sections: { id: Section; label: string }[] = [{ id: 'contract', label: 'Contract' }, { id: 'invoices', label: 'Invoices' }, { id: 'deliverable', label: 'Deliverable' }, { id: 'settlement', label: 'Settlement' }, { id: 'activity', label: 'Activity' }];
const panel = 'ui-panel p-5 sm:p-6 ';

export function DealWorkspace({ deal, busy, onBack, onInvoice, onChange }: { deal: Deal; busy: boolean; onBack: () => void; onInvoice: (index: number) => void; onChange: (deal: Deal) => void }) {
  const approved = Boolean(deal.deliverableReviews?.[0]?.approvedAt);
  const advancePaid = Boolean(deal.milestones[0]?.status === 'paid' && deal.milestones[0]?.paymentVerifiedAt);
  const allPaid = deal.milestones.length > 0 && deal.milestones.every(m => m.status === 'paid' && m.paymentVerifiedAt);
  const settled = Boolean(deal.payout?.items.length && deal.payout.items.every(i => i.status === 'SUCCESS' && i.transactionId));
  const recommended: Section = deal.demo ? 'contract' : !advancePaid ? 'invoices' : !approved ? 'deliverable' : !allPaid ? 'invoices' : 'settlement';
  const [section, setSection] = useState<Section>(recommended);
  const summary = summarize([deal], deal.currency);
  const stages = [Boolean(deal.contractExtraction && !deal.demo), advancePaid && !deal.demo, approved && !deal.demo, allPaid && !deal.demo, settled && !deal.demo];
  const stepLabels = ['Terms confirmed', 'Advance received', 'Deliverable approved', 'Final payment', 'Team settlement'];
  const nextLabel = settled ? 'Review settlement' : !advancePaid ? 'Manage advance invoice' : !approved ? 'Review deliverable' : !allPaid ? 'Manage final invoice' : 'Manage team payout';
  return <div className="space-y-6">
    <button disabled={busy} onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50"><ArrowLeft className="h-4 w-4" />All deals</button>
    {deal.demo && <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Sample deal. Amounts and stages are illustrative; no payments are verified.</p>}
    <section className={panel}>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">{[['Contract value',money(deal.totalAmount,deal.currency)],['Payments received',money(summary.received,deal.currency)],['Still to collect',money(summary.outstanding,deal.currency)],['Contract deadline',deal.contractExtraction?.deadline.value || 'Not recorded']].map(([label,value]) => <div key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 break-words text-lg font-semibold tracking-tight tabular-nums">{value}</p></div>)}</div>
      <ol aria-label="Deal progress" className="mt-7 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-5">{stepLabels.map((label,i) => <li key={label} className="flex items-center gap-2 text-xs"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${stages[i] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{stages[i] ? <Check className="h-3.5 w-3.5" aria-label="Complete" /> : i+1}</span><span className={stages[i] ? 'text-slate-700' : 'text-slate-400'}>{label}</span></li>)}</ol>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-4 ui-panel px-5 py-4"><div><p className="text-sm font-semibold">{settled ? 'Settlement recorded' : 'Next step'}</p><p className="mt-1 text-xs text-slate-500">{settled ? 'Successful collaborator transactions are available in Settlement.' : deal.demo ? 'Explore the sample contract, then create a deal to start.' : nextLabel}</p></div><button disabled={busy} onClick={() => setSection(recommended)} className="ui-button ui-button-secondary">{deal.demo ? 'View contract' : nextLabel}<ArrowRight className="h-3.5 w-3.5" /></button></div>
    <nav aria-label="Deal sections" className="flex gap-6 overflow-x-auto border-b border-slate-200">{sections.map(tab => <button key={tab.id} aria-current={section === tab.id ? 'page' : undefined} onClick={() => setSection(tab.id)} className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium ${section === tab.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>{tab.label}</button>)}</nav>
    <div hidden={section !== 'contract'} className="space-y-5">
      {deal.contractExtraction ? <ContractEvidence source={deal.prompt} extraction={deal.contractExtraction}/> : <section className={panel}><h2 className="text-sm font-semibold">Original contract</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{deal.prompt || 'No contract text recorded.'}</p><p className="mt-4 text-xs text-slate-500">No extracted terms recorded for this deal.</p></section>}
    </div>
    <div hidden={section !== 'invoices'} className="space-y-5">
      <p className="text-xs leading-6 text-slate-500">PayPal sandbox invoices. Share the payment link with your test buyer; email notifications are disabled. Payments appear after verification.</p>
      {deal.milestones.map((m,index) => {
        const verified = !deal.demo && m.status === 'paid' && Boolean(m.paymentVerifiedAt);
        const canCreate = !deal.demo && Boolean(deal.contractExtraction) && m.status === 'pending' && (index === 0 || (index === 1 && deal.milestones.length === 2 && approved && advancePaid));
        return <section key={m.id} className={panel}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-wider text-slate-400">Milestone {index+1} · {m.percentage}%</p><h2 className="mt-2 text-sm font-semibold">{m.name}</h2><p className="mt-3 text-2xl font-semibold tabular-nums">{money(m.amount,deal.currency)}</p></div><span className={`rounded-md px-2 py-1 text-xs ${verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{deal.demo ? 'Sample' : verified ? 'Payment verified' : m.status === 'paid' ? 'Verification pending' : m.invoiceStatus || 'Not invoiced'}</span></div>
          <div className="mt-5 flex flex-wrap items-center gap-3">{canCreate && <button disabled={busy} onClick={() => onInvoice(index)} className="ui-button">{busy ? 'Creating invoice…' : m.invoiceId ? 'Retry sending invoice' : 'Create sandbox invoice'}</button>}{m.invoiceUrl && !deal.demo && !verified && <a href={m.invoiceUrl} target="_blank" rel="noopener noreferrer" className="ui-button ui-button-secondary">Open payment link<ExternalLink className="h-3.5 w-3.5" /></a>}{index > 0 && !approved && !deal.demo && <p className="text-xs text-slate-500">Available after deliverable approval.</p>}</div>
          {m.invoiceId && <details className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500"><summary className="cursor-pointer">Invoice & transaction records</summary><div className="mt-3 space-y-2 break-all"><p>Invoice: {m.invoiceId}</p>{m.paymentTransactionIds?.map(id => <p key={id}>Transaction: {id}</p>)}{m.paymentVerifiedAt && <p>Verified: {new Date(m.paymentVerifiedAt).toLocaleString()}</p>}</div></details>}
        </section>;
      })}
    </div>
    <div hidden={section !== 'deliverable'}>{deal.demo || !deal.contractExtraction ? <p className={panel}>Create and confirm a contract to review a deliverable.</p> : <DeliverableReviewPanel deal={deal} onChange={onChange} />}</div>
    <div hidden={section !== 'settlement'} className="space-y-5">
      <section className={panel}><h2 className="text-sm font-semibold">Contract split breakdown</h2><p className="mt-1 text-xs text-slate-500">Agreed shares and verified transfers are shown separately.</p><div className="mt-5 divide-y divide-slate-100">{deal.teamSplits.map(s => { const item = deal.payout?.items.find(i => i.splitId === s.id); const paid = !deal.demo && item?.status === 'SUCCESS' && item.transactionId; return <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="text-sm font-medium">{s.name} <span className="ml-2 text-xs font-normal text-slate-400">{s.role}</span></p><p className="mt-1 break-all text-xs text-slate-500">{s.email}</p></div><div className="text-right"><p className="text-sm font-semibold tabular-nums">{money(s.calculatedAmount ?? (s.type === 'percentage' ? deal.totalAmount*s.value/100 : s.value),deal.currency)}</p><p className={`mt-1 text-xs ${paid ? 'text-emerald-700' : 'text-slate-500'}`}>{paid ? 'Transfer verified' : item?.status || 'Planned share'}</p></div></div>; })}{!deal.teamSplits.length && <p className="py-4 text-sm text-slate-500">No collaborator splits recorded.</p>}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5"><div><p className="text-sm font-semibold">Creator share</p><p className="mt-1 text-xs text-slate-500">Estimate before PayPal fees; not a separate transfer.</p></div><p className="text-xl font-semibold tabular-nums">{money(deal.creatorNetPayout,deal.currency)}</p></div></section>
      <PayoutControl deal={deal} onChange={onChange} />
    </div>
    <section hidden={section !== 'activity'} className={panel}><h2 className="text-sm font-semibold">Deal activity</h2><p className="mt-1 text-xs text-slate-500">Recorded contract reviews, approvals and payment updates.</p><ol className="mt-5 divide-y divide-slate-100">{[...deal.logs].sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(log => <li key={log.id} className="py-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">{log.title}</h3><time dateTime={log.timestamp} className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">{log.description}</p></li>)}</ol>{!deal.logs.length && <p className="py-6 text-sm text-slate-500">No activity recorded yet.</p>}</section>
  </div>;
}
