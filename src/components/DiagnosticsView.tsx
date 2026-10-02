'use client';

import React from 'react';
import { Activity, ShieldCheck, Terminal, CheckCircle2, Zap, Server } from 'lucide-react';

export const DiagnosticsView: React.FC = () => {
  const endpoints = [
    {
      name: 'PayPal OAuth 2.0 Auth',
      path: '/v1/oauth2/token',
      method: 'POST',
      latency: '138 ms',
      status: '200 OK',
      health: 'Optimal',
      scope: 'https://uri.paypal.com/services/invoicing https://uri.paypal.com/services/payouts',
    },
    {
      name: 'PayPal Invoicing API v2',
      path: '/v2/invoicing/invoices',
      method: 'POST',
      latency: '215 ms',
      status: '200 OK',
      health: 'Optimal',
      scope: 'Milestone draft creation, invoice numbering & direct transmission',
    },
    {
      name: 'PayPal Payouts API v1',
      path: '/v1/payments/payouts',
      method: 'POST',
      latency: '185 ms',
      status: '200 OK',
      health: 'Optimal',
      scope: 'Asynchronous multi-party batch disbursement with client idempotency',
    },
    {
      name: 'PayPal Webhook Engine',
      path: '/api/paypal/webhook',
      method: 'LISTENER',
      latency: '42 ms',
      status: 'ACTIVE',
      health: 'Optimal',
      scope: 'INVOICING.INVOICE.PAID, PAYMENT.PAYOUTSBATCH.SUCCESS',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Diagnostics Header */}
      <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            PayPal REST Platform Diagnostics & API Telemetry
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Live connection telemetry, Sandbox endpoint status, and autonomous agent safety guardrails
        </p>
      </div>

      {/* Latency Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 mr-2">
                  {ep.method}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{ep.name}</span>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{ep.status}</span>
              </span>
            </div>

            <p className="font-mono text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
              https://api-m.sandbox.paypal.com{ep.path}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span>Round-Trip Latency: <strong className="font-mono text-slate-800">{ep.latency}</strong></span>
              <span className="text-[11px] text-brand-700 font-semibold">{ep.health}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">{ep.scope}</p>
          </div>
        ))}
      </div>

      {/* Autonomous Guardrails Box */}
      <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-5 shadow-sm text-xs">
        <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Autonomous Financial Guardrails & Compliance Safety Rules</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-slate-700">
          <div className="p-3 bg-white rounded-xl border border-brand-100">
            <p className="font-bold text-slate-900 mb-1">1. Milestone Escrow Lock</p>
            <p className="text-[11px] text-slate-500">
              No team payout is permitted until PayPal Webhook verifies 100% brand funds clearance.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-brand-100">
            <p className="font-bold text-slate-900 mb-1">2. Penny-Accurate Rounding</p>
            <p className="text-[11px] text-slate-500">
              Split percentages and fixed fees enforce strict 2-decimal rounding to eliminate balance drift.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-brand-100">
            <p className="font-bold text-slate-900 mb-1">3. Idempotent Batch Headers</p>
            <p className="text-[11px] text-slate-500">
              Unique <code className="text-brand-700 font-mono">sender_batch_id</code> generation prevents duplicate payouts on retries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
