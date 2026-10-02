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
  ShieldAlert,
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Active Sponsorship Deal
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {deal.currency}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">{deal.brandName}</h1>
            <p className="text-xs text-slate-400 font-mono">{deal.brandEmail}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Contract Total</p>
            <p className="text-2xl font-black text-white tracking-tight">
              \${deal.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              Net to Creator: \${deal.creatorNetPayout.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5-Phase Interactive Pipeline */}
        <div className="space-y-3">
          {/* Phase 1: Deal Analyzed */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Phase 1: Deal Analyzed by AI</p>
                <p className="text-[11px] text-slate-400">
                  {m1.percentage}% Advance (\${m1.amount}) + {m2.percentage}% Delivery (\${m2.amount})
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-emerald-400">Terms Locked</span>
          </div>

          {/* Phase 2: Milestone 1 Invoice */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isM1Invoiced 
              ? 'bg-slate-950/60 border-slate-800' 
              : 'bg-blue-950/20 border-blue-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isM1Invoiced 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-blue-500/20 text-sky-400 animate-pulse'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    Phase 2: Milestone 1 PayPal Invoice ({m1.percentage}% - \${m1.amount})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isM1Invoiced ? (
                      <span className="font-mono text-sky-400">
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
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
                      className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1"
                    >
                      <span>PayPal Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isM1Paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {m1.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: Webhook Payment Clearance (Advance) */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isM1Paid 
              ? 'bg-slate-950/60 border-slate-800' 
              : isM1Invoiced 
                ? 'bg-amber-950/20 border-amber-500/30' 
                : 'bg-slate-950/30 border-slate-900 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isM1Paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Phase 3: PayPal Webhook Payment Trigger</p>
                  <p className="text-[11px] text-slate-400">
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate Brand Pay (\${m1.amount})</span>
                </button>
              )}

              {isM1Paid && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PAID & SETTLED
                </span>
              )}
            </div>
          </div>

          {/* Phase 4: AI Deliverable Verification */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isDeliverableVerified 
              ? 'bg-slate-950/60 border-slate-800' 
              : isM1Paid 
                ? 'bg-purple-950/20 border-purple-500/30' 
                : 'bg-slate-950/30 border-slate-900 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDeliverableVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Phase 4: AI Deliverable Verification</p>
                  <p className="text-[11px] text-slate-400">
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Verify Deliverable</span>
                </button>
              )}

              {isDeliverableVerified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  VERIFIED 98%
                </span>
              )}
            </div>
          </div>

          {/* Phase 5: Final Payment & Multi-Party Split Payout */}
          <div className={`p-4 rounded-xl border transition-all ${
            isPayoutSettled 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : isDeliverableVerified 
                ? 'bg-rose-950/20 border-rose-500/30' 
                : 'bg-slate-950/30 border-slate-900 opacity-60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isPayoutSettled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    Phase 5: Final Settlement & Multi-Party PayPal Split Payout
                  </p>
                  <p className="text-[11px] text-slate-400">
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate Final Payment (\${m2.amount})</span>
                </button>
              )}

              {isM2Paid && !isPayoutSettled && (
                <button
                  onClick={onExecutePayout}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 cursor-pointer animate-bounce"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Execute Multi-Party PayPal Payout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isPayoutSettled && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
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
