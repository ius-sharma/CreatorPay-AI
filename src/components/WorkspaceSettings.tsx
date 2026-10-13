'use client';
import { useEffect, useState } from 'react';
import { card, field } from './FinanceUI';

type Settings = { name: string; editable: boolean; usage: { used: number; limit: number; remaining: number; resetsAt: string } };
export function WorkspaceSettings({ onName }: { onName?: (name: string) => void }) {
  const [data,setData] = useState<Settings | null>(null);
  const [name,setName] = useState('');
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const load = async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/workspace',{cache:'no-store',signal});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not read workspace settings.');
      if (signal?.aborted) return;
      setData(result); setName(current => data ? current : result.name); onName?.(result.name);
    } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Could not read settings.'); }
    finally { if (!signal?.aborted) setLoading(false); }
  };
  useEffect(() => { const controller=new AbortController(); void load(controller.signal); return()=>controller.abort(); },[]);
  const dirty = Boolean(data && name !== data.name);
  useEffect(() => {
    if (!dirty) return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[dirty]);
  const save = async (event:React.FormEvent) => {
    event.preventDefault(); if (busy || !data) return;
    setBusy(true);setError('');setMessage('');
    try {
      const response=await fetch('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || 'Could not save studio name.');
      setData({...data,name:result.name});setName(result.name);onName?.(result.name);setMessage('Studio name saved.');
    }catch(e){setError(e instanceof Error?e.message:'Could not save. Your entered name is still here.');}
    finally{setBusy(false);}
  };
  return <section className={`${card} p-6`} aria-label="Studio settings">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold">Your studio</h2><button onClick={()=>void load()} disabled={loading||busy} className="text-xs font-medium text-brand-700 disabled:opacity-50">{loading?'Checking…':'Refresh usage'}</button></div>
    {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {!data&&loading&&<p role="status" className="mt-4 text-sm text-slate-500">Loading studio settings…</p>}
    {data&&<><form onSubmit={save} className="mt-5"><label className="block text-xs text-slate-500">Studio name<input className={`${field} mt-2 block w-full`} value={name} maxLength={80} required disabled={busy||!data.editable} onChange={e=>{setName(e.target.value);setMessage('');}}/></label><p className="mt-2 text-xs leading-6 text-slate-500">Display name for your workspace. Your PayPal invoice business identity is managed separately.</p><button disabled={busy||loading||!data.editable||!dirty||!name.trim()} className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy?'Saving…':'Save studio name'}</button>{!data.editable&&<p className="mt-2 text-xs text-amber-800">Studio profile setup is pending.</p>}{message&&<p role="status" className="mt-3 text-sm">{message}</p>}</form>
    <div className="mt-6 border-t border-slate-200 pt-5"><div className="flex flex-wrap justify-between gap-3"><h3 className="text-sm font-semibold">Daily AI allowance</h3><span className="text-sm">{data.usage.used} / {data.usage.limit} used</span></div><progress aria-label="Daily AI requests used" value={Math.min(data.usage.used,data.usage.limit)} max={data.usage.limit} className="mt-3 h-2 w-full accent-orange-600"/><p className="mt-3 text-xs leading-6 text-slate-500">{data.usage.remaining} requests remaining. Resets {new Date(data.usage.resetsAt).toLocaleString()} (your local time).</p><p className="mt-2 text-xs leading-6 text-slate-500">Contract and deliverable reviews share this allowance. Reserved attempts count even if the AI provider fails. Requests are spaced 10 seconds apart; shared server capacity can also limit availability.</p></div></>}
  </section>;
}
