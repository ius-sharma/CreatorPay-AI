'use client';
import type { ContractReview as Review } from '@/lib/contract';

export function ContractReview({ review, busy, onConfirm, onDismiss }: { review: Review; busy: boolean; onConfirm: () => void; onDismiss: () => void }) {
  const e = review.extraction;
  const fields = [['Brand', e.brandName], ['Billing email', e.brandEmail], ['Total', e.totalAmount], ['Currency', e.currency], ['Deadline', e.deadline]] as const;
  return (
    <section className="bg-white border border-brand-200 rounded-2xl p-5 space-y-4" aria-label="Contract review">
      <h2 className="font-bold text-slate-900">Review extracted contract terms</h2>
      <p className="text-sm text-slate-600">Check every value against the quoted source. Analysis does not send invoices or payments.</p>
      <div className="space-y-3">
        {fields.map(([label, field]) => <div key={label} className="text-sm"><p className="font-semibold text-slate-900">{label}: {field.value ?? 'Not provided'}</p>{field.evidence && <blockquote className="border-l-2 border-brand-200 pl-3 text-slate-600 whitespace-pre-wrap">{field.evidence}</blockquote>}</div>)}
      </div>
      <div className="text-sm space-y-2"><h3 className="font-semibold">Payment milestones</h3>{e.milestones.map((m, i) => <div key={i}><p>{m.name}: {e.currency.value || 'Currency missing'} {review.calculatedMilestones[i].amount.toFixed(2)}</p><blockquote className="border-l-2 border-brand-200 pl-3 text-slate-600">{m.evidence}</blockquote></div>)}</div>
      <div className="text-sm space-y-2"><h3 className="font-semibold">Deliverables</h3>{e.deliverables.map((d, i) => <div key={i}><p>{d.requirement}</p><blockquote className="border-l-2 border-brand-200 pl-3 text-slate-600">{d.evidence}</blockquote></div>)}</div>
      <div className="text-sm space-y-2"><h3 className="font-semibold">Collaborator splits</h3><p className="text-slate-600">{e.teamSplits.length ? 'From this contract. Incomplete recipient details must be clarified.' : 'From the team rules you selected, not extracted from this contract.'}</p>{review.calculatedSplits.length === 0 && <p>No collaborator splits selected.</p>}{review.calculatedSplits.map((s, i) => <div key={s.id}><p>{s.name || 'Name missing'} — {s.role} — {s.email || 'Email missing'}: {e.currency.value} {s.calculatedAmount?.toFixed(2)}</p>{e.teamSplits[i]?.evidence && <blockquote className="border-l-2 border-brand-200 pl-3 text-slate-600">{e.teamSplits[i].evidence}</blockquote>}</div>)}<p className="font-semibold">Creator remainder before fees/taxes: {e.currency.value} {review.creatorNet.toFixed(2)}</p></div>
      {review.issues.length > 0 && <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900"><h3 className="font-bold">Clarification required</h3><ul className="list-disc pl-5 space-y-1">{review.issues.map(issue => <li key={issue}>{issue}</li>)}</ul><p className="mt-2">Edit the contract above or append a clarification, then analyse again. Explicitly say which previous term you are replacing.</p></div>}
      <div className="flex gap-3"><button disabled={busy || review.issues.length > 0} onClick={onConfirm} className="rounded-xl bg-brand-600 px-4 py-2 text-white text-sm font-semibold disabled:opacity-40">Confirm terms & create deal</button><button disabled={busy} onClick={onDismiss} className="text-sm text-slate-600">Dismiss review</button></div>
      <p className="text-xs text-slate-500">Review expires after 30 minutes. Your contract is sent to Groq for analysis.</p>
    </section>
  );
}
