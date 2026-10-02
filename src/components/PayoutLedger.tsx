'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, Clock, DollarSign, ArrowUpRight } from 'lucide-react';
import { Deal } from '@/lib/types';

interface PayoutLedgerProps {
  deal: Deal;
}

export const PayoutLedger: React.FC<PayoutLedgerProps> = ({ deal }) => {
  const isSettled = deal.status === 'deal_closed';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Multi-Party Settlement Ledger</h2>
            <p className="text-xs text-slate-400">PayPal Payouts API (v1) Revenue Split Routing</p>
          </div>
        </div>

        {isSettled ? (
          <span className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit Trail Verified</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Clearance</span>
          </span>
        )}
      </div>

      {/* Recipient Split Cards */}
      <div className="space-y-2.5">
        {deal.teamSplits.map((split) => {
          const isItemSettled = split.status === 'settled';
          return (
            <div
              key={split.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isItemSettled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs">{split.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {split.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{split.email}</p>
                  {split.payoutBatchId && (
                    <p className="text-[10px] text-sky-400 font-mono mt-0.5">
                      Batch #{split.payoutBatchId}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-mono font-bold text-white">
                  \${split.calculatedAmount?.toFixed(2)}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isItemSettled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isItemSettled ? 'Transferred' : `${split.value}${split.type === 'percentage' ? '%' : ' USD'}`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Creator Net Retained */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-sky-950/30 to-slate-950/70 border border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs">Verified Creator (You)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  Net Balance
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Connected PayPal Sandbox Wallet</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-mono font-black text-emerald-400">
              \${deal.creatorNetPayout.toFixed(2)}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              isSettled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-300'
            }`}>
              {isSettled ? 'Secured in Wallet' : 'Projected Net'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
