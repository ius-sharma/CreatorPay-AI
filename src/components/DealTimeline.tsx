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
  Sparkles,
  ShieldCheck
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
    <div className="bg-white border border-brand-100 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-brand-700">
              Active Milestone Lifecycle
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#003087] font-bold border border-blue-200">
              PayPal Invoicing + Payouts
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">{deal.dealTitle}</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Sponsor: {deal.brandName} • {deal.brandEmail}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Contract Face Value</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            \${deal.totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-brand-700 font-bold font-mono tabular-nums">
            Net Creator Take: \${deal.creatorNetPayout.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fintech Pipeline Stepper with Connecting Rails */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:via-[#0079C1] before:to-emerald-500">
        
        {/* Phase 1: AI Deal Analysis */}
        <div className="relative">
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-slate-900">Phase 1: Deal Terms Parsed & Verified</p>
              <p className="text-[11px] text-slate-500">
                Milestones: {m1.percentage}% Advance (\${m1.amount}) + {m2.percentage}% Delivery (\${m2.amount})
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Clauses Locked
            </span>
          </div>
        </div>

        {/* Phase 2: Milestone 1 Invoice */}
        <div className="relative">
          <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-all ${
            isM1Invoiced 
              ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600' 
              : 'bg-brand-50 border-2 border-brand-500 text-brand-700 animate-pulse'
          }`}>
            {isM1Invoiced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
          </div>
          <div className={`p-4 rounded-2xl border transition-all ${
            isM1Invoiced ? 'bg-slate-50 border-slate-200' : 'bg-brand-50/60 border-brand-300 ring-2 ring-brand-500/10'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Phase 2: Milestone 1 PayPal Invoice ({m1.percentage}% Advance - \${m1.amount})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isM1Invoiced ? (
                    <span className="font-mono text-[#003087] font-bold">
                      Invoice #{m1.invoiceNumber} • Status: {m1.status.toUpperCase()}
                    </span>
                  ) : (
                    'Generates compliant itemized invoice via PayPal Invoicing API v2'
                  )}
                </p>
              </div>

              {!isM1Invoiced ? (
                <button
                  onClick={() => onGenerateInvoice(0)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0079C1] hover:bg-[#003087] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
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
                      className="text-xs text-[#0079C1] hover:text-[#003087] font-bold flex items-center space-x-1"
                    >
                      <span>PayPal Sandbox Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    isM1Paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {m1.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase 3: Webhook Payment Clearance */}
        <div className="relative">
          <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-all ${
            isM1Paid ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600' : 'bg-slate-100 border border-slate-300 text-slate-400'
          }`}>
            {isM1Paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          </div>
          <div className={`p-4 rounded-2xl border transition-all ${
            isM1Paid ? 'bg-slate-50 border-slate-200' : isM1Invoiced ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-100 opacity-60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Phase 3: PayPal Webhook Payment Trigger</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isM1Paid 
                    ? `Cleared \$${m1.amount} via INVOICING.INVOICE.PAID • Team notified to begin production`
                    : 'Awaiting brand payment clearance event'}
                </p>
              </div>

              {isM1Invoiced && !isM1Paid && (
                <button
                  onClick={() => onSimulateWebhook(0)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate Brand Pay (\${m1.amount})</span>
                </button>
              )}

              {isM1Paid && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  PAID & SETTLED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Phase 4: AI Deliverable Verification */}
        <div className="relative">
          <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-all ${
            isDeliverableVerified ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600' : 'bg-slate-100 border border-slate-300 text-slate-400'
          }`}>
            {isDeliverableVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileCheck2 className="w-3.5 h-3.5" />}
          </div>
          <div className={`p-4 rounded-2xl border transition-all ${
            isDeliverableVerified ? 'bg-slate-50 border-slate-200' : isM1Paid ? 'bg-brand-50/70 border-brand-300' : 'bg-slate-50/50 border-slate-100 opacity-60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">Phase 4: AI Deliverable Verification</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isDeliverableVerified 
                    ? 'Compliance Confirmed: Sponsor tag #cloudhost and discount link validated' 
                    : 'Inspect video sponsor segment & trackable links'}
                </p>
              </div>

              {isM1Paid && !isDeliverableVerified && (
                <button
                  onClick={onOpenDeliverableModal}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Verify Deliverable</span>
                </button>
              )}

              {isDeliverableVerified && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800">
                  VERIFIED 98%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Phase 5: Final Settlement & Auto-Payout */}
        <div className="relative">
          <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-all ${
            isPayoutSettled ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600' : 'bg-slate-100 border border-slate-300 text-slate-400'
          }`}>
            {isPayoutSettled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
          </div>
          <div className={`p-5 rounded-2xl border transition-all ${
            isPayoutSettled ? 'bg-emerald-50/70 border-emerald-200' : isDeliverableVerified ? 'bg-gradient-to-r from-brand-50 to-blue-50 border-brand-300 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Phase 5: Final Settlement & Multi-Party PayPal Split Payout
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPayoutSettled 
                    ? 'Batch Payout Executed! Funds sent to Editor Aman, Designer Rohan, and Creator'
                    : `Release final \$${m2.amount} and execute batch payouts to team via PayPal Payouts API`}
                </p>
              </div>

              {isDeliverableVerified && !isM2Paid && (
                <button
                  onClick={() => onSimulateWebhook(1)}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Simulate Final Payment (\${m2.amount})</span>
                </button>
              )}

              {isM2Paid && !isPayoutSettled && (
                <button
                  onClick={onExecutePayout}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003087] via-[#0079C1] to-[#7033ff] hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-brand-600/25 cursor-pointer transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Execute Multi-Party PayPal Payout</span>
                  <ArrowRight className="w-4 h-4" />
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
