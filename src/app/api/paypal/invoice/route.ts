import { NextResponse } from 'next/server';
import { getActiveDeal, updateActiveDeal, appendDealLog } from '@/lib/store';
import { createAndSendMilestoneInvoice } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const { milestoneIndex = 0 } = await req.json();
    const deal = getActiveDeal();

    if (!deal) {
      return NextResponse.json({ success: false, error: 'No active deal found' }, { status: 404 });
    }

    const milestone = deal.milestones[milestoneIndex];
    if (!milestone) {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 400 });
    }

    // Call PayPal Invoicing API
    const invoiceResult = await createAndSendMilestoneInvoice({
      brandName: deal.brandName,
      brandEmail: deal.brandEmail,
      milestoneTitle: milestone.name,
      amount: milestone.amount,
      currency: deal.currency,
      note: `CreatorPay AI Milestone Invoice: ${milestone.name} for ${deal.dealTitle}`,
    });

    // Update store state
    const updatedDeal = updateActiveDeal((prev) => {
      const newMilestones = [...prev.milestones];
      newMilestones[milestoneIndex] = {
        ...milestone,
        status: 'invoiced',
        invoiceId: invoiceResult.invoiceId,
        invoiceNumber: invoiceResult.invoiceNumber,
        invoiceUrl: invoiceResult.paymentUrl,
      };

      const newStatus = milestoneIndex === 0 ? 'advance_invoiced' : 'final_invoiced';

      return {
        ...prev,
        status: newStatus,
        milestones: newMilestones,
      };
    });

    // Append Agent Execution Log
    appendDealLog({
      type: 'action',
      title: `PayPal Milestone Invoice Generated & Sent`,
      description: `Dispatched PayPal Sandbox Invoice #${invoiceResult.invoiceNumber} (${deal.currency} \$${milestone.amount}) to ${deal.brandEmail}. Direct payment link activated.`,
      toolCall: {
        name: 'paypal.invoicing.create_and_send',
        params: {
          brand: deal.brandName,
          amount: milestone.amount,
          currency: deal.currency,
          milestone: milestone.name,
        },
        result: invoiceResult,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: invoiceResult,
      deal: updatedDeal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
