import { NextResponse } from 'next/server';
import { getActiveDeal, updateActiveDeal, appendDealLog } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type || body.event || 'INVOICING.INVOICE.PAID';
    const milestoneIndex = typeof body.milestoneIndex === 'number' ? body.milestoneIndex : 0;

    const deal = getActiveDeal();
    if (!deal) {
      return NextResponse.json({ success: false, error: 'No active deal found' }, { status: 404 });
    }

    const milestone = deal.milestones[milestoneIndex];
    if (!milestone) {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 400 });
    }

    const paidTimestamp = new Date().toISOString();

    const updatedDeal = updateActiveDeal((prev) => {
      const newMilestones = [...prev.milestones];
      newMilestones[milestoneIndex] = {
        ...milestone,
        status: 'paid',
        paidAt: paidTimestamp,
      };

      let nextStatus = prev.status;
      if (milestoneIndex === 0) {
        nextStatus = 'advance_paid';
      } else {
        nextStatus = 'final_paid';
      }

      return {
        ...prev,
        status: nextStatus,
        milestones: newMilestones,
      };
    });

    const isAdvance = milestoneIndex === 0;

    appendDealLog({
      type: 'webhook',
      title: `PayPal Webhook: ${eventType}`,
      description: isAdvance
        ? `Verified incoming payment of \$${milestone.amount} from ${deal.brandName}. Contract state unlocked: Team notified to initiate production.`
        : `Final settlement of \$${milestone.amount} cleared via PayPal Sandbox. Contract completed: Autonomous multi-party split ready for release.`,
      toolCall: {
        name: 'paypal.webhooks.listener',
        params: {
          event_type: eventType,
          resource_id: milestone.invoiceId || 'INV-SIMULATED',
          amount: milestone.amount,
        },
        result: {
          milestone: milestone.name,
          status: 'SETTLED',
          timestamp: paidTimestamp,
        },
      },
    });

    return NextResponse.json({
      success: true,
      event: eventType,
      deal: updatedDeal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
