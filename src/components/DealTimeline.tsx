'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileCheck2, 
  Send, 
  Users, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Deal } from '@/lib/types';

interface DealTimelineProps {
  deal: Deal;
  onGenerateInvoice: (milestoneIndex: number) => void;
  onSimulateWebhook: (milestoneIndex: number) => void;
  onOpenDeliverableModal: () => void;
  onExecutePayout: () => void;
  actionLoading: boolean;
}

export const DealTimeline: React.FC<DealTimelineProps> = ({
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
  const isM2Invoiced = m2?.status === 'invoiced' || m2?.status === 'paid';
  const isM2Paid = m2?.status === 'paid';
  const isPayoutSettled = deal.status === 'deal_closed';

  return (
    <div className="space-y-4">
      {/* Deal Overview Card */}
      <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-brand-700">
                Active Sponsorship Deal
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                {deal.currency}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">{deal.brandName}</h1>
            <p className="text-xs text-slate-500 font-mono">{deal.brandEmail}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Contract Total</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              \${deal.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-brand-700 font-bold">
              Net to Creator: \${deal.creatorNetPayout.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5-Phase Interactive Pipeline */}
        <div className="space-y-3">
          {/* Phase 1: Deal Analyzed */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Phase 1: Deal Analyzed by AI</p>
                <p className="text-[11px] text-slate-500">
                  {m1.percentage}% Advance (\${m1.amount}) + {m2.percentage}% Delivery (\${m2.amount})
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Terms Locked
            </span>
          </div>

          {/* Phase 2: Milestone 1 Invoice */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isM1Invoiced 
              ? 'bg-slate-50 border-slate-200' 
              : 'bg-brand-50/50 border-brand-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isM1Invoiced 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-brand-100 text-brand-700 animate-pulse'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Phase 2: Milestone 1 PayPal Invoice ({m1.percentage}% - \${m1.amount})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isM1Invoiced ? (
                      <span className="font-mono text-brand-700 font-semibold">
                        Invoice #{m1.invoiceNumber} • {m1.status.toUpperCase()}
                      </span>
                    ) : (
                      'Autonomous generation via PayPal Invoicing API v2'
                    )}
                  </p>
                </div>
              </div>

              {!isM1Invoiced ? (
                <button
                  onClick={() => onGenerateInvoice(0)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send PayPal Invoice</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  {m1.invoiceUrl && (
                    <a
                      href={m1.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center space-x-1"
                    >
                      <span>PayPal Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isM1Paid 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {m1.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: Webhook Payment Clearance */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isM1Paid 
              ? 'bg-slate-50 border-slate-200' 
              : isM1Invoiced 
                ? 'bg-amber-50/60 border-amber-300' 
                : 'bg-slate-50/50 border-slate-100 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isM1Paid 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Phase 3: PayPal Webhook Payment Trigger</p>
                  <p className="text-[11px] text-slate-500">
                    {isM1Paid 
                      ? `Cleared \$${m1.amount} via INVOICING.INVOICE.PAID` 
                      : 'Awaiting brand payment clearance event'}
                  </p>
                </div>
              </div>

              {isM1Invoiced && !isM1Paid && (
                <button
                  onClick={() => onSimulateWebhook(0)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate Brand Pay (\${m1.amount})</span>
                </button>
              )}

              {isM1Paid && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  PAID & SETTLED
                </span>
              )}
            </div>
          </div>

          {/* Phase 4: AI Deliverable Verification */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isDeliverableVerified 
              ? 'bg-slate-50 border-slate-200' 
              : isM1Paid 
                ? 'bg-brand-50/60 border-brand-300' 
                : 'bg-slate-50/50 border-slate-100 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDeliverableVerified 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Phase 4: AI Deliverable Verification</p>
                  <p className="text-[11px] text-slate-500">
                    {isDeliverableVerified 
                      ? 'Verified: Sponsor hashtag and deal link confirmed in video metadata' 
                      : 'Inspect video sponsor segment & trackable links'}
                  </p>
                </div>
              </div>

              {isM1Paid && !isDeliverableVerified && (
                <button
                  onClick={onOpenDeliverableModal}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-600/20 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Verify Deliverable</span>
                </button>
              )}

              {isDeliverableVerified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  VERIFIED 98%
                </span>
              )}
            </div>
          </div>

          {/* Phase 5: Final Settlement & Multi-Party Split Payout */}
          <div className={`p-4 rounded-xl border transition-all ${
            isPayoutSettled 
              ? 'bg-emerald-50/70 border-emerald-200' 
              : isDeliverableVerified 
                ? 'bg-brand-50/60 border-brand-300' 
                : 'bg-slate-50/50 border-slate-100 opacity-60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isPayoutSettled 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Phase 5: Final Settlement & Multi-Party PayPal Split Payout
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isPayoutSettled 
                      ? 'Batch Payout Executed! Funds sent to Editor Aman, Designer Rohan, and Creator'
                      : `Release final \${m2.amount} and execute batch payouts to team via PayPal Payouts API`}
                  </p>
                </div>
              </div>

              {isDeliverableVerified && !isM2Paid && (
                <button
                  onClick={() => onSimulateWebhook(1)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate Final Payment (\${m2.amount})</span>
                </button>
              )}

              {isM2Paid && !isPayoutSettled && (
                <button
                  onClick={onExecutePayout}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-lg shadow-brand-600/30 cursor-pointer animate-bounce"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Execute Multi-Party PayPal Payout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isPayoutSettled && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ALL FUNDS DISBURSED</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
