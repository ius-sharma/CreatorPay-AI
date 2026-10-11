import { NextRequest, NextResponse } from 'next/server';
import { getDeal, mutateStore } from '@/lib/store';
import { getSession } from '@/lib/analysis-session';
import { isSameOrigin } from '@/lib/request-origin';
import { PayPalError, getSandboxInvoice } from '@/lib/paypal';
import { validateInvoicePayment } from '@/lib/payment-tracking';
import { assertPayoutEligible, makePayoutPlan, sendPayout, refreshPayout } from '@/lib/payout-tracking';
import { acquireInvoiceJob, releaseInvoiceJob } from '@/lib/database';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  if (process.env.CREATORPAY_BACKEND === "supabase") return (await import("@/lib/supabase/routes")).payout(req);
  let job: string | undefined; let dealId: string | undefined;
  try {
    if (!isSameOrigin(req)) throw new PayPalError('Cross-origin requests are not allowed.', 403);
    const body = await req.json();
    const deal = typeof body.dealId === 'string' ? getDeal(body.dealId) : null;
    if (!deal || deal.demo) throw new PayPalError('Select a confirmed deal.', 409);
    if (deal.ownerSession !== getSession(req.cookies.get('creatorpay-analysis')?.value).id) throw new PayPalError('Use the browser session that confirmed this contract.', 403);
    dealId = deal.id;
    if (!['prepare', 'execute', 'refresh'].includes(body.action)) throw new PayPalError('Choose prepare, execute or refresh.', 400);
    acquireInvoiceJob(`payout:${deal.id}`); job = `payout:${deal.id}`;
    if (body.action === 'refresh') return NextResponse.json({ success: true, deal: await refreshPayout(deal.id) });
    assertPayoutEligible(deal);
    if (body.action === 'prepare') {
      if (deal.payout) throw new PayPalError('A payout plan is already locked. Execute/recover the same plan; do not create another.', 409);
      const plan = makePayoutPlan(deal, body.mappings);
      const updated = mutateStore(store => { const current = store.deals.find(d => d.id === deal.id)!; current.payout = plan; current.updatedAt = new Date().toISOString(); return current; });
      return NextResponse.json({ success: true, deal: updated });
    }
    if (body.confirmPayout !== true) throw new PayPalError('Review and confirm the locked sandbox recipients and amounts.', 400);
    if (!deal.payout) throw new PayPalError('Prepare a payout plan first.', 409);
    if (deal.payout.batchId) return NextResponse.json({ success: true, deal: await refreshPayout(deal.id) });
    // Recheck PayPal before moving any funds; persisted paid state alone is not sufficient.
    for (const milestone of deal.milestones) validateInvoicePayment(await getSandboxInvoice(milestone.invoiceId!), deal, milestone);
    return NextResponse.json({ success: true, deal: await sendPayout(deal.id) });
  } catch (error) {
    if (job && dealId) mutateStore(store => { const d = store.deals.find(d => d.id === dealId); if (d?.payout) d.payout.error = error instanceof Error ? error.message : 'Payout failed.'; });
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Payout failed.', deal: dealId ? getDeal(dealId) : undefined }, { status: error instanceof PayPalError ? error.status : error instanceof SyntaxError ? 400 : 409 });
  } finally { if (job) releaseInvoiceJob(job); }
}
