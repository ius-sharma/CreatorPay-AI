'use client';
import type { Deal } from '@/lib/types';
import type { WorkspaceView } from '@/lib/workspace-navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { card } from './FinanceUI';

export function WorkspaceSetup({deals,name,onNavigate,busy}:{deals:Deal[];name:string;onNavigate:(view:WorkspaceView)=>void;busy:boolean}) {
  const actual=deals.filter(deal=>!deal.demo);
  const steps: {label:string;description:string;done:boolean;view:WorkspaceView}[] = [
    {label:'Name your studio',description:'Make this workspace yours.',done:name!=='Creator workspace',view:'diagnostics'},
    {label:'Confirm a contract',description:'Review the AI-extracted terms.',done:actual.some(d=>Boolean(d.contractExtraction)),view:'new'},
    {label:'Receive a sandbox payment',description:'Use an invoice from a confirmed deal.',done:actual.some(d=>d.milestones.some(m=>m.status==='paid'&&Boolean(m.paymentVerifiedAt))),view:'deals'},
  ];
  const completed=steps.filter(step=>step.done).length;
  return <section className={`${card} mb-6 p-5`} aria-label="Workspace setup"><details open={completed<steps.length}><summary className="cursor-pointer text-sm font-semibold">{completed===steps.length?'Workspace basics complete':'Get your studio ready'} <span className="ml-2 text-xs font-normal text-slate-500">{completed} / {steps.length}</span></summary><p className="mt-3 text-xs leading-6 text-slate-500">This workspace uses the app’s shared PayPal sandbox merchant. Payments are test transactions.</p><ol className="mt-4 grid gap-3 md:grid-cols-3">{steps.map(step=><li key={step.label} className="rounded-lg border border-slate-200 p-4"><div className="flex items-center gap-2">{step.done&&<CheckCircle2 className="h-4 w-4 text-emerald-700" aria-label="Complete"/>}<h3 className="text-xs font-semibold">{step.label}</h3></div><p className="mt-2 text-xs leading-6 text-slate-500">{step.description}</p>{!step.done&&<button disabled={busy} onClick={()=>onNavigate(step.view)} className="mt-2 flex items-center gap-2 text-xs font-medium text-brand-700">{step.view==='diagnostics'?'Open studio settings':step.view==='new'?'Start a contract':'Open deals'}<ArrowRight size={13}/></button>}</li>)}</ol></details></section>;
}
