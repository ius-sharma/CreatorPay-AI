import { NextResponse } from 'next/server';
import { getActiveDeal, updateActiveDeal, appendDealLog, addAuditEntry } from '@/lib/store';
import { createBatchPayout, PayoutRecipient } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const deal = getActiveDeal();

    if (!deal) {
      return NextResponse.json({ success: false, error: 'No active deal found' }, { status: 404 });
    }

    if (deal.teamSplits.length === 0) {
      return NextResponse.json({ success: false, error: 'No team splits defined' }, { status: 400 });
    }

    // Prepare Payout Items
    const payoutRecipients: PayoutRecipient[] = deal.teamSplits.map((split) => ({
      recipientEmail: split.email,
      amount: split.calculatedAmount || 0,
      note: `CreatorPay AI Deal Settlement Cut: ${split.role} (${split.name}) for ${deal.dealTitle}`,
      recipientId: split.id,
    }));

    // Trigger PayPal Payouts API v1
    const payoutResult = await createBatchPayout(payoutRecipients, deal.currency);

    const now = new Date().toISOString();
    const timeFormatted = new Date().toLocaleString();

    // Log into immutable audit ledger for each collaborator
    deal.teamSplits.forEach((split, idx) => {
      addAuditEntry({
        id: `AUDIT-${Date.now()}-${idx}`,
        timestamp: timeFormatted,
        batchId: payoutResult.batchId,
        dealTitle: deal.dealTitle,
        recipientName: split.name,
        recipientRole: split.role,
        recipientEmail: split.email,
        type: 'contractor_payout',
        amount: split.calculatedAmount || 0,
        currency: deal.currency,
        status: 'COMPLETED',
        taxDeductible: true,
        category: '1099 Contractor Rev-Share',
      });
    });

    // Record creator net retention
    addAuditEntry({
      id: `AUDIT-${Date.now()}-creator`,
      timestamp: timeFormatted,
      batchId: payoutResult.batchId,
      dealTitle: deal.dealTitle,
      recipientName: 'Apex Media (Creator)',
      recipientRole: 'Studio Owner',
      recipientEmail: process.env.PAYPAL_BUSINESS_EMAIL || 'sb-9l0ms53173777@business.example.com',
      type: 'creator_retention',
      amount: deal.creatorNetPayout,
      currency: deal.currency,
      status: 'COMPLETED',
      taxDeductible: false,
      category: 'Net Studio Operating Income',
    });

    const updatedDeal = updateActiveDeal((prev) => {
      const settledSplits = prev.teamSplits.map((s, idx) => {
        const itemResult = payoutResult.payoutItems[idx];
        return {
          ...s,
          status: 'settled' as const,
          payoutBatchId: payoutResult.batchId,
          payoutItemId: itemResult?.payoutItemId || `ITEM-${idx + 1}`,
          settledAt: now,
        };
      });

      return {
        ...prev,
        status: 'deal_closed',
        teamSplits: settledSplits,
      };
    });

    const breakdownText = deal.teamSplits
      .map((s) => `\$${s.calculatedAmount} to ${s.name} (${s.role})`)
      .join(', ');

    appendDealLog({
      type: 'payout',
      title: 'Grand Finale: Multi-Party Split Payout Dispatched',
      description: `PayPal Payouts API Batch #${payoutResult.batchId} executed successfully. Disbursed: ${breakdownText}. Net remainder (\$${deal.creatorNetPayout}) settled to Creator. Audit ledger sealed.`,
      toolCall: {
        name: 'paypal.payouts.create_batch',
        params: {
          batch_id: payoutResult.batchId,
          total_team_payout: payoutResult.totalAmount,
          recipients: payoutRecipients,
          creator_net: deal.creatorNetPayout,
        },
        result: payoutResult,
      },
    });

    return NextResponse.json({
      success: true,
      payout: payoutResult,
      deal: updatedDeal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
