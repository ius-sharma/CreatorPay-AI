'use client';

import React from 'react';
import { Deal } from '@/lib/types';
import { Briefcase, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface DealSwitcherTrayProps {
  deals: Deal[];
  activeDealId: string;
  onSelectDeal: (dealId: string) => void;
}

export const DealSwitcherTray: React.FC<DealSwitcherTrayProps> = ({
  deals,
  activeDealId,
  onSelectDeal,
}) => {
  const getBadgeStyle = (status: Deal['status']) => {
    switch (status) {
      case 'deal_closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'advance_paid':
      case 'in_production':
      case 'deliverable_verified':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'advance_invoiced':
      case 'final_invoiced':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: Deal['status']) => {
    switch (status) {
      case 'deal_closed':
        return 'Settled ✓';
      case 'advance_paid':
        return 'Advance Paid (In Production)';
      case 'deliverable_verified':
        return 'Deliverable Verified';
      case 'advance_invoiced':
        return 'Milestone 1 Invoiced';
      case 'analyzed':
        return 'Ready for Invoice';
      default:
        return 'Active';
    }
  };

  return (
    <div className="bg-white border border-brand-100 rounded-2xl p-3 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Brand Deals Portfolio
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Select contract to manage lifecycle & payouts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {deals.map((d) => {
          const isActive = d.id === activeDealId;
          return (
            <button
              key={d.id}
              onClick={() => onSelectDeal(d.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-500/20 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-brand-600 rounded-full border-2 border-white" />
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-slate-900 text-xs truncate max-w-[130px]">
                  {d.brandName}
                </span>
                <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                  \${d.totalAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mb-1.5">{d.dealTitle}</p>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getBadgeStyle(d.status)}`}>
                {getStatusLabel(d.status)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
