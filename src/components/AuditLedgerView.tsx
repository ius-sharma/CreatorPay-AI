'use client';

import React from 'react';
import { AuditLedgerEntry } from '@/lib/types';
import { ShieldCheck, Download, FileText, CheckCircle2, ArrowUpRight, DollarSign } from 'lucide-react';

interface AuditLedgerViewProps {
  ledger: AuditLedgerEntry[];
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ ledger }) => {
  const totalDisbursed = ledger
    .filter((e) => e.type === 'contractor_payout')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCreatorNet = ledger
    .filter((e) => e.type === 'creator_retention')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Batch ID', 'Deal', 'Recipient', 'Role', 'Email', 'Type', 'Amount', 'Currency', 'Tax Deductible', 'Category'];
    const rows = ledger.map((e) => [
      e.id,
      e.timestamp,
      e.batchId,
      e.dealTitle,
      e.recipientName,
      e.recipientRole,
      e.recipientEmail,
      e.type,
      e.amount,
      e.currency,
      e.taxDeductible ? 'YES' : 'NO',
      e.category,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CreatorPay_Audit_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Treasury & Tax Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Multi-Party Splits Executed
          </p>
          <p className="text-2xl font-black text-brand-700 mt-1 tabular-nums font-mono">
            \${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Disbursed via PayPal Payouts API v1</p>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            1099 Deductible Contractor Expenses
          </p>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums font-mono">
            \${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Legitimate IRS Schedule C business deductions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Studio Operating Retained
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono">
            \${totalCreatorNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cleared into Creator PayPal Business Wallet</p>
        </div>
      </div>

      {/* Audit Table Card */}
      <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-900 text-base">
                Treasury & Payout Audit Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable cryptographic transaction records with official PayPal Payout Batch IDs
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger CSV</span>
          </button>
        </div>

        {/* Ledger Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">PayPal Batch ID</th>
                <th className="py-3 px-4">Deal / Context</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Tax Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{entry.timestamp}</td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{entry.batchId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{entry.dealTitle}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{entry.recipientName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{entry.recipientEmail}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                      entry.taxDeductible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    \${entry.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
