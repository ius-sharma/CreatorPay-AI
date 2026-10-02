'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Deal } from '@/lib/types';

interface PayoutLedgerProps {
  deal: Deal;
}

export const PayoutLedger: React.FC<PayoutLedgerProps> = ({ deal }) => {
  const isSettled = deal.status === 'deal_closed';

  return (
    <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Multi-Party Settlement Ledger</h2>
            <p className="text-xs text-slate-500">PayPal Payouts API (v1) Revenue Split Routing</p>
          </div>
        </div>

        {isSettled ? (
          <span className="flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit Trail Verified</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
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
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isItemSettled 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{split.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {split.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{split.email}</p>
                  {split.payoutBatchId && (
                    <p className="text-[10px] text-brand-700 font-mono font-semibold mt-0.5">
                      Batch #{split.payoutBatchId}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-mono font-black text-slate-900">
                  \${split.calculatedAmount?.toFixed(2)}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isItemSettled 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {isItemSettled ? 'Transferred' : `${split.value}${split.type === 'percentage' ? '%' : ' USD'}`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Creator Net Retained */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-50 via-white to-brand-50/40 border border-brand-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-xs">Verified Creator (You)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                  Net Balance
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Connected PayPal Sandbox Wallet</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-mono font-black text-brand-700">
              \${deal.creatorNetPayout.toFixed(2)}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isSettled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-brand-100 text-brand-800'
            }`}>
              {isSettled ? 'Secured in Wallet' : 'Projected Net'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
