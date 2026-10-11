import { database } from './database';
import { mutateStore, getAllDeals } from './store';
import { PayPalError, SandboxInvoice } from './paypal';
import type { Deal, Milestone } from './types';

function moneyCents(money: { value: string; currency_code: string } | undefined, currency: string): number | null {
  if (!money || money.currency_code !== currency || !/^\d+(\.\d{1,2})?$/.test(money.value)) return null;
  return Math.round(Number(money.value) * 100);
}
export function validateInvoicePayment(invoice: SandboxInvoice, deal: Deal, milestone: Milestone): string[] {
  if (invoice.id !== milestone.invoiceId) throw new PayPalError('Invoice ID does not match the tracked milestone.', 422);
  if (invoice.status !== 'PAID') throw new PayPalError('PayPal has not confirmed this invoice as fully paid.', 409);
  const expected = Math.round(milestone.amount * 100);
  if (moneyCents(invoice.amount, deal.currency) !== expected || moneyCents(invoice.payments?.paid_amount, deal.currency) !== expected) throw new PayPalError('Paid invoice amount/currency does not match the milestone.', 422);
  if (invoice.invoicer?.email_address?.toLowerCase() !== process.env.PAYPAL_BUSINESS_EMAIL?.toLowerCase() || !process.env.PAYPAL_BUSINESS_EMAIL) throw new PayPalError('Invoice merchant does not match the configured sandbox account.', 422);
  if (invoice.primary_recipients?.[0]?.billing_info?.email_address?.toLowerCase() !== deal.brandEmail.toLowerCase()) throw new PayPalError('Invoice recipient does not match this deal.', 422);
  const transactions = invoice.payments?.transactions || [];
  const paypalPayments = transactions.filter(t => t.type === 'PAYPAL' && t.payment_id && moneyCents(t.amount, deal.currency) !== null);
  const ids = paypalPayments.map(t => t.payment_id!);
  if (new Set(ids).size !== ids.length || !ids.length || paypalPayments.reduce((sum, t) => sum + (moneyCents(t.amount, deal.currency) || 0), 0) !== expected) throw new PayPalError('Payment is not backed by matching PayPal transaction records. External/manual payments are not accepted.', 422);
  return ids;
}
export function findTrackedInvoice(id: string): { deal: Deal; index: number } | null {
  for (const deal of getAllDeals()) {
    if (deal.demo || !deal.contractExtraction) continue;
    const index = deal.milestones.findIndex(m => m.invoiceId === id);
    if (index >= 0) return { deal, index };
  }
  return null;
}
export function applyVerifiedPayment(invoice: SandboxInvoice, eventId: string): { duplicate: boolean; deal: Deal } {
  return mutateStore(store => {
    const match = store.deals.find(d => !d.demo && d.contractExtraction && d.milestones.some(m => m.invoiceId === invoice.id));
    if (!match) throw new PayPalError('No tracked deal for this invoice.', 404);
    const index = match.milestones.findIndex(m => m.invoiceId === invoice.id);
    const ids = validateInvoicePayment(invoice, match, match.milestones[index]);
    const prior = database().prepare('SELECT invoice_id FROM webhook_events WHERE id=?').get(eventId);
    if (prior) {
      if (prior.invoice_id !== invoice.id) throw new PayPalError('Event ID was already associated with a different invoice.', 422);
      return { duplicate: true, deal: match };
    }
    database().prepare('INSERT INTO webhook_events(id,invoice_id,processed_at) VALUES(?,?,?)').run(eventId, invoice.id, new Date().toISOString());
    if (match.milestones[index].status === 'paid') return { duplicate: true, deal: match };
    const now = new Date().toISOString();
    match.milestones[index] = { ...match.milestones[index], status: 'paid', invoiceStatus: 'PAID', paidAt: now, paymentVerifiedAt: now, paymentTransactionIds: ids };
    match.status = index === 0 ? 'advance_paid' : match.milestones.every(m => m.status === 'paid') ? 'final_paid' : match.status;
    match.updatedAt = now;
    store.invoices.forEach(item => { if (item.id === invoice.id) item.status = 'PAID'; });
    match.logs.unshift({ id: `payment-${eventId}`, timestamp: new Date().toLocaleTimeString(), type: 'webhook', title: 'PayPal sandbox payment verified', description: `${match.currency} ${match.milestones[index].amount.toFixed(2)} paid against invoice ${invoice.id}; PayPal transaction IDs: ${ids.join(', ')}.` });
    return { duplicate: false, deal: match };
  });
}
