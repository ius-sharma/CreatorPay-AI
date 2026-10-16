import type { Deal } from './types';
// A solo deal ends with verified payment and approval, never a synthetic payout.
export function isSoloComplete(deal: Deal): boolean {
  return !deal.demo && Boolean(deal.contractExtraction) && deal.teamSplits?.length === 0
    && !deal.payout && Boolean(deal.deliverable?.verified && deal.deliverableReviews?.[0]?.approvedAt)
    && deal.milestones.length > 0 && deal.milestones.every(m => m.status === 'paid' && Boolean(m.paymentVerifiedAt));
}
export function completeSoloDeal(deal: Deal) {
  if (isSoloComplete(deal)) deal.status = 'deal_closed';
}
