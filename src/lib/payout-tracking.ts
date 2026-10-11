import { createHash } from 'crypto';
import type { Deal } from './types';
import { PayPalError, paypalRequest } from './paypal';
import { mutateStore, getDeal } from './store';
const cents = (value: number) => Math.round(value * 100);
const stableId = (value: string) => 'CP-' + createHash('sha256').update(value).digest('hex').slice(0, 26);
export function assertPayoutEligible(deal: Deal): void {
  if (deal.demo || !deal.contractExtraction || !deal.deliverable?.verified || !deal.deliverableReviews?.[0]?.approvedAt) throw new PayPalError('A confirmed contract and human-approved deliverable are required.', 409);
  if (!deal.milestones.length || deal.milestones.some(m => m.status !== 'paid' || !m.paymentVerifiedAt || !m.paymentTransactionIds?.length) || deal.milestones.reduce((sum,m) => sum + cents(m.amount), 0) !== cents(deal.totalAmount)) throw new PayPalError('Every milestone must have a verified full PayPal payment.', 409);
  if (deal.currency !== 'USD') throw new PayPalError('This sandbox payout stage supports USD only.', 400);
  if (!deal.teamSplits.length || deal.teamSplits.length > 20) throw new PayPalError('Provide 1–20 confirmed collaborator splits.', 400);
  const ids = new Set<string>(); let total = 0;
  for (const split of deal.teamSplits) {
    const amount = split.type === 'percentage' ? cents(deal.totalAmount) * split.value / 100 : split.value * 100;
    if (!Number.isFinite(split.value) || split.value <= 0 || !Number.isFinite(amount) || Math.round(amount) <= 0 || !split.email || ids.has(split.id) || cents(split.calculatedAmount || 0) !== Math.round(amount)) throw new PayPalError('Invalid collaborator amounts or recipient details.', 422);
    ids.add(split.id); total += Math.round(amount);
  }
  if (total > cents(deal.totalAmount)) throw new PayPalError('Collaborator splits exceed verified contract revenue.', 422);
}
export function makePayoutPlan(deal: Deal, mappings: unknown): NonNullable<Deal['payout']> {
  assertPayoutEligible(deal);
  if (!Array.isArray(mappings) || mappings.length !== deal.teamSplits.length) throw new PayPalError('Map every collaborator to their sandbox receiver account.', 400);
  const receiverEmails = new Set<string>();
  const items = deal.teamSplits.map(split => {
    const matches = mappings.filter(m => m?.splitId === split.id);
    const email = matches[0]?.receiverEmail;
    if (matches.length !== 1 || typeof email !== 'string' || !/^sb-[a-z0-9]+@personal\.example\.com$/i.test(email) || receiverEmails.has(email.toLowerCase()) || email.toLowerCase() === process.env.PAYPAL_BUSINESS_EMAIL?.toLowerCase()) throw new PayPalError('Each collaborator needs a distinct generated Personal sandbox email (sb-…@personal.example.com).', 400);
    receiverEmails.add(email.toLowerCase());
    return { splitId: split.id, senderItemId: stableId(`${deal.id}:${split.id}:payout`), contractEmail: split.email, receiverEmail: email.toLowerCase(), amount: split.calculatedAmount!, status: 'NOT_SENT' };
  });
  return { senderBatchId: stableId(`${deal.id}:team-payout`), createdAt: new Date().toISOString(), items };
}
export async function sendPayout(dealId: string): Promise<Deal> {
  const deal = getDeal(dealId)!; assertPayoutEligible(deal);
  const plan = deal.payout!;
  if (!plan || plan.batchId) throw new PayPalError('Prepare a payout plan first or refresh the existing batch.', 409);
  if (plan.items.length !== deal.teamSplits.length || plan.items.some(i => !deal.teamSplits.some(s => s.id === i.splitId && s.email === i.contractEmail && cents(s.calculatedAmount || 0) === cents(i.amount)))) throw new PayPalError('Contract splits no longer match the locked payout plan.', 409);
  // PayPal deduplicates for 30 days. Never retry an ambiguous request beyond that window.
  if (Date.now() - Date.parse(plan.createdAt) > 28 * 86400000) throw new PayPalError('Payout retry window expired. Reconcile the original batch manually; do not send another payout.', 409);
  let id: string;
  try {
    const result = await paypalRequest('/v1/payments/payouts', 'POST', { sender_batch_header: { sender_batch_id: plan.senderBatchId, email_subject: 'CreatorPay sandbox collaborator payment' }, items: plan.items.map(i => ({ recipient_type: 'EMAIL', receiver: i.receiverEmail, amount: { value: i.amount.toFixed(2), currency: deal.currency }, sender_item_id: i.senderItemId, note: 'CreatorPay sandbox test collaborator settlement' })) }, { 'PayPal-Request-Id': plan.senderBatchId });
    id = result.batch_header?.payout_batch_id;
  } catch (e) {
    if (e instanceof PayPalError && e.duplicateBatchId) id = e.duplicateBatchId;
    else throw e;
  }
  if (typeof id !== 'string' || !/^[A-Z0-9]+$/.test(id)) throw new PayPalError('PayPal returned no valid payout batch ID. Retry the same stored plan.', 502);
  mutateStore(store => { const d = store.deals.find(d => d.id === dealId)!; d.payout!.batchId = id; d.payout!.batchStatus = 'SUBMITTED'; delete d.payout!.error; d.updatedAt = new Date().toISOString(); });
  return refreshPayout(dealId);
}
export async function refreshPayout(dealId: string): Promise<Deal> {
  const deal = getDeal(dealId)!; const plan = deal.payout!;
  if (!plan?.batchId) throw new PayPalError('No submitted payout batch to check.', 409);
  const result = await paypalRequest(`/v1/payments/payouts/${plan.batchId}?page_size=1000&total_required=true`);
  const header = result.batch_header;
  if (header?.payout_batch_id !== plan.batchId || header?.sender_batch_header?.sender_batch_id !== plan.senderBatchId || !Array.isArray(result.items) || result.items.length !== plan.items.length || (result.total_pages && result.total_pages !== 1)) throw new PayPalError('PayPal payout batch does not match the stored plan. No settlement was recorded.', 422);
  const ids = new Set<string>();
  const checked = plan.items.map(expected => {
    const matches = result.items.filter((i: any) => i.payout_item?.sender_item_id === expected.senderItemId);
    const item = matches[0]; const p = item?.payout_item;
    if (matches.length !== 1 || p?.recipient_type !== 'EMAIL' || p.receiver?.toLowerCase() !== expected.receiverEmail || p.amount?.currency !== deal.currency || !/^\d+(\.\d{1,2})?$/.test(p.amount?.value || '') || cents(Number(p.amount.value)) !== cents(expected.amount) || typeof item.payout_item_id !== 'string' || ids.has(item.payout_item_id)) throw new PayPalError('PayPal payout recipient, amount or item ID mismatch.', 422);
    ids.add(item.payout_item_id);
    if (item.transaction_status === 'SUCCESS' && !item.transaction_id) throw new PayPalError('Successful payout has no transaction confirmation.', 422);
    return { ...expected, payoutItemId: item.payout_item_id, transactionId: item.transaction_id, status: item.transaction_status || 'UNKNOWN' };
  });
  return mutateStore(store => {
    const d = store.deals.find(d => d.id === dealId)!;
    d.payout!.items = checked; d.payout!.batchStatus = header.batch_status; d.payout!.lastCheckedAt = new Date().toISOString(); delete d.payout!.error;
    for (const item of checked) {
      const split = d.teamSplits.find(s => s.id === item.splitId)!;
      split.payoutBatchId = plan.batchId; split.payoutItemId = item.payoutItemId;
      split.status = item.status === 'SUCCESS' ? 'settled' : 'pending';
      const existingAudit = store.auditLedger.find(a => a.id === `payout-${item.payoutItemId}`);
      if (existingAudit && item.status !== 'SUCCESS') existingAudit.status = item.status === 'RETURNED' || item.status === 'REFUNDED' || item.status === 'REVERSED' ? 'RETURNED' : 'PENDING';
      if (item.status === 'SUCCESS') {
        split.settledAt ||= d.payout!.lastCheckedAt;
        const id = `payout-${item.payoutItemId}`;
        if (!store.auditLedger.some(a => a.id === id)) store.auditLedger.unshift({ id, timestamp: d.payout!.lastCheckedAt, batchId: plan.batchId!, dealTitle: d.dealTitle, recipientName: split.name, recipientRole: split.role, recipientEmail: item.receiverEmail, type: 'contractor_payout', amount: item.amount, currency: d.currency, status: 'COMPLETED', taxDeductible: false, category: 'Verified sandbox collaborator payout (not tax advice)' });
        else store.auditLedger.find(a => a.id === id)!.status = 'COMPLETED';
      }
    }
    if (checked.every(i => i.status === 'SUCCESS')) d.status = 'payouts_completed';
    else if (d.status === 'payouts_completed') d.status = 'final_paid';
    d.updatedAt = d.payout!.lastCheckedAt;
    const logId = `payout-status-${plan.batchId}-${checked.map(i => i.status).join('-')}`;
    if (!d.logs.some(l => l.id === logId)) d.logs.unshift({ id: logId, timestamp: new Date().toLocaleTimeString(), type: 'payout', title: checked.every(i => i.status === 'SUCCESS') ? 'PayPal sandbox collaborator payouts verified' : 'PayPal payout status checked', description: checked.map(i => `${i.receiverEmail}: ${d.currency} ${i.amount.toFixed(2)} — ${i.status}`).join('; ') });
    return d;
  });
}
