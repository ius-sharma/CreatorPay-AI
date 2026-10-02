'use client';

import React from 'react';
import { X, ExternalLink, CheckCircle2, ShieldCheck, Printer, Download } from 'lucide-react';
import { PayPalInvoiceSummary } from '@/lib/types';

interface PayPalInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PayPalInvoiceSummary | null;
}

export const PayPalInvoiceModal: React.FC<PayPalInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official PayPal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center space-x-3">
            {/* Authentic PayPal Monogram SVG */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#001C3E] via-[#003087] to-[#0079C1] flex items-center justify-center shadow-md">
              <span className="text-white font-black italic text-xl tracking-tighter">P</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-[#003087]">PayPal</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#003087] border border-blue-200">
                  Invoicing API v2
                </span>
              </div>
              <p className="text-xs text-slate-500">Official Merchant Billing Receipt</p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
              invoice.status === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Invoice Number</p>
            <p className="font-mono font-bold text-slate-900 mt-0.5">#{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Issue Date</p>
            <p className="font-semibold text-slate-800 mt-0.5">{invoice.issueDate}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Due Date</p>
            <p className="font-semibold text-slate-800 mt-0.5">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Payment Terms</p>
            <p className="font-semibold text-slate-800 mt-0.5">{invoice.terms}</p>
          </div>
        </div>

        {/* Billing Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-white">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Billed From (Creator Merchant)
            </p>
            <p className="font-extrabold text-slate-900 text-sm">Apex Media LLC</p>
            <p className="text-slate-500 font-mono mt-0.5">sb-9l0ms53173777@business.example.com</p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified PayPal Merchant
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-white">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Billed To (Sponsor Brand)
            </p>
            <p className="font-extrabold text-slate-900 text-sm">{invoice.brandName}</p>
            <p className="text-slate-500 font-mono mt-0.5">{invoice.brandEmail}</p>
            <p className="text-slate-400 mt-2 text-[11px]">{invoice.dealTitle}</p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{invoice.milestoneTitle}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Contractual milestone payment processed via CreatorPay AI</p>
                </td>
                <td className="py-3.5 px-4 text-center font-mono">1</td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums">\${invoice.amount.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                  \${invoice.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Subtotal & Total */}
          <div className="bg-slate-50/70 p-4 border-t border-slate-200 flex flex-col items-end space-y-1 text-xs">
            <div className="flex justify-between w-48 text-slate-500">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">\${invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-slate-500">
              <span>Estimated Tax:</span>
              <span className="font-mono tabular-nums">\$0.00</span>
            </div>
            <div className="flex justify-between w-48 font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
              <span>Total Amount:</span>
              <span className="font-black text-[#003087] font-mono tabular-nums">
                \${invoice.amount.toFixed(2)} {invoice.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted with PayPal 256-bit TLS Gateway</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <a
              href={invoice.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0079C1] hover:bg-[#003087] text-white text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>Open in PayPal Sandbox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
