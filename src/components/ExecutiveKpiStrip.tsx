'use client';

import React from 'react';
import { DollarSign, ArrowUpRight, ShieldCheck, Clock, Users, Briefcase } from 'lucide-react';
import { Deal } from '@/lib/types';

interface ExecutiveKpiStripProps {
  deals: Deal[];
  activeDeal: Deal;
}

export const ExecutiveKpiStrip: React.FC<ExecutiveKpiStripProps> = ({ deals, activeDeal }) => {
  const totalVolume = deals.reduce((acc, d) => acc + d.totalAmount, 0);
  
  // Calculate cleared revenue
  let clearedRevenue = 0;
  let inFlightEscrow = 0;
  deals.forEach((d) => {
    d.milestones.forEach((m) => {
      if (m.status === 'paid') {
        clearedRevenue += m.amount;
      } else {
        inFlightEscrow += m.amount;
      }
    });
  });

  const totalTeamDisbursed = deals.reduce((acc, d) => {
    if (d.status === 'deal_closed') {
      return acc + d.teamSplits.reduce((sum, s) => sum + (s.calculatedAmount || 0), 0);
    }
    return acc;
  }, 343.75); // Including seeded historic payouts

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: Gross Sponsorship Volume */}
      <div className="bg-white border border-brand-100 rounded-2xl p-4 shadow-sm hover:border-brand-200 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline Volume</span>
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
          \${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
        <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-1">
          <ArrowUpRight className="w-3 h-3" />
          <span>{deals.length} Active Brand Contracts</span>
        </div>
      </div>

      {/* KPI 2: Cleared in PayPal Sandbox */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm hover:border-emerald-200 transition-all">
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
      <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm hover:border-amber-200 transition-all">
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
      <div className="bg-white border border-brand-100 rounded-2xl p-4 shadow-sm hover:border-brand-200 transition-all">
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
          PayPal Payouts API v1 Batch Transfer
        </p>
      </div>
    </div>
  );
};
