'use client';

import React from 'react';
import { Sparkles, Send, CreditCard, FileCheck2, Users, Check } from 'lucide-react';
import { Deal } from '@/lib/types';

interface WebhookSimulatorBarProps {
  deal: Deal;
  onGenerateInvoice: (milestoneIndex: number) => void;
  onSimulateWebhook: (milestoneIndex: number) => void;
  onOpenDeliverableModal: () => void;
  onExecutePayout: () => void;
  actionLoading: boolean;
}

export const WebhookSimulatorBar: React.FC<WebhookSimulatorBarProps> = ({
  deal,
  onGenerateInvoice,
  onSimulateWebhook,
  onOpenDeliverableModal,
  onExecutePayout,
  actionLoading,
}) => {
  const m1 = deal.milestones[0];
  const m2 = deal.milestones[1];

  const isM1Invoiced = m1?.status === 'invoiced' || m1?.status === 'paid';
  const isM1Paid = m1?.status === 'paid';
  const isDeliverableVerified = deal.deliverable?.verified;
  const isM2Paid = m2?.status === 'paid';
  const isPayoutSettled = deal.status === 'deal_closed';

  return (
    <div className="bg-white border border-brand-100 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Judge & Demo Quick Simulator
            </span>
            <span className="text-[11px] text-slate-500">
              Trigger PayPal Sandbox Invoicing, Webhooks & Payouts in 1-Click
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          Demo Flow (1 ➔ 5)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* Step 1: Send Milestone 1 Invoice */}
        <button
          onClick={() => onGenerateInvoice(0)}
          disabled={actionLoading || isM1Invoiced}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
            isM1Invoiced
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100 hover:border-brand-300 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs font-bold mb-0.5">
            {isM1Invoiced ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5" />}
            <span>1. Send Invoice</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">\${m1.amount} Advance</span>
        </button>

        {/* Step 2: Brand Pays Advance */}
        <button
          onClick={() => onSimulateWebhook(0)}
          disabled={actionLoading || !isM1Invoiced || isM1Paid}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
            isM1Paid
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : isM1Invoiced
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-sm animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs font-bold mb-0.5">
            {isM1Paid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CreditCard className="w-3.5 h-3.5" />}
            <span>2. Webhook Pay</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">\${m1.amount} Paid</span>
        </button>

        {/* Step 3: Verify Deliverable */}
        <button
          onClick={onOpenDeliverableModal}
          disabled={actionLoading || !isM1Paid || isDeliverableVerified}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
            isDeliverableVerified
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : isM1Paid
                ? 'bg-brand-50 border-brand-300 text-brand-700 hover:bg-brand-100 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs font-bold mb-0.5">
            {isDeliverableVerified ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCheck2 className="w-3.5 h-3.5" />}
            <span>3. AI Verify</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Proof Check</span>
        </button>

        {/* Step 4: Final Payment */}
        <button
          onClick={() => onSimulateWebhook(1)}
          disabled={actionLoading || !isDeliverableVerified || isM2Paid}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
            isM2Paid
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : isDeliverableVerified
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs font-bold mb-0.5">
            {isM2Paid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CreditCard className="w-3.5 h-3.5" />}
            <span>4. Final Payment</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">\${m2.amount} Balance</span>
        </button>

        {/* Step 5: Auto-Payout */}
        <button
          onClick={onExecutePayout}
          disabled={actionLoading || !isM2Paid || isPayoutSettled}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 cursor-pointer ${
            isPayoutSettled
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : isM2Paid
                ? 'bg-brand-600 border-brand-700 text-white font-bold hover:bg-brand-700 shadow-md shadow-brand-600/30 animate-bounce'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-xs font-bold mb-0.5">
            {isPayoutSettled ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Users className="w-3.5 h-3.5" />}
            <span>5. Split Payout</span>
          </div>
          <span className="text-[11px] text-slate-200 font-mono">
            {isPayoutSettled ? 'Disbursed ✓' : 'PayPal Payouts'}
          </span>
        </button>
      </div>
    </div>
  );
};
