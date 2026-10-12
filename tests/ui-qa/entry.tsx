import { createRoot } from 'react-dom/client';
import Home from '../../src/app/dashboard/page';
import type { Deal, TeamSplit } from '../../src/lib/types';
const stamp = '2026-10-12T09:00:00Z';
const split: TeamSplit = { id: 'qa-editor', name: 'QA Editor', role: 'Editor', email: 'editor@example.test', type: 'percentage', value: 15, calculatedAmount: 300, status: 'settled' };
const sourced = <T,>(value: T) => ({ value, evidence: String(value) });
const settled: Deal = {
  id: 'qa-settled', brandName: 'QA Acme', brandEmail: 'billing@example.test', dealTitle: 'Synthetic sponsor campaign', totalAmount: 2000, currency: 'USD', creatorNetPayout: 1700, prompt: 'Synthetic QA contract: USD 2000, 60-second sponsor segment.', status: 'payouts_completed', createdAt: stamp, updatedAt: stamp,
  milestones: [600,1400].map((amount, i) => ({ id: `qa-m${i}`, name: i ? 'Final payment' : 'Advance', amount, percentage: i ? 70 : 30, status: 'paid', invoiceId: `QA-INVOICE-${i}`, paymentVerifiedAt: stamp, paymentTransactionIds: [`QA-PAYMENT-${i}`] })),
  teamSplits: [split], logs: [{ id: 'qa-log', timestamp: stamp, type: 'payout', title: 'Synthetic payout confirmed', description: 'Fixture only. No funds moved.' }],
  contractExtraction: { brandName: sourced('QA Acme'), brandEmail: sourced('billing@example.test'), totalAmount: sourced(2000), currency: sourced('USD'), deadline: sourced('2026-11-01'), milestones: [], deliverables: [{ requirement: '60-second sponsor segment', evidence: '60-second sponsor segment' }], teamSplits: [], conflicts: [] },
  deliverableReviews: [{ id: 'qa-review', transcript: 'Synthetic sponsor transcript', description: '', videoUrl: '', checks: [], verdict: 'human_review', createdAt: stamp, approvedAt: stamp, approvedBy: 'qa-user' }],
  payout: { senderBatchId: 'QA-BATCH', batchId: 'QA-BATCH', batchStatus: 'SUCCESS', createdAt: stamp, items: [{ splitId: split.id, senderItemId: 'QA-ITEM', contractEmail: split.email, receiverEmail: split.email, amount: 300, status: 'SUCCESS', transactionId: 'QA-TRANSACTION' }] },
};
const pending: Deal = { ...settled, id: 'qa-pending', brandName: 'QA Northwind', dealTitle: 'Pending synthetic campaign', status: 'analyzed', payout: undefined, deliverableReviews: [], teamSplits: [], creatorNetPayout: 2000, milestones: settled.milestones.map(m => ({ id: m.id, name: m.name, amount: m.amount, percentage: m.percentage, status: 'pending' })) };
const deals = [settled, pending];
let activeDeal = settled;
let roster = [split];
let failSave = true;
const portfolio = () => ({ allDeals: deals, activeDeal, teamRoster: roster, sandboxAccount: 'qa-merchant@example.test', invoices: settled.milestones.map((m,i) => ({ id: m.invoiceId, invoiceNumber: m.invoiceId, dealTitle: settled.dealTitle, brandName: settled.brandName, brandEmail: settled.brandEmail, milestoneTitle: m.name, amount: m.amount, currency: 'USD', status: 'PAID', issueDate: stamp, dueDate: '2026-11-01', paymentUrl: '', terms: 'Synthetic fixture' })), auditLedger: [{ id: 'qa-ledger', timestamp: stamp, batchId: 'QA-BATCH', dealTitle: settled.dealTitle, recipientName: split.name, recipientRole: split.role, recipientEmail: split.email, type: 'contractor_payout', amount: 300, currency: 'USD', status: 'COMPLETED', taxDeductible: false, category: 'Synthetic fixture' }] });
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  if (url === '/api/deals') {
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body));
      if (body.action === 'switch_deal') { await new Promise(resolve => setTimeout(resolve, 1500)); activeDeal = deals.find(d => d.id === body.dealId)!; }
      else if (body.action === 'update_roster') { if (failSave) { failSave = false; return response({ error: 'Synthetic save failure. Retry to succeed.' }, 503); } roster = body.teamRoster; }
      else return response({ error: 'This action is disabled in UI QA.' }, 400);
    }
    return response(portfolio());
  }
  if (url === '/api/paypal/status') return response({ environment: 'Synthetic QA', credentialsConfigured: true, webhookConfigured: true, lastPaymentVerifiedAt: stamp, storage: 'Synthetic in-memory fixtures', aiConfigured: true });
  return response({ error: 'Synthetic API failure. No external request was sent.' }, 503);
};
createRoot(document.getElementById('root')!).render(<><div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 100, background: '#fef3c7', color: '#111', fontSize: 11, padding: 4, pointerEvents: 'none' }}>UI QA · Synthetic data · External requests blocked</div><Home /></>);
