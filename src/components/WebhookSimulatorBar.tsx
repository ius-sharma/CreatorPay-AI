'use client';

import React from 'react';
import { Sparkles, Send, CreditCard, FileCheck2, Users, Play, Check } from 'lucide-react';
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Judge & Demo Quick Simulator
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click sequential triggers below to test live PayPal Sandbox & Webhook transitions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {/* Step 1: Send Milestone 1 Invoice */}
        <button
          onClick={() => onGenerateInvoice(0)}
          disabled={actionLoading || isM1Invoiced}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
            isM1Invoiced
              ? 'bg-slate-950/80 border-slate-800 text-slate-500'
              : 'bg-sky-600/20 border-sky-500/40 text-sky-300 hover:bg-sky-600/30'
          }`}
        >
          <div className="flex items-center space-x-1 text-[11px] font-bold mb-0.5">
            {isM1Invoiced ? <Check className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
            <span>1. Send Invoice</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">\${m1.amount} Advance</span>
        </button>

        {/* Step 2: Brand Pays Advance */}
        <button
          onClick={() => onSimulateWebhook(0)}
          disabled={actionLoading || !isM1Invoiced || isM1Paid}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
            isM1Paid
              ? 'bg-slate-950/80 border-slate-800 text-slate-500'
              : isM1Invoiced
                ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-[11px] font-bold mb-0.5">
            {isM1Paid ? <Check className="w-3 h-3 text-emerald-400" /> : <CreditCard className="w-3 h-3" />}
            <span>2. Webhook Pay</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">\${m1.amount} Paid</span>
        </button>

        {/* Step 3: Verify Deliverable */}
        <button
          onClick={onOpenDeliverableModal}
          disabled={actionLoading || !isM1Paid || isDeliverableVerified}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
            isDeliverableVerified
              ? 'bg-slate-950/80 border-slate-800 text-slate-500'
              : isM1Paid
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-[11px] font-bold mb-0.5">
            {isDeliverableVerified ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCheck2 className="w-3 h-3" />}
            <span>3. AI Verify</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Proof Check</span>
        </button>

        {/* Step 4: Final Payment */}
        <button
          onClick={() => onSimulateWebhook(1)}
          disabled={actionLoading || !isDeliverableVerified || isM2Paid}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
            isM2Paid
              ? 'bg-slate-950/80 border-slate-800 text-slate-500'
              : isDeliverableVerified
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-[11px] font-bold mb-0.5">
            {isM2Paid ? <Check className="w-3 h-3 text-emerald-400" /> : <CreditCard className="w-3 h-3" />}
            <span>4. Final Payment</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">\${m2.amount} Balance</span>
        </button>

        {/* Step 5: Auto-Payout */}
        <button
          onClick={onExecutePayout}
          disabled={actionLoading || !isM2Paid || isPayoutSettled}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 ${
            isPayoutSettled
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : isM2Paid
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold hover:opacity-90 shadow-md'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-1 text-[11px] font-bold mb-0.5">
            {isPayoutSettled ? <Check className="w-3 h-3 text-emerald-400" /> : <Users className="w-3 h-3" />}
            <span>5. Split Payout</span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono">
            {isPayoutSettled ? 'Disbursed ✓' : 'PayPal Payouts'}
          </span>
        </button>
      </div>
    </div>
  );
};
