import { NextRequest, NextResponse } from 'next/server';
import { getDeal, mutateStore } from '@/lib/store';
import { createAndSendMilestoneInvoice, invoicePaymentUrl, invoiceNumberFor, PayPalError, SandboxInvoice } from '@/lib/paypal';
import { acquireInvoiceJob, rememberInvoice, releaseInvoiceJob } from '@/lib/database';
import { getSession } from '@/lib/analysis-session';
import { isSameOrigin } from '@/lib/request-origin';

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  let job: string | undefined;
  try {
    if (!isSameOrigin(req)) throw new PayPalError('Cross-origin requests are not allowed.', 403);
    const { dealId, milestoneIndex = 0 } = await req.json();
    if (typeof dealId !== 'string' || ![0, 1].includes(milestoneIndex)) throw new PayPalError('Select the advance or final milestone of a confirmed deal.', 400);
    const deal = getDeal(dealId);
    if (!deal || deal.demo || !deal.contractExtraction) throw new PayPalError('Analyse and confirm a new contract first. Sample deals cannot send invoices.', 409);
    if (deal.ownerSession !== getSession(req.cookies.get('creatorpay-analysis')?.value).id) throw new PayPalError('This deal belongs to another or expired browser session. Analyse a new contract in this session.', 403);
    if (!process.env.PAYPAL_WEBHOOK_ID) throw new PayPalError('Configure the PayPal webhook before sending the invoice.', 503);
    if (milestoneIndex === 1 && (deal.milestones.length !== 2 || deal.milestones[0].status !== 'paid' || !deal.milestones[0].paymentVerifiedAt || !deal.deliverableReviews?.[0]?.approvedAt || !deal.deliverable?.verified)) throw new PayPalError('Final invoicing requires a verified advance and human-approved deliverable.', 409);
    const milestone = deal.milestones[milestoneIndex];
    if (!milestone || milestone.amount <= 0) throw new PayPalError('Invalid advance milestone.', 400);
    const key = `${deal.id}:${milestone.id}`;
    const existingInvoiceId = acquireInvoiceJob(key);
    job = key;
    const recordInvoice = (invoice: SandboxInvoice) => mutateStore(store => {
      const current = store.deals.find(d => d.id === deal.id)!;
      const currentMilestone = current.milestones[milestoneIndex];
      current.milestones[milestoneIndex] = { ...currentMilestone, invoiceId: invoice.id, invoiceNumber: invoiceNumberFor(key), invoiceStatus: currentMilestone.status === 'paid' ? 'PAID' : invoice.status, invoiceUrl: invoicePaymentUrl(invoice) || currentMilestone.invoiceUrl, status: currentMilestone.status === 'paid' ? 'paid' : invoice.status === 'DRAFT' ? 'pending' : 'invoiced' };
      if (currentMilestone.status !== 'paid') current.status = invoice.status === 'DRAFT' ? (milestoneIndex === 0 ? 'analyzed' : 'deliverable_verified') : (milestoneIndex === 0 ? 'advance_invoiced' : 'final_invoiced');
      current.updatedAt = new Date().toISOString();
      const item = { id: invoice.id, invoiceNumber: invoiceNumberFor(key), dealTitle: deal.dealTitle, brandName: deal.brandName, brandEmail: deal.brandEmail, milestoneTitle: milestone.name, amount: milestone.amount, currency: deal.currency, status: currentMilestone.status === 'paid' ? 'PAID' as const : invoice.status === 'DRAFT' ? 'DRAFT' as const : 'SENT' as const, issueDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10), paymentUrl: invoicePaymentUrl(invoice) || currentMilestone.invoiceUrl || '', terms: 'DUE_ON_RECEIPT' };
      store.invoices = [item, ...store.invoices.filter(i => i.id !== invoice.id)];
      return current;
    });
    const result = await createAndSendMilestoneInvoice({ brandName: deal.brandName, brandEmail: deal.brandEmail, milestoneTitle: milestone.name, amount: milestone.amount, currency: deal.currency, operationKey: key, existingInvoiceId: milestone.invoiceId || existingInvoiceId, onCreated: invoice => { rememberInvoice(key, invoice.id); recordInvoice(invoice); } });
    recordInvoice({ id: result.invoiceId, status: result.status, detail: { metadata: { recipient_view_url: result.paymentUrl } } });
    return NextResponse.json({ success: true, invoice: result, deal: getDeal(deal.id) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Invoice could not be created.' }, { status: error instanceof PayPalError ? error.status : error instanceof SyntaxError ? 400 : 409 });
  } finally { if (job) releaseInvoiceJob(job); }
}
