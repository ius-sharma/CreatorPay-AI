'use client';

import React, { useState } from 'react';
import { Sparkles, Send, CreditCard, FileCheck2, Users, Check, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Deal } from '@/lib/types';

interface FloatingSandboxConsoleProps {
  deal: Deal;
  onGenerateInvoice: (milestoneIndex: number) => void;
  onSimulateWebhook: (milestoneIndex: number) => void;
  onOpenDeliverableModal: () => void;
  onExecutePayout: () => void;
  actionLoading: boolean;
}

export const FloatingSandboxConsole: React.FC<FloatingSandboxConsoleProps> = ({
  deal,
  onGenerateInvoice,
  onSimulateWebhook,
  onOpenDeliverableModal,
  onExecutePayout,
  actionLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const m1 = deal.milestones[0];
  const m2 = deal.milestones[1];

  const isM1Invoiced = m1?.status === 'invoiced' || m1?.status === 'paid';
  const isM1Paid = m1?.status === 'paid';
  const isDeliverableVerified = deal.deliverable?.verified;
  const isM2Paid = m2?.status === 'paid';
  const isPayoutSettled = deal.status === 'deal_closed';

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-xl w-full px-4 sm:px-0">
      <div className="bg-white/95 backdrop-blur-md border border-brand-200 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-50 via-white to-brand-50 flex items-center justify-between cursor-pointer border-b border-brand-100 select-none"
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-3 h-3" />
            </div>
            <span className="text-xs font-black text-slate-900 tracking-tight">
              Judge Live Sandbox Controller
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live PayPal Connected
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-500">
            <span className="text-[11px] font-semibold text-brand-700 hidden sm:inline">
              {isExpanded ? 'Minimize' : 'Expand 1-Click Simulator'}
            </span>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {/* Step Buttons Body */}
        {isExpanded && (
          <div className="p-3 bg-white">
            <p className="text-[10px] text-slate-400 mb-2 px-1">
              Trigger instant PayPal Invoicing, Webhook, and Multi-Party Payout transitions:
            </p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {/* Step 1 */}
              <button
                onClick={() => onGenerateInvoice(0)}
                disabled={actionLoading || isM1Invoiced}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isM1Invoiced
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100 shadow-2xs'
                }`}
                title="Create PayPal Milestone 1 Invoice"
              >
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                  {isM1Invoiced ? <Check className="w-3 h-3 text-emerald-600" /> : <Send className="w-3 h-3" />}
                  <span>1. Invoice</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">\${m1.amount}</span>
              </button>

              {/* Step 2 */}
              <button
                onClick={() => onSimulateWebhook(0)}
                disabled={actionLoading || !isM1Invoiced || isM1Paid}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isM1Paid
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : isM1Invoiced
                      ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-2xs animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="Simulate Brand Webhook Payment"
              >
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                  {isM1Paid ? <Check className="w-3 h-3 text-emerald-600" /> : <CreditCard className="w-3 h-3" />}
                  <span>2. Webhook</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">\${m1.amount}</span>
              </button>

              {/* Step 3 */}
              <button
                onClick={onOpenDeliverableModal}
                disabled={actionLoading || !isM1Paid || isDeliverableVerified}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isDeliverableVerified
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : isM1Paid
                      ? 'bg-brand-50 border-brand-300 text-brand-700 hover:bg-brand-100 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="Verify Deliverable Sponsor Proof"
              >
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                  {isDeliverableVerified ? <Check className="w-3 h-3 text-emerald-600" /> : <FileCheck2 className="w-3 h-3" />}
                  <span>3. AI Verify</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Proof</span>
              </button>

              {/* Step 4 */}
              <button
                onClick={() => onSimulateWebhook(1)}
                disabled={actionLoading || !isDeliverableVerified || isM2Paid}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isM2Paid
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : isDeliverableVerified
                      ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="Brand Pays Final Milestone"
              >
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                  {isM2Paid ? <Check className="w-3 h-3 text-emerald-600" /> : <CreditCard className="w-3 h-3" />}
                  <span>4. Final Pay</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">\${m2.amount}</span>
              </button>

              {/* Step 5 */}
              <button
                onClick={onExecutePayout}
                disabled={actionLoading || !isM2Paid || isPayoutSettled}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isPayoutSettled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : isM2Paid
                      ? 'bg-brand-600 border-brand-700 text-white font-extrabold hover:bg-brand-700 shadow-md animate-bounce'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="Trigger Batch Payouts via PayPal API"
              >
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                  {isPayoutSettled ? <Check className="w-3 h-3 text-emerald-600" /> : <Users className="w-3 h-3" />}
                  <span>5. Payouts</span>
                </div>
                <span className="text-[9px] font-mono">{isPayoutSettled ? 'Sent ✓' : 'Release'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
