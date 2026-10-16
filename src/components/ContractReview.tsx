'use client';
import type { ContractReview as Review } from '@/lib/contract';
import { ContractEvidence } from './ContractEvidence';

export function ContractReview({ source, review, busy, onConfirm, onDismiss }: { source: string; review: Review; busy: boolean; onConfirm: () => void; onDismiss: () => void }) {
  const e = review.extraction;
  return <section aria-label="Contract review"><h2 id="contract-review-heading" tabIndex={-1} className="mb-4 text-lg font-semibold">Review extracted terms</h2>
    <ContractEvidence source={source} extraction={e}/>
    <section className="contract-approval">
      <h3>Review the calculated payment plan</h3><p>Check every term before confirming. Creating a deal does not send invoices or payments.</p>
      <ul>{review.calculatedMilestones.map((m,i)=><li key={i}>{m.name}: {e.currency.value || 'Currency missing'} {m.amount.toFixed(2)} · {m.percentage}%</li>)}</ul>
      <h3>Collaborator shares</h3><p>{e.teamSplits.length ? 'From this contract. Supporting quotes are available in Contract splits above.' : review.calculatedSplits.length ? 'From the saved team rules you selected; these are not extracted contract terms.' : 'No collaborator splits selected.'}</p>
      {review.calculatedSplits.length>0 && <ul>{review.calculatedSplits.map(s=><li key={s.id}>{s.name || 'Name missing'} · {s.role} · {s.email || 'Email missing'}: {e.currency.value || 'Currency missing'} {s.calculatedAmount?.toFixed(2)}</li>)}</ul>}
      <p>Creator remainder before fees and taxes: {e.currency.value || 'Currency missing'} {review.creatorNet.toFixed(2)}</p>
      {review.issues.length>0 && <div className="contract-issues" role="status"><h3>Clarification required · {review.issues.length}</h3><ul>{review.issues.map((issue,i)=><li key={i}>{issue}</li>)}</ul><p>Edit the original input above, then analyze again. For conflicting terms, replace the old wording with the agreed term. A new analysis is required before confirmation.</p></div>}
      <div className="contract-approval-actions"><button disabled={busy || review.issues.length>0} onClick={onConfirm}>{busy ? 'Please wait…' : 'Confirm terms & create deal'}</button><button disabled={busy} onClick={onDismiss}>Dismiss review</button></div>
      <p className="mt-4">Review expires after 30 minutes. Your contract is sent to Groq for analysis.</p>
    </section>
  </section>;
}
