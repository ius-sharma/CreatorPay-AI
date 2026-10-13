'use client';

import React from 'react';
import { DollarSign, ArrowUpRight, ShieldCheck, Clock, Users, Briefcase } from 'lucide-react';
import { Deal } from '@/lib/types';

interface ExecutiveKpiStripProps {
  deals: Deal[];
  activeDeal: Deal;
}

export const ExecutiveKpiStrip: React.FC<ExecutiveKpiStripProps> = ({ deals, activeDeal }) => {
  deals = deals.filter((deal) => !deal.demo && deal.currency === 'USD');
  const totalVolume = deals.reduce((acc, d) => acc + d.totalAmount, 0);
  
  // Calculate cleared revenue
  let clearedRevenue = 0;
  let inFlightEscrow = 0;
  deals.forEach((d) => {
    d.milestones.forEach((m) => {
      if (m.status === 'paid' && m.paymentVerifiedAt) {
        clearedRevenue += m.amount;
      } else {
        inFlightEscrow += m.amount;
      }
    });
  });

  const totalTeamDisbursed = deals.reduce((sum, d) => sum + (d.payout?.items.filter(i => i.status === 'SUCCESS' && i.transactionId).reduce((total, i) => total + i.amount, 0) || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: Gross Sponsorship Volume */}
      <div className="rounded-2xl border border-brand-100/80 dark:border-espresso-800/80 bg-gradient-to-br from-white via-[#FFFDFB] to-[#FDF4EF] dark:bg-gradient-to-br dark:from-[#231814] dark:via-[#1A1310] dark:to-[#120B09] p-4 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-espresso-700 transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Pipeline (USD)</span>
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          \${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
        <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-1">
          <ArrowUpRight className="w-3 h-3" />
          <span>{deals.length} Confirmed USD Contracts</span>
        </div>
      </div>

      {/* KPI 2: Cleared in PayPal Sandbox */}
      <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-white via-[#FAFCF8] to-[#F4F9F1] dark:bg-gradient-to-br dark:from-[#17241A] dark:via-[#121E15] dark:to-[#0D1610] p-4 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Cleared in PayPal</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
          \${clearedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Verified via Invoicing API v2
        </p>
      </div>

      {/* KPI 3: In-Flight Milestone Escrow */}
      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-white via-[#FCFBF8] to-[#FDF8EE] dark:bg-gradient-to-br dark:from-[#261E14] dark:via-[#1D170E] dark:to-[#141009] p-4 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Pending Deliverables</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-2xl font-black text-amber-800 tracking-tight tabular-nums">
          \${inFlightEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Awaiting Video Completion & Proof
        </p>
      </div>

      {/* KPI 4: Automated Team Payouts */}
      <div className="rounded-2xl border border-brand-200/80 dark:border-brand-900/50 bg-gradient-to-br from-white via-[#FFFDFB] to-[#FDF3EE] dark:bg-gradient-to-br dark:from-[#291712] dark:via-[#1E110D] dark:to-[#140A07] p-4 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-800 transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">Team Cuts Disbursed</span>
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-2xl font-black text-brand-700 tracking-tight tabular-nums">
          \${totalTeamDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Verified PayPal payout item transactions
        </p>
      </div>
    </div>
  );
};
