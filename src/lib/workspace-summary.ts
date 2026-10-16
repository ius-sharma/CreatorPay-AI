import type { Deal } from './types';

import { isSoloComplete } from './deal-completion';
export const isComplete = (deal: Deal) => isSoloComplete(deal) || ['payouts_completed', 'deal_closed'].includes(deal.status);
export const money = (amount: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
export function nextAction(deal: Deal) {
  if (isComplete(deal)) return 'View settlement';
  const unpaid = deal.milestones.find(m => m.status !== 'paid' || !m.paymentVerifiedAt);
  if (unpaid?.invoiceId) return 'Check invoice';
  if (unpaid === deal.milestones[0]) return 'Create advance invoice';
  if (!deal.deliverableReviews?.[0]?.approvedAt) return 'Review deliverable';
  if (unpaid) return 'Create final invoice';
  return deal.payout?.batchId ? 'Check payout' : 'Prepare team payout';
}
export function summarize(deals: Deal[], currency: string) {
  const actual = deals.filter(d => !d.demo && d.currency === currency);
  return {
    received: actual.reduce((sum, d) => sum + d.milestones.filter(m => m.status === 'paid' && m.paymentVerifiedAt).reduce((s, m) => s + m.amount, 0), 0),
    outstanding: actual.reduce((sum, d) => sum + d.milestones.filter(m => m.status !== 'paid' || !m.paymentVerifiedAt).reduce((s, m) => s + m.amount, 0), 0),
    paidOut: actual.reduce((sum, d) => sum + (d.payout?.items.filter(i => i.status === 'SUCCESS' && i.transactionId).reduce((s, i) => s + i.amount, 0) || 0), 0),
    active: actual.filter(d => !isComplete(d)).length,
  };
}
