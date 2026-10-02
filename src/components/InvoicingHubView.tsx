'use client';

import React, { useState } from 'react';
import { PayPalInvoiceSummary } from '@/lib/types';
import { PayPalInvoiceModal } from './PayPalInvoiceModal';
import { FileText, Search, ExternalLink, Eye, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

interface InvoicingHubViewProps {
  invoices: PayPalInvoiceSummary[];
}

export const InvoicingHubView: React.FC<InvoicingHubViewProps> = ({ invoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PayPalInvoiceSummary | null>(null);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.milestoneTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Invoice Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Receivables</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono">
            \${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{invoices.length} Total Invoices Issued</p>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Cleared & Settled</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums font-mono">
            \${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Directly credited to Creator PayPal Wallet</p>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Settlement</p>
          <p className="text-2xl font-black text-amber-800 mt-1 tabular-nums font-mono">
            \${(totalInvoiced - totalPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting brand review & webhook trigger</p>
        </div>
      </div>

      {/* Invoice Data Table Card */}
      <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">PayPal Invoicing Hub</h2>
            <p className="text-xs text-slate-500">Live registry of milestone invoices generated via PayPal Invoicing API v2</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice # or brand..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Sponsor Brand</th>
                <th className="py-3 px-4">Milestone Tranche</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">
                    #{inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{inv.brandName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inv.brandEmail}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{inv.milestoneTitle}</p>
                    <p className="text-[10px] text-slate-400">{inv.dealTitle}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    \${inv.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 border border-slate-200 transition-colors cursor-pointer"
                        title="View PayPal Digital Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={inv.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#0079C1]/10 hover:bg-[#0079C1]/20 text-[#003087] border border-blue-200 transition-colors cursor-pointer"
                        title="Open in PayPal Sandbox"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <PayPalInvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
