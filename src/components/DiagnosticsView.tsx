'use client';
import { useEffect, useState } from 'react';
export function DiagnosticsView() {
  const [status,setStatus]=useState<{environment:string;credentialsConfigured:boolean;webhookConfigured:boolean;lastPaymentVerifiedAt:string|null;storage:string}|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/paypal/status').then(r=>{if(!r.ok)throw new Error('Could not load diagnostics');return r.json();}).then(setStatus).catch(e=>setError(e.message));},[]);
  return <section className="bg-white border border-brand-100 rounded-2xl p-5 space-y-3 text-sm"><h2 className="font-bold text-lg">PayPal sandbox configuration</h2>{error&&<p role="alert">{error}</p>}{status?<><p>Environment: {status.environment}</p><p>Merchant credentials: {status.credentialsConfigured?'Configured':'Missing'}</p><p>Webhook ID: {status.webhookConfigured?'Configured':'Missing — register an HTTPS listener'}</p><p>Storage: {status.storage}</p><p>Last verified payment: {status.lastPaymentVerifiedAt?new Date(status.lastPaymentVerifiedAt).toLocaleString():'No payment verified yet'}</p><p className="text-slate-500">Configuration status does not prove connectivity. Only a signed event and matching PayPal payment details can mark a milestone paid. Sandbox collaborator payouts require verified payments and human approval.</p></>:<p>Loading configuration...</p>}</section>;
}
